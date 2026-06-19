const noticeFields = [
  ["Stato", "Prototipo pubblico in verifica; non usare questa sezione come conferma definitiva."],
  ["Fonte", "Leggere sempre la fonte indicata nella scheda o nella sezione consultata."],
  ["Livello di verifica", "Verifica editoriale progressiva; controllare il riferimento originario."],
  ["Ultimo aggiornamento", "Usare la data indicata nella sezione; se manca, trattare il contenuto come da aggiornare."],
  ["Limiti noti", "Le informazioni orientano la consultazione e possono essere incomplete."],
  ["Stato del dato", "Demo, parziale, verificato, assente o in attesa di fonte devono essere dichiarati in modo esplicito."],
] as const;

export function PrototypeNotice() {
  return (
    <section
      aria-labelledby="prototype-notice-title"
      className="border-b border-amber-200 bg-amber-50/80 px-4 py-4 text-amber-950"
    >
      <div className="mx-auto max-w-7xl space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Avviso di prototipo
          </p>
          <h2 id="prototype-notice-title" className="text-base font-semibold">
            Versione pubblica con cautele di lettura.
          </h2>
          <p className="max-w-4xl text-sm leading-6 text-amber-900">
            Prima di trattare una sezione come verificata devono essere chiari
            stato, fonte, livello di verifica, ultimo aggiornamento, limiti noti
            e natura demo/parziale/verificata del dato.
          </p>
        </div>

        <dl className="grid gap-2 text-sm md:grid-cols-2 xl:grid-cols-3">
          {noticeFields.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-amber-200 bg-background/70 p-3">
              <dt className="font-semibold text-amber-950">{label}</dt>
              <dd className="mt-1 leading-5 text-amber-900">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
