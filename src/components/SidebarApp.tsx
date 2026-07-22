import React, { useEffect, useMemo, useRef, useState } from 'react';
import { browser } from 'wxt/browser';
import { addExam, applyItems, getSelectedExams, removeExam, selectedCodes } from '../domAdapter';
import {
  dedupeItems,
  deletePreset,
  getStore,
  newPreset,
  normalizeStore,
  savePreset,
  STORE_KEY,
} from '../storage';
import type { ApplyResult, ExamItem, ExamPreset, ExtensionStore } from '../types';

interface SidebarAppProps {
  dialog: HTMLElement;
}

type EditorState = { preset: ExamPreset; isNew: boolean };

function resultMessage(results: ApplyResult[]): string {
  const added = results.filter((item) => item.status === 'added').length;
  const existing = results.filter((item) => item.status === 'existing').length;
  const removed = results.filter((item) => item.status === 'removed').length;
  const failed = results.filter((item) => item.status === 'failed').length;
  return [
    added ? `${added} adicionado(s)` : '',
    existing ? `${existing} já existente(s)` : '',
    removed ? `${removed} removido(s)` : '',
    failed ? `${failed} não encontrado(s)` : '',
  ]
    .filter(Boolean)
    .join(' · ');
}

export function SidebarApp({ dialog }: SidebarAppProps) {
  const [store, setStore] = useState<ExtensionStore>();
  const [expandedId, setExpandedId] = useState<string>();
  const [codes, setCodes] = useState<Set<string>>(() => selectedCodes(dialog));
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [lastResults, setLastResults] = useState<ApplyResult[]>([]);
  const [editor, setEditor] = useState<EditorState>();
  const [confirmDelete, setConfirmDelete] = useState<string>();
  const controllerRef = useRef<AbortController | undefined>(undefined);

  const refreshStore = async () => setStore(await getStore());
  const refreshCodes = () => setCodes(selectedCodes(dialog));

  useEffect(() => {
    void refreshStore();
    const storageListener = (changes: Record<string, any>, area: string) => {
      if (area === 'local' && changes[STORE_KEY]?.newValue) {
        setStore(normalizeStore(changes[STORE_KEY].newValue));
      }
    };
    browser.storage.onChanged.addListener(storageListener);
    const observer = new MutationObserver(refreshCodes);
    observer.observe(dialog, { childList: true, subtree: true });
    return () => {
      browser.storage.onChanged.removeListener(storageListener);
      observer.disconnect();
      controllerRef.current?.abort();
    };
  }, [dialog]);

  const failedItems = useMemo(
    () => lastResults.filter((result) => result.status === 'failed').map((result) => result.item),
    [lastResults],
  );

  const runApply = async (items: ExamItem[]) => {
    if (busy || !items.length) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setBusy(true);
    setProgress(`Preparando ${items.length} exame(s)…`);
    setLastResults([]);
    try {
      const results = await applyItems(dialog, items, controller.signal, (done, total, result) => {
        setProgress(`${done}/${total}: ${result.item.label}`);
      });
      setLastResults(results);
      setProgress(controller.signal.aborted ? 'Aplicação cancelada.' : resultMessage(results));
    } catch (error) {
      setProgress(error instanceof Error ? error.message : 'Não foi possível aplicar o preset.');
    } finally {
      setBusy(false);
      refreshCodes();
    }
  };

  const toggleItem = async (item: ExamItem, checked: boolean) => {
    if (busy) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setBusy(true);
    setProgress(`${checked ? 'Adicionando' : 'Removendo'} ${item.label}…`);
    const result = checked
      ? await addExam(dialog, item, controller.signal)
      : await removeExam(dialog, item, controller.signal);
    setLastResults([result]);
    setProgress(resultMessage([result]) || result.reason || 'Concluído.');
    setBusy(false);
    refreshCodes();
  };

  const captureNew = () => {
    const items = getSelectedExams(dialog);
    if (!items.length) {
      setProgress('Selecione ao menos um exame no formulário antes de capturar.');
      return;
    }
    setEditor({ preset: newPreset('', items), isNew: true });
  };

  const openEditor = (preset: ExamPreset) => {
    setEditor({ preset: structuredClone(preset), isNew: false });
  };

  const persistEditor = async () => {
    if (!editor?.preset.name.trim() || !editor.preset.items.length) return;
    await savePreset({
      ...editor.preset,
      name: editor.preset.name.trim(),
      items: dedupeItems(editor.preset.items),
      updatedAt: new Date().toISOString(),
    });
    setEditor(undefined);
    setProgress('Preset salvo neste navegador.');
  };

  const duplicate = async (preset: ExamPreset) => {
    await savePreset(newPreset(`${preset.name} (cópia)`, preset.items));
    setProgress('Preset duplicado.');
  };

  const removePreset = async (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    await deletePreset(id);
    setConfirmDelete(undefined);
    setProgress('Preset excluído.');
  };

  return (
    <div className="app">
      <div className="title-row">
        <h2>Meus grupos de exames</h2>
      </div>
      <p className="hint">Presets pessoais. A extensão seleciona exames, mas nunca salva a solicitação.</p>

      {store?.presets.map((preset) => {
        const open = expandedId === preset.id;
        return (
          <section className={`preset ${open ? 'open' : ''}`} key={preset.id}>
            <div className="preset-head">
              <button className="preset-toggle" onClick={() => setExpandedId(open ? undefined : preset.id)}>
                {preset.name}
              </button>
              <button className="icon-button" title="Editar preset" onClick={() => openEditor(preset)}>Editar</button>
            </div>
            {open && (
              <div className="body">
                {preset.items.map((item) => (
                  <div className="exam" key={item.sigtapCode}>
                    <input
                      aria-label={item.label}
                      type="checkbox"
                      checked={codes.has(item.sigtapCode)}
                      disabled={busy}
                      onChange={(event) => void toggleItem(item, event.target.checked)}
                    />
                    <label>
                      {item.label}
                      <span className="code">SIGTAP {item.sigtapCode}</span>
                      {item.note && <span className="note">{item.note}</span>}
                    </label>
                  </div>
                ))}
                {preset.source && (
                  <p className="hint">
                    Fonte: <a href={preset.source.url} target="_blank" rel="noreferrer">{preset.source.title}</a>
                  </p>
                )}
                <div className="actions">
                  <button className="primary" disabled={busy} onClick={() => void runApply(preset.items)}>
                    Adicionar todos
                  </button>
                  <button className="secondary" disabled={busy} onClick={() => void duplicate(preset)}>
                    Duplicar
                  </button>
                  <button className="danger" disabled={busy} onClick={() => void removePreset(preset.id)}>
                    {confirmDelete === preset.id ? 'Confirmar exclusão' : 'Excluir'}
                  </button>
                </div>
              </div>
            )}
          </section>
        );
      })}

      {!store?.presets.length && <p className="empty">Nenhum preset cadastrado.</p>}
      <button className="secondary capture" disabled={busy} onClick={captureNew}>
        Salvar seleção atual como preset
      </button>

      {progress && <div className={`status ${failedItems.length ? 'error' : ''}`} role="status">{progress}</div>}
      {busy && (
        <button className="danger capture" onClick={() => controllerRef.current?.abort()}>
          Cancelar aplicação
        </button>
      )}
      {!busy && failedItems.length > 0 && (
        <button className="secondary capture" onClick={() => void runApply(failedItems)}>
          Repetir somente falhas
        </button>
      )}

      {editor && (
        <PresetEditor
          state={editor}
          dialog={dialog}
          onChange={setEditor}
          onCancel={() => setEditor(undefined)}
          onSave={() => void persistEditor()}
        />
      )}
    </div>
  );
}

