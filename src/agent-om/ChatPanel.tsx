'use client';
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useClaude, whatClaudeSees } from './use-claude';

// The dev-only chat: a request in, Claude Haiku carries it out on the page.
// A column of its own beside the app's (AgentOm.tsx), never over it: nothing
// of the page is covered, so the agent can reach all of it. It sits outside
// the projection (data-agentom-ignore), so the agent never reads or acts on
// it. Plain elements and inline styles: it isn't Umami's UI.

const column: CSSProperties = {
  flex: 'none',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--base-color-1, #fff)',
  color: 'var(--font-color, #111)',
  borderLeft: '1px solid rgba(127,127,127,.35)',
  font: '13px/1.45 system-ui, sans-serif',
};
/** Collapsed: a strip with the button that opens it. */
const STRIP = 44;
const WIDTH = 400;
const button: CSSProperties = {
  padding: '5px 10px',
  borderRadius: 6,
  // longhands, so `primary` can change the color without mixing them with the shorthand
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'rgba(127,127,127,.45)',
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  font: 'inherit',
};
const primary: CSSProperties = {
  ...button,
  background: '#2563eb',
  borderColor: '#2563eb',
  color: '#fff',
};
const box: CSSProperties = { padding: 10, borderRadius: 8, background: 'rgba(127,127,127,.12)' };

/**
 * A question to the user (a risky step, a secret), as a native modal dialog:
 * the browser's top layer is above the app's own modal, whose backdrop covers
 * the chat column, so it can be answered while a page dialog is open (the
 * step it asks about is usually in one). Escape answers no. It's put in
 * <body>, outside the app's root, which a page dialog marks aria-hidden.
 * Shown only during a run, so never rendered on the server.
 */
function Prompt({ children, onDismiss }: { children: ReactNode; onDismiss: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return createPortal(
    <dialog
      ref={ref}
      data-agentom-ignore=""
      onCancel={e => {
        e.preventDefault();
        onDismiss();
      }}
      style={{
        width: 360,
        padding: 16,
        border: '1px solid rgba(127,127,127,.45)',
        borderRadius: 10,
        background: 'var(--base-color-1, #fff)',
        color: 'var(--font-color, #111)',
        font: '13px/1.45 system-ui, sans-serif',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Claude Haiku asks</div>
      {children}
    </dialog>,
    document.body,
  );
}

export function ChatPanel() {
  const { view, start, stop, clear, respond, enterSecret } = useClaude();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [secret, setSecret] = useState('');
  const [seen, setSeen] = useState<string | null>(null);
  const running = view.status === 'running';

  const submit = () => {
    const q = query.trim();
    if (!q || running) return;
    setSeen(null);
    void start(q);
  };
  const prompts = (
    <>
      {view.confirm && (
        <Prompt onDismiss={() => respond(false)}>
          <div style={{ marginBottom: 12 }}>{view.confirm}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" style={primary} onClick={() => respond(true)}>
              Allow
            </button>
            <button type="button" style={button} onClick={() => respond(false)}>
              Decline
            </button>
          </div>
        </Prompt>
      )}
      {view.secret && (
        <Prompt
          onDismiss={() => {
            enterSecret(null);
            setSecret('');
          }}
        >
          <form
            onSubmit={e => {
              e.preventDefault();
              enterSecret(secret);
              setSecret('');
            }}
          >
            <div style={{ marginBottom: 8 }}>
              Enter the value for “{view.secret}”. It goes to the page, never to the model.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="password"
                value={secret}
                onChange={e => setSecret(e.target.value)}
                autoComplete="off"
                autoFocus
                style={{ ...button, flex: 1, cursor: 'text' }}
              />
              <button type="submit" style={primary}>
                Enter
              </button>
              <button
                type="button"
                style={button}
                onClick={() => {
                  enterSecret(null);
                  setSecret('');
                }}
              >
                Decline
              </button>
            </div>
          </form>
        </Prompt>
      )}
    </>
  );
  const toggleSeen = async () => {
    setSeen(seen === null ? await whatClaudeSees() : null);
  };

  if (!open) {
    return (
      <aside data-agentom-ignore="" style={{ ...column, width: STRIP, alignItems: 'center' }}>
        {prompts}
        <button
          type="button"
          style={{ ...primary, marginTop: 12, writingMode: 'vertical-rl', padding: '10px 6px' }}
          onClick={() => setOpen(true)}
        >
          {running ? 'Agent (running)' : 'Agent'}
        </button>
      </aside>
    );
  }

  return (
    <aside data-agentom-ignore="" style={{ ...column, width: WIDTH }}>
      {prompts}
      <section
        style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
        aria-label="Agent"
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            borderBottom: '1px solid rgba(127,127,127,.25)',
          }}
        >
          <strong style={{ flex: 1 }}>Claude Haiku</strong>
          <button type="button" style={button} onClick={toggleSeen}>
            {seen === null ? 'What Claude sees' : 'Back to the run'}
          </button>
          <button type="button" style={button} onClick={clear} disabled={running}>
            Clear
          </button>
          <button type="button" style={button} onClick={() => setOpen(false)} aria-label="Collapse">
            ›
          </button>
        </header>

        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 12,
            display: 'grid',
            gap: 10,
            alignContent: 'start',
          }}
        >
          {seen !== null ? (
            <pre
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                font: '11.5px/1.45 ui-monospace, monospace',
              }}
            >
              {seen}
            </pre>
          ) : (
            <>
              {view.query && <div style={box}>{view.query}</div>}
              {view.steps.map(s => (
                <div key={s.step}>
                  <span style={{ opacity: 0.6 }}>{s.step}. </span>
                  {s.text}
                  {s.ok === false && <div style={{ color: '#dc2626' }}>{s.detail}</div>}
                </div>
              ))}
              {view.reading && <div style={{ opacity: 0.7 }}>Reading {view.reading}…</div>}
              {view.thinking && <div style={{ opacity: 0.7 }}>Thinking…</div>}
              {!running && view.status !== 'idle' && (
                <div
                  style={{
                    ...box,
                    borderLeft: `3px solid ${view.status === 'done' ? '#16a34a' : '#dc2626'}`,
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>{view.text || view.message}</div>
                  {view.status !== 'done' && (
                    <div style={{ opacity: 0.6, marginTop: 4 }}>{view.status}</div>
                  )}
                  {view.totals && (
                    <div style={{ opacity: 0.6, marginTop: 6, fontSize: 12 }}>
                      {(view.totals.ms / 1000).toFixed(1)} s (
                      {(view.totals.modelMs / 1000).toFixed(1)} s waiting on Claude) ·{' '}
                      {view.steps.length} actions · {view.totals.requests} requests · $
                      {view.totals.costUsd.toFixed(4)}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <form
          style={{
            display: 'flex',
            gap: 8,
            padding: 12,
            // clear of Next's dev indicator, bottom right
            paddingBottom: 64,
            borderTop: '1px solid rgba(127,127,127,.25)',
          }}
          onSubmit={e => {
            e.preventDefault();
            submit();
          }}
        >
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask the agent to do something on this page"
            rows={2}
            style={{ ...button, flex: 1, resize: 'none', cursor: 'text' }}
          />
          {running ? (
            <button type="button" style={button} onClick={stop}>
              Stop
            </button>
          ) : (
            <button type="submit" style={primary} disabled={!query.trim()}>
              Run
            </button>
          )}
        </form>
      </section>
    </aside>
  );
}
