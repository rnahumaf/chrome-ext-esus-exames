import { activateOrigin, reconcileOrigins, removeOrigin } from '@/src/domains';
import type { RuntimeMessage } from '@/src/types';

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => void reconcileOrigins());
  browser.runtime.onStartup.addListener(() => void reconcileOrigins());
  void reconcileOrigins();

  browser.runtime.onMessage.addListener((message: RuntimeMessage) => {
    if (message.type === 'ACTIVATE_ORIGIN') return activateOrigin(message.origin);
    if (message.type === 'REMOVE_ORIGIN') return removeOrigin(message.origin);
    if (message.type === 'RECONCILE_ORIGINS') return reconcileOrigins();
    return undefined;
  });
});
