import type { ExamItem } from './types';

const SHORT_LABELS: Record<string, string> = {
  '0204030188': 'Mamografia',
  '0204060028': 'DMO (coluna/fêmur)',
  '0209010029': 'Colonoscopia',
  '0202040143': 'PSOF',
  '0206020031': 'TC de tórax (baixa dose)',
  '0202030105': 'PSA',
  '0202010295': 'Colesterol total',
  '0202010279': 'HDL',
  '0202010287': 'LDL',
  '0202010678': 'Triglicerídeos',
  '0202010325': 'CPK',
  '0202060250': 'TSH',
  '0202010600': 'Potássio',
  '0202010317': 'Creatinina',
  '0202020380': 'Hemograma',
  '0202050017': 'EAS',
  '0202050092': 'Microalbuminúria',
  '0202010473': 'Glicemia',
  '0202010503': 'HbA1c',
  '0202010643': 'TGO',
  '0202010651': 'TGP',
  '0202010708': 'Vitamina B12',
  '0202031500': 'HIV 1/2',
  '0202031110': 'VDRL',
  '0202031446': 'HBsAg',
  '0202031470': 'Anti-HCV',
  '0202080048': 'BAAR',
};

function compactOfficialLabel(label: string): string {
  const compact = label
    .replace(/^dosagem de /i, '')
    .replace(/^pesquisa de /i, '')
    .replace(/^an[aá]lise de /i, '')
    .replace(/\s+/g, ' ')
    .trim();
  const capitalized = compact ? `${compact[0].toLocaleUpperCase('pt-BR')}${compact.slice(1)}` : label;
  return capitalized.length > 42 ? `${capitalized.slice(0, 39).trimEnd()}…` : capitalized;
}

export function examDisplayLabel(item: ExamItem): string {
  return SHORT_LABELS[item.sigtapCode] ?? compactOfficialLabel(item.label);
}
