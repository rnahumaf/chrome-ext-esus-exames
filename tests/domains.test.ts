import { browser } from 'wxt/browser';
import { describe, expect, it, vi } from 'vitest';
import { originPattern, registerOrigin, scriptIdForOrigin } from '../src/domains';

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

  it('serializa ativações simultâneas sem registrar o mesmo ID duas vezes', async () => {
    const registered = new Set<string>();
    const getRegistered = vi.mocked(browser.scripting.getRegisteredContentScripts);
    const register = vi.mocked(browser.scripting.registerContentScripts);
    getRegistered.mockImplementation(async (filter) =>
      [...registered]
        .filter((id) => !filter?.ids || filter.ids.includes(id))
        .map((id) => ({ id, js: [], matches: [] })),
    );
    register.mockImplementation(async (scripts) => {
      await Promise.resolve();
      for (const script of scripts) {
        if (registered.has(script.id)) throw new Error(`Duplicate script ID '${script.id}'`);
        registered.add(script.id);
      }
    });

    const origin = 'https://esus.jaguariuna.sp.gov.br';
    await expect(Promise.all([registerOrigin(origin), registerOrigin(origin)])).resolves.toEqual([undefined, undefined]);
    expect(register).toHaveBeenCalledTimes(1);
  });
});
