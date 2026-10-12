export default function PanelLoading() {
  return (
    <div aria-busy="true" aria-label="Wczytywanie" className="animate-pulse">
      <div className="mb-8 h-8 w-48 rounded-lg bg-surface-2" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-line bg-surface" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-72 rounded-2xl border border-line bg-surface" />
        <div className="h-72 rounded-2xl border border-line bg-surface" />
      </div>
    </div>
  );
}