function PresetEditor({
  state,
  dialog,
  onChange,
  onCancel,
  onSave,
}: {
  state: EditorState;
  dialog: HTMLElement;
  onChange: (state: EditorState) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const updatePreset = (update: Partial<ExamPreset>) => onChange({ ...state, preset: { ...state.preset, ...update } });
  const updateItem = (index: number, update: Partial<ExamItem>) => {
    const items = state.preset.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...update } : item));
    updatePreset({ items });
  };
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= state.preset.items.length) return;
    const items = [...state.preset.items];
    [items[index], items[target]] = [items[target], items[index]];
    updatePreset({ items });
  };
  const mergeCurrent = () => updatePreset({ items: dedupeItems([...state.preset.items, ...getSelectedExams(dialog)]) });

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Editar preset pessoal">
      <div className="modal">
        <h3>{state.isNew ? 'Novo preset' : 'Editar preset'}</h3>
        <label className="field">
          Nome
          <input
            type="text"
            value={state.preset.name}
            autoFocus
            onChange={(event) => updatePreset({ name: event.target.value })}
          />
        </label>

        {state.preset.items.map((item, index) => (
          <div className="edit-item" key={item.sigtapCode}>
            <div className="edit-title">
              <span>{item.label} <span className="code">{item.sigtapCode}</span></span>
              <span className="edit-controls">
                <button className="icon-button" title="Mover para cima" onClick={() => move(index, -1)}>↑</button>
                <button className="icon-button" title="Mover para baixo" onClick={() => move(index, 1)}>↓</button>
                <button
                  className="icon-button"
                  title="Remover do preset"
                  onClick={() => updatePreset({ items: state.preset.items.filter((_, itemIndex) => itemIndex !== index) })}
                >×</button>
              </span>
            </div>
            <label className="field">
              Nota informativa
              <textarea value={item.note ?? ''} onChange={(event) => updateItem(index, { note: event.target.value })} />
            </label>
          </div>
        ))}

        <div className="actions">
          <button className="secondary" onClick={mergeCurrent}>Mesclar seleção atual</button>
          <button className="primary" disabled={!state.preset.name.trim() || !state.preset.items.length} onClick={onSave}>
            Salvar preset
          </button>
          <button className="secondary" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
