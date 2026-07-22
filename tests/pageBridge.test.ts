import { describe, expect, it, vi } from 'vitest';
import { PAGE_SELECT_EXAM_EVENT } from '../src/bridgeProtocol';
import { clickVisibleOptionByCode, installPageBridge } from '../src/pageBridge';

describe('ponte mínima com o mundo da página', () => {
  it('clica apenas na opção única com o código SIGTAP solicitado', () => {
    document.body.innerHTML = `
      <ul role="listbox">
        <li role="option">Hemograma completo Código 0202020380</li>
        <li role="option">Dosagem de glicose Código 0202010473</li>
      </ul>`;
    const target = document.querySelectorAll<HTMLElement>('[role="option"]')[1];
    const click = vi.spyOn(target, 'click');
    const uninstall = installPageBridge();

    document.dispatchEvent(new CustomEvent(PAGE_SELECT_EXAM_EVENT, { detail: '0202010473' }));

    expect(click).toHaveBeenCalledOnce();
    uninstall();
  });

  it('recusa códigos inválidos ou opções ambíguas', () => {
    document.body.innerHTML = `
      <ul role="listbox">
        <li role="option">Exame A Código 0202010473</li>
        <li role="option">Exame B Código 0202010473</li>
      </ul>`;
    expect(clickVisibleOptionByCode('inválido')).toBe(false);
    expect(clickVisibleOptionByCode('0202010473')).toBe(false);
  });
});
