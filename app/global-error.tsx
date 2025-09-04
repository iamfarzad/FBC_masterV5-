'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Global Error</h2>
          <p>Something went wrong at the application level</p>
          <button onClick={() => reset()} style={{ marginTop: '10px' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
