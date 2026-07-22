import { browser } from 'wxt/browser';
import { getStore, isAllowedOrigin, updateStore } from './storage';

const SCRIPT_PREFIX = 'esus_presets_';
export const INJECTED_SCRIPT_FILE = 'esus-injected.js';

export function originPattern(origin: string): string {
  if (!isAllowedOrigin(origin)) throw new Error('Origem HTTPS inválida.');
  return `${origin}/*`;
}

export function scriptIdForOrigin(origin: string): string {
  let hash = 2166136261;
  for (let index = 0; index < origin.length; index += 1) {
    hash ^= origin.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${SCRIPT_PREFIX}${(hash >>> 0).toString(36)}`;
}

export async function registerOrigin(origin: string): Promise<void> {
  const matches = [originPattern(origin)];
  const id = scriptIdForOrigin(origin);
  const current = await browser.scripting.getRegisteredContentScripts({ ids: [id] });
  if (current.length) await browser.scripting.unregisterContentScripts({ ids: [id] });
  await browser.scripting.registerContentScripts([
    {
      id,
      js: [INJECTED_SCRIPT_FILE],
      matches,
      runAt: 'document_idle',
      persistAcrossSessions: true,
      world: 'ISOLATED',
    },
  ]);
}

export async function activateOrigin(origin: string): Promise<void> {
  await registerOrigin(origin);
  await updateStore((store) => ({
    ...store,
    allowedOrigins: [...new Set([...store.allowedOrigins, origin])].sort(),
  }));
}

export async function removeOrigin(origin: string): Promise<void> {
  const id = scriptIdForOrigin(origin);
  const registered = await browser.scripting.getRegisteredContentScripts({ ids: [id] });
  if (registered.length) await browser.scripting.unregisterContentScripts({ ids: [id] });
  await updateStore((store) => ({
    ...store,
    allowedOrigins: store.allowedOrigins.filter((item) => item !== origin),
  }));
  await browser.permissions.remove({ origins: [originPattern(origin)] });
}

export async function reconcileOrigins(): Promise<void> {
  const store = await getStore();
  const registered = await browser.scripting.getRegisteredContentScripts();
  const ours = registered.filter((script) => script.id.startsWith(SCRIPT_PREFIX));
  const wantedIds = new Set(store.allowedOrigins.map(scriptIdForOrigin));
  const stale = ours.filter((script) => !wantedIds.has(script.id)).map((script) => script.id);
  if (stale.length) await browser.scripting.unregisterContentScripts({ ids: stale });

  for (const origin of store.allowedOrigins) {
    const hasPermission = await browser.permissions.contains({ origins: [originPattern(origin)] });
    if (hasPermission) await registerOrigin(origin);
  }
}
