import { beforeEach, vi } from 'vitest';

const memory: Record<string, unknown> = {};
const listeners = new Set<(changes: Record<string, unknown>, area: string) => void>();

vi.mock('wxt/browser', () => ({
  browser: {
    storage: {
      local: {
        get: vi.fn(async (key: string) => ({ [key]: memory[key] })),
        set: vi.fn(async (values: Record<string, unknown>) => {
          Object.assign(memory, values);
        }),
      },
      onChanged: {
        addListener: vi.fn((listener) => listeners.add(listener)),
        removeListener: vi.fn((listener) => listeners.delete(listener)),
      },
    },
    scripting: {
      getRegisteredContentScripts: vi.fn(async () => []),
      registerContentScripts: vi.fn(async () => undefined),
      unregisterContentScripts: vi.fn(async () => undefined),
    },
    permissions: {
      contains: vi.fn(async () => true),
      remove: vi.fn(async () => true),
    },
  },
}));

beforeEach(() => {
  for (const key of Object.keys(memory)) delete memory[key];
  document.body.innerHTML = '';
});
