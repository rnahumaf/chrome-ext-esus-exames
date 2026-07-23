import { browser } from 'wxt/browser';
import { cloneSeedPresets } from './seeds';
import type { ExamPreset, ExtensionStore } from './types';

export const STORE_KEY = 'extensionStore';

export function createDefaultStore(): ExtensionStore {
  return {
    schemaVersion: 2,
    seedsInitialized: true,
    presets: cloneSeedPresets(),
    allowedOrigins: [],
  };
}

function isPreset(value: unknown): value is ExamPreset {
  if (!value || typeof value !== 'object') return false;
  const preset = value as Partial<ExamPreset>;
  return (
    typeof preset.id === 'string' &&
    typeof preset.name === 'string' &&
    Array.isArray(preset.items) &&
    preset.items.every(
      (item) =>
        item &&
        typeof item.sigtapCode === 'string' &&
        /^\d{10}$/.test(item.sigtapCode) &&
        typeof item.label === 'string' &&
        (item.searchTerms === undefined ||
          (Array.isArray(item.searchTerms) && item.searchTerms.every((term) => typeof term === 'string'))),
    )
  );
}

function migrateLegacySerologies(presets: ExamPreset[]): ExamPreset[] {
  const current = cloneSeedPresets().find((preset) => preset.id === 'seed-serologies');
  if (!current) return presets;

  const replacements = new Map([
    ['0202030300', current.items[0]],
    ['0202031110', current.items[1]],
    ['0202030970', current.items[2]],
    ['0202030679', current.items[3]],
  ]);

  return presets.map((preset) => {
    if (preset.id !== 'seed-serologies') return preset;
    return {
      ...preset,
      items: preset.items.map((item) => {
        const replacement = replacements.get(item.sigtapCode);
        return replacement
          ? {
              ...item,
              sigtapCode: replacement.sigtapCode,
              label: replacement.label,
              searchTerms: replacement.searchTerms,
            }
          : item;
      }),
      updatedAt: new Date().toISOString(),
    };
  });
}

export function normalizeStore(raw: unknown): ExtensionStore {
  if (!raw || typeof raw !== 'object') return createDefaultStore();
  const value = raw as Partial<ExtensionStore>;
  const schemaVersion = (raw as { schemaVersion?: number }).schemaVersion;
  const presets = Array.isArray(value.presets) ? value.presets.filter(isPreset) : [];
  const allowedOrigins = Array.isArray(value.allowedOrigins)
    ? [...new Set(value.allowedOrigins.filter((origin): origin is string => isAllowedOrigin(origin)))]
    : [];

  if (schemaVersion === 1) {
    return {
      schemaVersion: 2,
      seedsInitialized: value.seedsInitialized !== false,
      presets:
        value.seedsInitialized === false && presets.length === 0
          ? cloneSeedPresets()
          : migrateLegacySerologies(presets),
      allowedOrigins,
    };
  }

  if (schemaVersion !== 2) {
    return {
      ...createDefaultStore(),
      presets: presets.length ? presets : cloneSeedPresets(),
      allowedOrigins,
    };
  }

  return {
    schemaVersion: 2,
    seedsInitialized: value.seedsInitialized !== false,
    presets: value.seedsInitialized === false && presets.length === 0 ? cloneSeedPresets() : presets,
    allowedOrigins,
  };
}

export function isAllowedOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.origin === value && !url.username && !url.password;
  } catch {
    return false;
  }
}

export async function getStore(): Promise<ExtensionStore> {
  const stored = await browser.storage.local.get(STORE_KEY);
  const normalized = normalizeStore(stored[STORE_KEY]);
  if (JSON.stringify(stored[STORE_KEY]) !== JSON.stringify(normalized)) {
    await browser.storage.local.set({ [STORE_KEY]: normalized });
  }
  return normalized;
}

export async function saveStore(store: ExtensionStore): Promise<void> {
  await browser.storage.local.set({ [STORE_KEY]: normalizeStore(store) });
}

export async function updateStore(
  mutate: (current: ExtensionStore) => ExtensionStore,
): Promise<ExtensionStore> {
  const current = await getStore();
  const next = normalizeStore(mutate(structuredClone(current)));
  await saveStore(next);
  return next;
}

export async function savePreset(preset: ExamPreset): Promise<ExtensionStore> {
  return updateStore((store) => {
    const index = store.presets.findIndex((item) => item.id === preset.id);
    if (index >= 0) store.presets[index] = preset;
    else store.presets.push(preset);
    return store;
  });
}

export async function deletePreset(id: string): Promise<ExtensionStore> {
  return updateStore((store) => ({
    ...store,
    presets: store.presets.filter((preset) => preset.id !== id),
  }));
}

export function newPreset(name: string, items: ExamPreset['items']): ExamPreset {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    items: dedupeItems(items),
    origin: 'user',
    createdAt: now,
    updatedAt: now,
  };
}

export function dedupeItems(items: ExamPreset['items']): ExamPreset['items'] {
  const byCode = new Map<string, ExamPreset['items'][number]>();
  for (const item of items) byCode.set(item.sigtapCode, { ...item });
  return [...byCode.values()];
}
