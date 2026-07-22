import { describe, expect, it } from 'vitest';
import {
  addExam,
  findExamDialog,
  findNativeSidebar,
  getSelectedExams,
  normalizeText,
  removeExam,
} from '../src/domAdapter';

function fixture() {
  document.body.innerHTML = `
    <div role="dialog" class="css-random-${Math.random()}">
      <div class="sidebar-random">
        <div><h5>Grupo de exames</h5></div>
        <button>Gestação 1º trimestre</button>
      </div>
      <div class="form-random">
        <h1>Solicitar exame comum</h1>
        <label id="generated-label">Exames*</label>
        <div role="combobox" aria-labelledby="generated-label"><input name="exame" /></div>
        <div id="selected"></div>
        <label>CID 10</label>
        <textarea name="justificativa"></textarea>
        <button>Salvar</button>
      </div>
    </div>`;
  return findExamDialog()!;
}

describe('adaptador semântico do e-SUS', () => {
  it('localiza modal e sidebar sem depender de classes geradas', () => {
    const dialog = fixture();
    expect(dialog).toBeTruthy();
    expect(findNativeSidebar(dialog)?.className).toBe('sidebar-random');
    expect(normalizeText('  HEMOGRÁMA   Completo ')).toBe('hemograma completo');
  });

  it('captura somente linhas selecionadas no formato nome - código', () => {
    const dialog = fixture();
    dialog.querySelector('#selected')!.innerHTML = `
      <div><div>HEMOGRAMA COMPLETO - 0202020380</div><button aria-label="Excluir"></button></div>`;
    expect(getSelectedExams(dialog)).toEqual([
      { label: 'HEMOGRAMA COMPLETO', sigtapCode: '0202020380' },
    ]);
  });

  it('pesquisa, seleciona, confirma e remove por código sem salvar o formulário', async () => {
    const dialog = fixture();
    const input = dialog.querySelector<HTMLInputElement>('input[name="exame"]')!;
    const save = dialog.querySelector<HTMLButtonElement>('button:last-child')!;
    let saveClicks = 0;
    save.addEventListener('click', () => saveClicks += 1);

    input.addEventListener('input', () => {
      document.querySelector('[role="listbox"]')?.remove();
      const list = document.createElement('div');
      list.setAttribute('role', 'listbox');
      const option = document.createElement('div');
      option.setAttribute('role', 'option');
      option.textContent = 'Hemograma completo Código 0202020380';
      option.addEventListener('mousedown', () => {
        dialog.querySelector('#selected')!.innerHTML = `
          <div class="row"><div>HEMOGRAMA COMPLETO - 0202020380</div><button aria-label="Excluir"></button></div>`;
        dialog.querySelector<HTMLButtonElement>('.row button')!.addEventListener('click', () => {
          dialog.querySelector('.row')?.remove();
        });
        list.remove();
      });
      list.append(option);
      document.body.append(list);
    });

    const item = { sigtapCode: '0202020380', label: 'Hemograma completo' };
    await expect(addExam(dialog, item)).resolves.toMatchObject({ status: 'added' });
    expect(input.value).toBe('Hemograma completo');
    expect(getSelectedExams(dialog)).toHaveLength(1);
    await expect(removeExam(dialog, item)).resolves.toMatchObject({ status: 'removed' });
    expect(getSelectedExams(dialog)).toHaveLength(0);
    expect(saveClicks).toBe(0);
  });
});
