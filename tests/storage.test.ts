import { describe, expect, it } from 'vitest';
import { createDefaultStore, dedupeItems, isAllowedOrigin, normalizeStore } from '../src/storage';

describe('armazenamento', () => {
  it('inicializa os seeds somente quando não existe estado válido', () => {
    expect(normalizeStore(undefined).presets).toHaveLength(4);
    const deletedAll = normalizeStore({
      schemaVersion: 2,
      seedsInitialized: true,
      presets: [],
      allowedOrigins: [],
    });
    expect(deletedAll.presets).toEqual([]);
  });

  it('migra os itens legados de sorologia e preserva personalizações', () => {
    const migrated = normalizeStore({
      schemaVersion: 1,
      seedsInitialized: true,
      allowedOrigins: ['https://esus.exemplo.gov.br'],
      presets: [
        {
          id: 'seed-serologies',
          name: 'Minhas sorologias',
          origin: 'seed',
          createdAt: '2026-07-21T00:00:00.000Z',
          updatedAt: '2026-07-21T00:00:00.000Z',
          items: [
            { sigtapCode: '0202030300', label: 'HIV antigo', note: 'nota antiga' },
            { sigtapCode: '9999999999', label: 'Item pessoal' },
          ],
        },
      ],
    });

    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.presets[0].name).toBe('Minhas sorologias');
    expect(migrated.presets[0].items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sigtapCode: '0202031500', searchTerms: ['HIV'], note: 'nota antiga' }),
        { sigtapCode: '9999999999', label: 'Item pessoal' },
      ]),
    );
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
