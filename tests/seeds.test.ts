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

  it('usa os procedimentos atuais de sorologia para população geral', () => {
    const serologies = SEED_PRESETS.find((preset) => preset.id === 'seed-serologies')!;
    expect(serologies.items.map(({ sigtapCode, searchTerms }) => ({ sigtapCode, searchTerms }))).toEqual([
      { sigtapCode: '0202031500', searchTerms: ['HIV'] },
      { sigtapCode: '0202031110', searchTerms: ['VDRL'] },
      { sigtapCode: '0202031446', searchTerms: ['HBsAg'] },
      { sigtapCode: '0202031470', searchTerms: ['anti-HCV'] },
    ]);
  });
});
