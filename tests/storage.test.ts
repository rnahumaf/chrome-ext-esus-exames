import { describe, expect, it } from 'vitest';
import { createDefaultStore, dedupeItems, isAllowedOrigin, normalizeStore } from '../src/storage';

describe('armazenamento', () => {
  it('inicializa os seeds somente quando não existe estado válido', () => {
    expect(normalizeStore(undefined).presets).toHaveLength(4);
    const deletedAll = normalizeStore({
      schemaVersion: 1,
      seedsInitialized: true,
      presets: [],
      allowedOrigins: [],
    });
    expect(deletedAll.presets).toEqual([]);
  });

  it('preserva apenas origens HTTPS exatas e remove duplicatas', () => {
    const store = normalizeStore({
      ...createDefaultStore(),
      allowedOrigins: ['https://esus.exemplo.gov.br', 'https://esus.exemplo.gov.br', 'http://inseguro.test'],
    });
    expect(store.allowedOrigins).toEqual(['https://esus.exemplo.gov.br']);
    expect(isAllowedOrigin('https://esus.exemplo.gov.br')).toBe(true);
    expect(isAllowedOrigin('https://esus.exemplo.gov.br/caminho')).toBe(false);
  });

  it('deduplica exames pelo código mantendo a versão mais recente', () => {
    expect(
      dedupeItems([
        { sigtapCode: '0202020380', label: 'Hemograma' },
        { sigtapCode: '0202020380', label: 'Hemograma completo' },
      ]),
    ).toEqual([{ sigtapCode: '0202020380', label: 'Hemograma completo' }]);
  });
});
