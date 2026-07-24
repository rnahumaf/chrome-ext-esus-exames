import { browser } from 'wxt/browser';
import { cloneSeedPresets } from './seeds';
import type { ExamPreset, ExtensionStore } from './types';

export const STORE_KEY = 'extensionStore';

export function createDefaultStore(): ExtensionStore {
  return {
    schemaVersion: 4,
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

  const currentItems = new Map(current.items.map((item) => [item.sigtapCode, item]));
  const replacementCodes = new Map([
    ['0202030300', '0202031500'],
    ['0202031110', '0202031110'],
    ['0202030970', '0202031446'],
    ['0202030679', '0202031470'],
  ]);

  return presets.map((preset) => {
    if (preset.id !== 'seed-serologies') return preset;
    return {
      ...preset,
      items: preset.items.map((item) => {
        const replacementCode = replacementCodes.get(item.sigtapCode);
        const replacement = replacementCode ? currentItems.get(replacementCode) : undefined;
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

function mergeRequiredItems(
  requiredItems: ExamPreset['items'],
  existingItems: ExamPreset['items'],
): ExamPreset['items'] {
  const existingByCode = new Map(existingItems.map((item) => [item.sigtapCode, item]));
  const requiredCodes = new Set(requiredItems.map((item) => item.sigtapCode));
  const required = requiredItems.map((item) => {
    const existing = existingByCode.get(item.sigtapCode);
    return existing?.note === undefined ? { ...item } : { ...item, note: existing.note };
  });
  const personal = dedupeItems(existingItems).filter((item) => !requiredCodes.has(item.sigtapCode));
  return [...required, ...personal];
}

function migratePresetOrganization(presets: ExamPreset[]): ExamPreset[] {
  if (!presets.length) return presets;

  const seeds = cloneSeedPresets();
  const infectoSeed = seeds.find((preset) => preset.id === 'seed-serologies');
  const hepatogramSeed = seeds.find((preset) => preset.id === 'seed-hepatogram');
  if (!infectoSeed || !hepatogramSeed) return presets;

  const infectoExisting = presets.find((preset) => preset.id === 'seed-serologies');
  const tuberculosisExisting = presets.find((preset) => preset.id === 'seed-tuberculosis');
  const hepatogramExisting = presets.find((preset) => preset.id === 'seed-hepatogram');
  const updatedAt = new Date().toISOString();

  const infecto: ExamPreset = {
    ...(infectoExisting ?? infectoSeed),
    name:
      !infectoExisting || infectoExisting.name === 'Sorologias'
        ? infectoSeed.name
        : infectoExisting.name,
    items: mergeRequiredItems(infectoSeed.items, [
      ...(infectoExisting?.items ?? []),
      ...(tuberculosisExisting?.items ?? []),
    ]),
    updatedAt,
  };
  const hepatogram: ExamPreset = {
    ...(hepatogramExisting ?? hepatogramSeed),
    items: mergeRequiredItems(hepatogramSeed.items, hepatogramExisting?.items ?? []),
    updatedAt,
  };

  const migrated: ExamPreset[] = [];
  let infectoInserted = false;
  let hepatogramInserted = false;
  for (const preset of presets) {
    if (preset.id === 'seed-serologies') {
      migrated.push(infecto);
      infectoInserted = true;
    } else if (preset.id === 'seed-tuberculosis') {
      if (!infectoInserted) {
        migrated.push(infecto);
        infectoInserted = true;
      }
    } else if (preset.id === 'seed-hepatogram') {
      migrated.push(hepatogram);
      hepatogramInserted = true;
    } else {
      migrated.push(preset);
    }
  }
  if (!infectoInserted) migrated.push(infecto);
  if (!hepatogramInserted) migrated.push(hepatogram);
  return migrated;
}

export function normalizeStore(raw: unknown): ExtensionStore {
  if (!raw || typeof raw !== 'object') return createDefaultStore();
  const value = raw as Partial<ExtensionStore>;
  const schemaVersion = (raw as { schemaVersion?: number }).schemaVersion;
  const presets = Array.isArray(value.presets) ? value.presets.filter(isPreset) : [];
  const allowedOrigins = Array.isArray(value.allowedOrigins)
    ? [...new Set(value.allowedOrigins.filter((origin): origin is string => isAllowedOrigin(origin)))]
    : [];

  if (schemaVersion === 1 || schemaVersion === 2) {
    const migratedPresets = migrateLegacySerologies(presets);
    return {
      schemaVersion: 4,
      seedsInitialized: value.seedsInitialized !== false,
      presets:
        migratedPresets.length === 0
          ? cloneSeedPresets()
          : migratePresetOrganization(migratedPresets),
      allowedOrigins,
    };
  }

  if (schemaVersion === 3) {
    return {
      schemaVersion: 4,
      seedsInitialized: value.seedsInitialized !== false,
      presets:
        value.seedsInitialized === false && presets.length === 0
          ? cloneSeedPresets()
          : migratePresetOrganization(presets),
      allowedOrigins,
    };
  }

  if (schemaVersion !== 4) {
    return {
      ...createDefaultStore(),
      presets: presets.length ? migratePresetOrganization(presets) : cloneSeedPresets(),
      allowedOrigins,
    };
  }

  return {
    schemaVersion: 4,
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
