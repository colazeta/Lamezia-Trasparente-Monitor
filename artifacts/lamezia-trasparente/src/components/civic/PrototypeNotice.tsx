import { Info } from "lucide-react";

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
      className="border-b border-primary/20 bg-primary/5 px-4 py-4 text-foreground"
    >
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-primary/20 bg-background shadow-sm">
        <div className="h-1 bg-gradient-to-r from-primary via-brand to-primary" />
        <div className="space-y-4 p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <Info className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="eyebrow text-primary">Avviso di prototipo</p>
              <h2 id="prototype-notice-title" className="text-base font-semibold">
                Versione pubblica con cautele di lettura.
              </h2>
              <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
                Prima di trattare una sezione come verificata devono essere chiari
                stato, fonte, livello di verifica, ultimo aggiornamento, limiti noti
                e natura demo/parziale/verificata del dato.
              </p>
            </div>
          </div>

          <dl className="grid gap-2 text-sm md:grid-cols-2 xl:grid-cols-3">
            {noticeFields.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-primary/15 bg-primary/5 p-3">
                <dt className="font-semibold text-foreground">{label}</dt>
                <dd className="mt-1 leading-5 text-muted-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
