'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Algo deu errado</h1>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            Ocorreu um erro inesperado. Tente novamente.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#DF823C',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}

