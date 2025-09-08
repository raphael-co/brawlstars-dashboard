
export function ErrorState({ title='Erreur', message }: { title?: string; message?: string }) {
  return (
    <div className="card">
      <h3 className="mb-2">{title}</h3>
      <p className="opacity-80 whitespace-pre-wrap">{message ?? 'Une erreur est survenue.'}</p>
    </div>
  )
}
