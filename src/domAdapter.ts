import type { ApplyResult, ExamItem } from './types';

const CODE_PATTERN = /\b(\d{10})\b/;
const SELECTED_PATTERN = /^(.+?)\s+-\s+(\d{10})$/;

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

export function findExamDialog(root: ParentNode = document): HTMLElement | null {
  const dialogs = Array.from(root.querySelectorAll<HTMLElement>('[role="dialog"]'));
  return (
    dialogs.find((dialog) => {
      const heading = Array.from(dialog.querySelectorAll('h1')).find(
        (item) => normalizeText(item.textContent ?? '') === 'solicitar exame comum',
      );
      return Boolean(heading && dialog.querySelector('input[name="exame"]'));
    }) ?? null
  );
}

export function findNativeSidebar(dialog: HTMLElement): HTMLElement | null {
  const heading = Array.from(dialog.querySelectorAll('h1,h2,h3,h4,h5,h6')).find(
    (item) => normalizeText(item.textContent ?? '') === 'grupo de exames',
  );
  if (!heading) return null;

  let current: HTMLElement | null = heading.parentElement;
  while (current?.parentElement && !current.parentElement.querySelector('input[name="exame"]')) {
    current = current.parentElement;
  }
  return current && !current.querySelector('input[name="exame"]') ? current : null;
}

function deepestMatchingElements(dialog: HTMLElement): HTMLElement[] {
  return Array.from(dialog.querySelectorAll<HTMLElement>('div,span,p')).filter((element) => {
    const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!SELECTED_PATTERN.test(text)) return false;
    return !Array.from(element.children).some((child) =>
      SELECTED_PATTERN.test((child.textContent ?? '').replace(/\s+/g, ' ').trim()),
    );
  });
}

export function getSelectedExams(dialog: HTMLElement): ExamItem[] {
  const byCode = new Map<string, ExamItem>();
  for (const element of deepestMatchingElements(dialog)) {
    const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();
    const match = text.match(SELECTED_PATTERN);
    if (match) byCode.set(match[2], { label: match[1].trim(), sigtapCode: match[2] });
  }
  return [...byCode.values()];
}

export function selectedCodes(dialog: HTMLElement): Set<string> {
  return new Set(getSelectedExams(dialog).map((item) => item.sigtapCode));
}

function setReactInputValue(input: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
  input.dispatchEvent(new InputEvent('input', { bubbles: true, data: value, inputType: 'insertText' }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

export async function waitFor<T>(
  read: () => T | undefined | null | false,
  timeoutMs = 4_500,
  signal?: AbortSignal,
): Promise<T> {
  const immediate = read();
  if (immediate) return immediate as T;

  return new Promise<T>((resolve, reject) => {
    let finished = false;
    const cleanup = () => {
      observer.disconnect();
      clearInterval(interval);
      clearTimeout(timeout);
      signal?.removeEventListener('abort', onAbort);
    };
    const finish = (value: T) => {
      if (finished) return;
      finished = true;
      cleanup();
      resolve(value);
    };
    const fail = (message: string) => {
      if (finished) return;
      finished = true;
      cleanup();
      reject(new Error(message));
    };
    const check = () => {
      const value = read();
      if (value) finish(value as T);
    };
    const onAbort = () => fail('Operação cancelada.');
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
    const interval = window.setInterval(check, 75);
    const timeout = window.setTimeout(() => fail('Tempo limite aguardando resposta do e-SUS.'), timeoutMs);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function matchingOptions(code: string): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).filter((option) => {
    const text = (option.textContent ?? '').replace(/\s+/g, ' ').trim();
    return !/carregando/i.test(text) && text.match(CODE_PATTERN)?.[1] === code;
  });
}

async function findOption(
  dialog: HTMLElement,
  item: ExamItem,
  query: string,
  signal?: AbortSignal,
): Promise<HTMLElement> {
  const input = dialog.querySelector<HTMLInputElement>('input[name="exame"]');
  if (!input) throw new Error('Campo Exames não encontrado; versão do e-SUS não reconhecida.');
  input.focus();
  input.click();
  setReactInputValue(input, query);

  const matches = await waitFor(
    () => {
      const options = matchingOptions(item.sigtapCode);
      return options.length ? options : undefined;
    },
    4_500,
    signal,
  );
  if (matches.length !== 1) throw new Error(`Código ${item.sigtapCode} retornou ${matches.length} opções.`);
  return matches[0];
}

export async function addExam(
  dialog: HTMLElement,
  item: ExamItem,
  signal?: AbortSignal,
): Promise<ApplyResult> {
  if (selectedCodes(dialog).has(item.sigtapCode)) return { item, status: 'existing' };
  let option: HTMLElement;
  try {
    option = await findOption(dialog, item, item.sigtapCode, signal);
  } catch (codeError) {
    if (signal?.aborted) throw codeError;
    try {
      option = await findOption(dialog, item, item.label, signal);
    } catch (labelError) {
      return {
        item,
        status: 'failed',
        reason: labelError instanceof Error ? labelError.message : 'Exame não encontrado.',
      };
    }
  }

  option.click();
  try {
    await waitFor(() => selectedCodes(dialog).has(item.sigtapCode), 4_500, signal);
    return { item, status: 'added' };
  } catch (error) {
    return { item, status: 'failed', reason: error instanceof Error ? error.message : 'Inclusão não confirmada.' };
  }
}

function buttonName(button: HTMLButtonElement): string {
  const describedBy = button.getAttribute('aria-describedby');
  const description = describedBy ? document.getElementById(describedBy)?.textContent ?? '' : '';
  return normalizeText(
    button.getAttribute('aria-label') ?? button.getAttribute('title') ?? button.textContent ?? description,
  );
}

function findDeleteButton(dialog: HTMLElement, code: string): HTMLButtonElement | null {
  const target = deepestMatchingElements(dialog).find((element) =>
    (element.textContent ?? '').replace(/\s+/g, ' ').trim().endsWith(`- ${code}`),
  );
  let current: HTMLElement | null = target ?? null;
  for (let depth = 0; current && current !== dialog && depth < 7; depth += 1) {
    const candidates = Array.from(current.querySelectorAll<HTMLButtonElement>('button')).filter(
      (button) => buttonName(button) === 'excluir',
    );
    if (candidates.length === 1) return candidates[0];
    current = current.parentElement;
  }
  return null;
}

export async function removeExam(
  dialog: HTMLElement,
  item: ExamItem,
  signal?: AbortSignal,
): Promise<ApplyResult> {
  if (!selectedCodes(dialog).has(item.sigtapCode)) return { item, status: 'existing' };
  const button = findDeleteButton(dialog, item.sigtapCode);
  if (!button) return { item, status: 'failed', reason: 'Botão Excluir não encontrado.' };
  button.click();
  try {
    await waitFor(() => !selectedCodes(dialog).has(item.sigtapCode), 3_000, signal);
    return { item, status: 'removed' };
  } catch (error) {
    return { item, status: 'failed', reason: error instanceof Error ? error.message : 'Remoção não confirmada.' };
  }
}

export async function applyItems(
  dialog: HTMLElement,
  items: ExamItem[],
  signal: AbortSignal,
  onProgress?: (done: number, total: number, result: ApplyResult) => void,
): Promise<ApplyResult[]> {
  const results: ApplyResult[] = [];
  for (const item of items) {
    if (signal.aborted) break;
    const result = await addExam(dialog, item, signal);
    results.push(result);
    onProgress?.(results.length, items.length, result);
  }
  return results;
}
