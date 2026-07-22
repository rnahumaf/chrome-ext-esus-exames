import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SidebarApp } from '@/src/components/SidebarApp';
import { findExamDialog, findNativeSidebar } from '@/src/domAdapter';
import { SIDEBAR_STYLES } from '@/src/sidebarStyles';

const HOST_ID = 'esus-presets-extension-root';

export default defineUnlistedScript(() => {
  if ((globalThis as any).__ESUS_PRESETS_STARTED__) return;
  (globalThis as any).__ESUS_PRESETS_STARTED__ = true;

  let mounted: { dialog: HTMLElement; host: HTMLElement; root: Root } | undefined;
  let scheduled = false;

  const unmount = () => {
    mounted?.root.unmount();
    mounted?.host.remove();
    mounted = undefined;
  };

  const scan = () => {
    scheduled = false;
    if (mounted && (!mounted.dialog.isConnected || !mounted.host.isConnected)) unmount();
    const dialog = findExamDialog();
    if (!dialog || mounted?.dialog === dialog) return;
    if (mounted) unmount();
    const sidebar = findNativeSidebar(dialog);
    if (!sidebar) return;

    const existing = sidebar.querySelector<HTMLElement>(`#${HOST_ID}`);
    existing?.remove();
    const host = document.createElement('div');
    host.id = HOST_ID;
    host.dataset.extension = 'presets-exames-esus';
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = SIDEBAR_STYLES;
    const mountPoint = document.createElement('div');
    shadow.append(style, mountPoint);
    sidebar.append(host);
    const root = createRoot(mountPoint);
    root.render(<SidebarApp dialog={dialog} />);
    mounted = { dialog, host, root };
  };

  const scheduleScan = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(scan);
  };

  const observer = new MutationObserver(scheduleScan);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('popstate', scheduleScan);
  scheduleScan();
});
