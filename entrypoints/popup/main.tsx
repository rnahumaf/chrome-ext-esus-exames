import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { browser } from 'wxt/browser';
import { originPattern } from '@/src/domains';
import { getStore, isAllowedOrigin } from '@/src/storage';
import type { ExtensionStore, RuntimeMessage } from '@/src/types';
import './style.css';

function App() {
  const [store, setStore] = useState<ExtensionStore>();
  const [activeUrl, setActiveUrl] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const activeOrigin = useMemo(() => {
    try {
      return new URL(activeUrl).origin;
    } catch {
      return '';
    }
  }, [activeUrl]);

  const refresh = async () => {
    const [currentStore, tabs] = await Promise.all([
      getStore(),
      browser.tabs.query({ active: true, currentWindow: true }),
    ]);
    setStore(currentStore);
    setActiveUrl(tabs[0]?.url ?? '');
  };

  useEffect(() => {
    void refresh();
  }, []);

  const activate = async () => {
    if (!isAllowedOrigin(activeOrigin)) {
      setMessage('Abra uma instalação e-SUS em HTTPS antes de ativar.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const granted = await browser.permissions.request({ origins: [originPattern(activeOrigin)] });
      if (!granted) throw new Error('Permissão não concedida.');
      await browser.runtime.sendMessage<RuntimeMessage>({ type: 'ACTIVATE_ORIGIN', origin: activeOrigin });
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab?.id != null) {
        await browser.scripting.executeScript({ target: { tabId: tab.id }, files: ['/esus-injected.js'] });
      }
      setMessage('Extensão ativada neste domínio.');
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível ativar.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (origin: string) => {
    setBusy(true);
    try {
      await browser.runtime.sendMessage<RuntimeMessage>({ type: 'REMOVE_ORIGIN', origin });
      setMessage(`Acesso removido de ${origin}.`);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const activeIsAllowed = store?.allowedOrigins.includes(activeOrigin) ?? false;

  return (
    <main>
      <header>
        <span className="mark">+</span>
        <div>
          <h1>Presets de Exames</h1>
          <p>para e-SUS APS</p>
        </div>
      </header>

      <section>
        <h2>Site atual</h2>
        <p className="origin">{activeOrigin || 'Nenhum site HTTPS detectado'}</p>
        <button disabled={busy || activeIsAllowed || !isAllowedOrigin(activeOrigin)} onClick={activate}>
          {activeIsAllowed ? 'Ativo neste e-SUS' : 'Ativar neste e-SUS'}
        </button>
      </section>

      <section>
        <h2>Domínios autorizados</h2>
        {!store?.allowedOrigins.length && <p className="muted">Nenhum domínio autorizado.</p>}
        <ul>
          {store?.allowedOrigins.map((origin) => (
            <li key={origin}>
              <span>{origin}</span>
              <button className="link danger" disabled={busy} onClick={() => void remove(origin)}>
                Remover
              </button>
            </li>
          ))}
        </ul>
      </section>

      {message && <p className="message" role="status">{message}</p>}
      <footer>Os presets ficam somente neste navegador. A extensão nunca salva a solicitação.</footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
