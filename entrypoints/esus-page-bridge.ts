import { installPageBridge } from '@/src/pageBridge';

const BRIDGE_FLAG = '__ESUS_PRESETS_PAGE_BRIDGE_V1__';

export default defineUnlistedScript(() => {
  const pageWindow = window as unknown as Record<string, unknown>;
  if (pageWindow[BRIDGE_FLAG]) return;
  pageWindow[BRIDGE_FLAG] = true;
  installPageBridge();
});
