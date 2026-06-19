'use client';

import { useEffect } from 'react';

// Route-segment error boundary. Self-contained (no app-specific imports) so it
// always renders even when the failure is in shared UI. Stack traces are sent to
// the console / attached monitoring only — never shown to the user.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global-Trade-Infrastructure-main] Unhandled application error:', error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: '#f8fafc',
        color: '#0f172a',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <p style={{ fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#64748b', margin: 0 }}>
          Something went wrong
        </p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 1rem + 3vw, 2.6rem)', fontWeight: 800, margin: '0.5rem 0 0.75rem', lineHeight: 1.1 }}>
          We hit an unexpected error
        </h1>
        <p style={{ color: '#475569', lineHeight: 1.6, margin: '0 0 1.75rem' }}>
          The page failed to render. Your data is safe — you can retry, or return to the homepage.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => reset()}
            style={{ background: '#4f46e5', color: '#fff', border: 0, borderRadius: 10, padding: '0.8rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{ background: 'transparent', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: 10, padding: '0.8rem 1.5rem', fontWeight: 700, textDecoration: 'none' }}
          >
            Go home
          </a>
        </div>
        {error?.digest ? (
          <p style={{ marginTop: 24, fontSize: 11, color: '#94a3b8', letterSpacing: '0.1em' }}>REF: {error.digest}</p>
        ) : null}
      </div>
    </main>
  );
}
