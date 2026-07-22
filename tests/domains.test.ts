import { describe, expect, it } from 'vitest';
import { originPattern, scriptIdForOrigin } from '../src/domains';

describe('domínios configuráveis', () => {
  it('gera padrão e identificador estável por origem', () => {
    const origin = 'https://esus.jaguariuna.sp.gov.br';
    expect(originPattern(origin)).toBe(`${origin}/*`);
    expect(scriptIdForOrigin(origin)).toBe(scriptIdForOrigin(origin));
    expect(scriptIdForOrigin(origin)).not.toBe(scriptIdForOrigin('https://outro.example'));
  });

  it('recusa origens não HTTPS', () => {
    expect(() => originPattern('http://inseguro.example')).toThrow('Origem HTTPS inválida');
  });
});
