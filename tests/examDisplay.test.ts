import { describe, expect, it } from 'vitest';
import { examDisplayLabel } from '../src/examDisplay';

describe('rótulos compactos de exames', () => {
  it('usa abreviaturas conhecidas sem alterar o nome oficial', () => {
    const item = {
      sigtapCode: '0202010503',
      label: 'Dosagem de hemoglobina glicosilada',
    };
    expect(examDisplayLabel(item)).toBe('HbA1c');
    expect(item.label).toBe('Dosagem de hemoglobina glicosilada');
  });

  it('compacta e limita nomes de exames criados pelo usuário', () => {
    expect(examDisplayLabel({ sigtapCode: '9999999999', label: 'Dosagem de ferritina' })).toBe('Ferritina');
    expect(
      examDisplayLabel({
        sigtapCode: '9999999998',
        label: 'Pesquisa de um exame com uma descrição oficial muito extensa para caber na lateral',
      }),
    ).toHaveLength(40);
  });
});
