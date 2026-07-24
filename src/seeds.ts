import type { ExamPreset } from './types';

const REVIEWED_AT = '2026-07-23';
const CREATED_AT = '2026-07-21T00:00:00.000Z';

export const SEED_PRESETS: ExamPreset[] = [
  {
    id: 'seed-uspstf-screening',
    name: 'Rastreios USPSTF',
    origin: 'seed',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    source: {
      title: 'U.S. Preventive Services Task Force — recomendações de rastreamento',
      url: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation-topics',
      reviewedAt: REVIEWED_AT,
    },
    items: [
      {
        sigtapCode: '0204030188',
        label: 'Mamografia bilateral para rastreamento',
        note: 'USPSTF: rastreamento bienal entre 40 e 74 anos.',
      },
      {
        sigtapCode: '0204060028',
        label: 'Densitometria ossea duo-energetica de coluna (vertebras lombares e/ou femur)',
        note: 'USPSTF: mulheres a partir de 65 anos; pós-menopausa abaixo de 65 se risco aumentado.',
      },
      {
        sigtapCode: '0209010029',
        label: 'Colonoscopia (coloscopia)',
        note: 'Uma das estratégias de rastreamento colorretal entre 45 e 75 anos; intervalo usual de 10 anos.',
      },
      {
        sigtapCode: '0202040143',
        label: 'Pesquisa de sangue oculto nas fezes',
        note: 'Alternativa à colonoscopia para rastreamento colorretal; testes de alta sensibilidade são anuais.',
      },
      {
        sigtapCode: '0206020031',
        label: 'Tomografia computadorizada de tórax',
        note: 'USPSTF: TC de baixa dose anual entre 50 e 80 anos, ≥20 maços-ano, tabagismo atual ou cessado há menos de 15 anos.',
      },
      {
        sigtapCode: '0202030105',
        label: 'Dosagem de antigeno prostatico especifico (PSA)',
        note: 'USPSTF: decisão individual entre 55 e 69 anos; recomendação em atualização.',
      },
    ],
  },
  {
    id: 'seed-hiperdia',
    name: 'Hiperdia e alto custo',
    origin: 'seed',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    items: [
      { sigtapCode: '0202010295', label: 'Dosagem de colesterol total' },
      { sigtapCode: '0202010279', label: 'Dosagem de colesterol HDL' },
      { sigtapCode: '0202010287', label: 'Dosagem de colesterol LDL' },
      { sigtapCode: '0202010678', label: 'Dosagem de triglicerideos' },
      { sigtapCode: '0202010325', label: 'Dosagem de creatinofosfoquinase (CPK)' },
      { sigtapCode: '0202060250', label: 'Dosagem de hormonio tireoestimulante (TSH)' },
      { sigtapCode: '0202010600', label: 'Dosagem de potassio' },
      { sigtapCode: '0202010317', label: 'Dosagem de creatinina' },
      { sigtapCode: '0202020380', label: 'Hemograma completo' },
      { sigtapCode: '0202050017', label: 'Analise de caracteres fisicos, elementos e sedimento da urina' },
      { sigtapCode: '0202050092', label: 'Dosagem de microalbumina na urina', note: 'Usar amostra isolada conforme protocolo local.' },
      { sigtapCode: '0202010473', label: 'Dosagem de glicose' },
      { sigtapCode: '0202010503', label: 'Dosagem de hemoglobina glicosilada' },
      { sigtapCode: '0202010643', label: 'Dosagem de transaminase glutamico-oxalacetica (TGO)' },
      { sigtapCode: '0202010651', label: 'Dosagem de transaminase glutamico-piruvica (TGP)' },
      { sigtapCode: '0202010708', label: 'Dosagem de vitamina B12' },
    ],
  },
  {
    id: 'seed-serologies',
    name: 'Infecto',
    origin: 'seed',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    items: [
      {
        sigtapCode: '0202031500',
        label: 'Pesquisa laboratorial de antígenos de HIV e/ou anticorpos ANTI-HIV-1 ou anti-hiv-2 para população geral (exceto gestante, parceiro ou parceria)',
        searchTerms: ['HIV'],
      },
      {
        sigtapCode: '0202031110',
        label: 'Teste não treponemico p/ detecção de sifilis para população geral (exceto gestante, parceiro ou parceria)',
        searchTerms: ['VDRL'],
        note: 'Inclui VDRL, RPR, TRUST ou USR.',
      },
      {
        sigtapCode: '0202031446',
        label: 'Pesquisa laboratorial de antígeno de superfície do vírus da hepatite b (hbsag) para população geral (exceto gestante, parceiro ou parceria)',
        searchTerms: ['HBsAg'],
      },
      {
        sigtapCode: '0202031470',
        label: 'Pesquisa laboratorial de anticorpos contra o vírus da hepatite c (anti-hcv) para população geral (exceto gestante, parceiro ou parceria)',
        searchTerms: ['anti-HCV'],
      },
      {
        sigtapCode: '0202080048',
        label: 'Baciloscopia direta p/ BAAR tuberculose (diagnóstica)',
        searchTerms: ['BAAR'],
        note: 'Investigar tosse por 3 semanas ou mais; considerar critérios específicos em populações especiais.',
      },
      {
        sigtapCode: '0202030857',
        label: 'Pesquisa de anticorpos IgM anticitomegalovirus',
        searchTerms: ['citomegalovirus'],
      },
      {
        sigtapCode: '0202030741',
        label: 'Pesquisa de anticorpos IgG anticitomegalovirus',
        searchTerms: ['citomegalovirus'],
      },
      {
        sigtapCode: '0202030946',
        label: 'Pesquisa de anticorpos IgM contra o virus epstein-barr',
        searchTerms: ['epstein barr'],
      },
      {
        sigtapCode: '0202030830',
        label: 'Pesquisa de anticorpos IgG contra o virus epstein-barr',
        searchTerms: ['epstein barr'],
      },
      {
        sigtapCode: '0202030881',
        label: 'Pesquisa de anticorpos IgM antitrypanosoma cruzi',
        searchTerms: ['trypanosoma'],
      },
      {
        sigtapCode: '0202030776',
        label: 'Pesquisa de anticorpos IgG antitrypanosoma cruzi',
        searchTerms: ['trypanosoma'],
      },
      {
        sigtapCode: '0202030873',
        label: 'Pesquisa de anticorpos IgM antitoxoplasma',
        searchTerms: ['toxoplasma'],
      },
      {
        sigtapCode: '0202030768',
        label: 'Pesquisa de anticorpos IgG antitoxoplasma',
        searchTerms: ['toxoplasma'],
      },
      {
        sigtapCode: '0202030954',
        label: 'Pesquisa de anticorpos IgM contra o virus herpes simples',
        searchTerms: ['herpes'],
      },
      {
        sigtapCode: '0202030849',
        label: 'Pesquisa de anticorpos IgG contra o virus herpes simples',
        searchTerms: ['herpes'],
      },
    ],
  },
  {
    id: 'seed-hepatogram',
    name: 'Hepatograma',
    origin: 'seed',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    items: [
      {
        sigtapCode: '0202010643',
        label: 'Dosagem de transaminase glutamico-oxalacetica (TGO)',
        searchTerms: ['transaminase glutamico-oxalacetica'],
      },
      {
        sigtapCode: '0202010651',
        label: 'Dosagem de transaminase glutamico-piruvica (TGP)',
        searchTerms: ['transaminase glutamico-piruvica'],
      },
      {
        sigtapCode: '0202020029',
        label: 'Contagem de plaquetas',
        searchTerms: ['plaquetas'],
      },
      {
        sigtapCode: '0202010627',
        label: 'Dosagem de proteinas totais e fracoes',
        searchTerms: ['proteinas totais'],
      },
      {
        sigtapCode: '0202010635',
        label: 'Dosagem de sodio',
        searchTerms: ['sodio'],
      },
      {
        sigtapCode: '0202010201',
        label: 'Dosagem de bilirrubina total e fracoes',
        searchTerms: ['bilirrubina'],
      },
      {
        sigtapCode: '0202020142',
        label: 'Determinação de tempo e atividade da protrombina (TAP)',
        searchTerms: ['TAP'],
      },
      {
        sigtapCode: '0202010317',
        label: 'Dosagem de creatinina',
        searchTerms: ['creatinina'],
      },
      {
        sigtapCode: '0202030091',
        label: 'Dosagem de alfa-fetoproteina',
        searchTerms: ['alfa-fetoproteina'],
      },
      {
        sigtapCode: '0202030580',
        label: 'Pesquisa de anticorpos antimusculo liso',
        searchTerms: ['musculo liso'],
      },
      {
        sigtapCode: '0202030555',
        label: 'Pesquisa de anticorpos antimicrossomas',
        searchTerms: ['microssoma'],
      },
    ],
  },
];

export function cloneSeedPresets(): ExamPreset[] {
  return structuredClone(SEED_PRESETS);
}
