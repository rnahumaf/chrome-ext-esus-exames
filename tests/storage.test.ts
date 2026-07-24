import { describe, expect, it } from 'vitest';
import { createDefaultStore, dedupeItems, isAllowedOrigin, normalizeStore } from '../src/storage';

describe('armazenamento', () => {
  it('inicializa os seeds somente quando não existe estado válido', () => {
    expect(normalizeStore(undefined).presets).toHaveLength(4);
    const deletedAll = normalizeStore({
      schemaVersion: 4,
      seedsInitialized: true,
      presets: [],
      allowedOrigins: [],
    });
    expect(deletedAll.presets).toEqual([]);
  });

  it('migra somente os itens legados de sorologia e preserva personalizações', () => {
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

    expect(migrated.schemaVersion).toBe(4);
    expect(migrated.presets[0].name).toBe('Minhas sorologias');
    expect(migrated.presets[0].items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sigtapCode: '0202031500', searchTerms: ['HIV'], note: 'nota antiga' }),
        { sigtapCode: '9999999999', label: 'Item pessoal' },
      ]),
    );
    expect(migrated.presets[0].items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sigtapCode: '0202080048' }),
        expect.objectContaining({ sigtapCode: '0202030857' }),
        expect.objectContaining({ sigtapCode: '0202030849' }),
      ]),
    );
  });

  it('recupera os grupos padrão ao migrar um estado vazio da versão 2', () => {
    const migrated = normalizeStore({
      schemaVersion: 2,
      seedsInitialized: true,
      presets: [],
      allowedOrigins: ['https://esus.exemplo.gov.br'],
    });

    expect(migrated.schemaVersion).toBe(4);
    expect(migrated.presets.map((preset) => preset.id)).toEqual([
      'seed-uspstf-screening',
      'seed-hiperdia',
      'seed-serologies',
      'seed-hepatogram',
    ]);
    expect(migrated.allowedOrigins).toEqual(['https://esus.exemplo.gov.br']);
  });

  it('migra a versão 3, incorpora tuberculose no Infecto e adiciona Hepatograma', () => {
    const migrated = normalizeStore({
      schemaVersion: 3,
      seedsInitialized: true,
      allowedOrigins: [],
      presets: [
        {
          id: 'seed-serologies',
          name: 'Sorologias',
          origin: 'seed',
          createdAt: '2026-07-21T00:00:00.000Z',
          updatedAt: '2026-07-21T00:00:00.000Z',
          items: [
            { sigtapCode: '0202031500', label: 'HIV', note: 'manter esta nota' },
            { sigtapCode: '9999999999', label: 'Item pessoal' },
          ],
        },
        {
          id: 'seed-tuberculosis',
          name: 'Investigação de tuberculose',
          origin: 'seed',
          createdAt: '2026-07-21T00:00:00.000Z',
          updatedAt: '2026-07-21T00:00:00.000Z',
          items: [
            { sigtapCode: '0202080048', label: 'BAAR', note: 'nota personalizada' },
          ],
        },
      ],
    });

    expect(migrated.schemaVersion).toBe(4);
    expect(migrated.presets.map((preset) => preset.id)).toEqual([
      'seed-serologies',
      'seed-hepatogram',
    ]);
    expect(migrated.presets[0].name).toBe('Infecto');
    expect(migrated.presets[0].items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sigtapCode: '0202031500', note: 'manter esta nota' }),
        expect.objectContaining({ sigtapCode: '0202080048', note: 'nota personalizada' }),
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
