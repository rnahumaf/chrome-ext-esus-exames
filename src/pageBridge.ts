import { PAGE_SELECT_EXAM_EVENT } from './bridgeProtocol';

const CODE_PATTERN = /\b(\d{10})\b/;

type ReactOptionProps = {
  onClick?: (event: ReactOptionEvent) => void;
  onMouseDown?: (event: ReactOptionEvent) => void;
};

type ReactOptionEvent = {
  type: string;
  target: HTMLElement;
  currentTarget: HTMLElement;
  nativeEvent: Record<string, unknown>;
  preventDefault: () => void;
  stopPropagation: () => void;
  persist: () => void;
};

function reactOptionProps(option: HTMLElement): ReactOptionProps | undefined {
  const key = Object.keys(option).find((item) => item.startsWith('__reactProps$'));
  return key ? (option as unknown as Record<string, ReactOptionProps>)[key] : undefined;
}

function invokeReactSelection(option: HTMLElement): boolean {
  const props = reactOptionProps(option);
  if (typeof props?.onClick !== 'function') return false;
  const event = (type: string): ReactOptionEvent => ({
    type,
    target: option,
    currentTarget: option,
    nativeEvent: {},
    preventDefault: () => undefined,
    stopPropagation: () => undefined,
    persist: () => undefined,
  });
  props.onMouseDown?.(event('mousedown'));
  props.onClick(event('click'));
  return true;
}

export function clickVisibleOptionByCode(code: string, root: ParentNode = document): boolean {
  if (!/^\d{10}$/.test(code)) return false;
  const matches = Array.from(root.querySelectorAll<HTMLElement>('[role="option"]')).filter((option) => {
    const text = (option.textContent ?? '').replace(/\s+/g, ' ').trim();
    const listbox = option.closest<HTMLElement>('[role="listbox"]');
    return (
      option.isConnected &&
      listbox?.getAttribute('aria-hidden') !== 'true' &&
      text.match(CODE_PATTERN)?.[1] === code
    );
  });
  if (matches.length !== 1) return false;
  if (!invokeReactSelection(matches[0])) matches[0].click();
  return true;
}

export function installPageBridge(): () => void {
  const listener = (event: Event) => {
    const code = (event as CustomEvent<unknown>).detail;
    if (typeof code === 'string') clickVisibleOptionByCode(code);
  };
  document.addEventListener(PAGE_SELECT_EXAM_EVENT, listener);
  return () => document.removeEventListener(PAGE_SELECT_EXAM_EVENT, listener);
}
