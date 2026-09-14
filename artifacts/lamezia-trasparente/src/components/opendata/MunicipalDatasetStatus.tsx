export function MunicipalDatasetStatus({
  id,
  title,
  loading,
  retry,
}: {
  id: string;
  title: string;
  loading: boolean;
  retry: () => void;
}) {
  return (
    <section
      id={id}
      className="mb-8 rounded-xl border border-card-border bg-card p-5"
      aria-live="polite"
      aria-busy={loading}
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-3">
        {loading
          ? "Caricamento dal database canonico…"
          : "Il dataset canonico non è disponibile. L’assenza di dati non indica un valore pari a zero."}
      </p>
      {!loading && (
        <button type="button" className="mt-3 underline" onClick={retry}>
          Riprova
        </button>
      )}
    </section>
  );
}
