import { describe, expect, it } from 'vitest';
import { SEED_PRESETS } from '../src/seeds';

describe('presets iniciais', () => {
  it('cria quatro grupos editáveis com códigos SIGTAP únicos dentro de cada grupo', () => {
    expect(SEED_PRESETS).toHaveLength(4);
    for (const preset of SEED_PRESETS) {
      expect(preset.origin).toBe('seed');
      expect(preset.items.length).toBeGreaterThan(0);
      const codes = preset.items.map((item) => item.sigtapCode);
      expect(new Set(codes).size).toBe(codes.length);
      expect(codes.every((code) => /^\d{10}$/.test(code))).toBe(true);
    }
  });

  it('expande colesterol e transaminases no grupo Hiperdia', () => {
    const hiperdia = SEED_PRESETS.find((preset) => preset.id === 'seed-hiperdia')!;
    expect(hiperdia.items.map((item) => item.sigtapCode)).toEqual(
      expect.arrayContaining(['0202010295', '0202010279', '0202010287', '0202010643', '0202010651']),
    );
  });

  it('reúne sorologias e BAAR no grupo Infecto', () => {
    const infecto = SEED_PRESETS.find((preset) => preset.id === 'seed-serologies')!;
    expect(infecto.name).toBe('Infecto');
    expect(infecto.items.map(({ sigtapCode }) => sigtapCode)).toEqual([
      '0202031500',
      '0202031110',
      '0202031446',
      '0202031470',
      '0202080048',
      '0202030857',
      '0202030741',
      '0202030946',
      '0202030830',
      '0202030881',
      '0202030776',
      '0202030873',
      '0202030768',
      '0202030954',
      '0202030849',
    ]);
    expect(SEED_PRESETS.some((preset) => preset.id === 'seed-tuberculosis')).toBe(false);
  });

  it('cria o hepatograma com os onze procedimentos solicitados', () => {
    const hepatogram = SEED_PRESETS.find((preset) => preset.id === 'seed-hepatogram')!;
    expect(hepatogram.items.map(({ sigtapCode }) => sigtapCode)).toEqual([
      '0202010643',
      '0202010651',
      '0202020029',
      '0202010627',
      '0202010635',
      '0202010201',
      '0202020142',
      '0202010317',
      '0202030091',
      '0202030580',
      '0202030555',
    ]);
  });
});
