type PageStubProps = {
  title: string
}

export function PageStub({ title }: PageStubProps) {
  return (
    <main className="page">
      <h1>{title}</h1>
      <p className="page__hint">Placeholder — replace with real content.</p>
    </main>
  )
}
