import { ShieldAlert } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <span className="font-serif font-bold text-lg text-primary tracking-tight">
                rendiamoLameziaTrasparente
              </span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground max-w-sm">
              <p>
                <strong>Attenzione:</strong> Questo è un progetto civico indipendente gestito da cittadini. 
                Non è un sito istituzionale e non ha alcun legame con il Comune di Lamezia Terme.
              </p>
              <p>
                Il nostro obiettivo è promuovere la trasparenza, la partecipazione e il controllo democratico 
                sull'operato dell'amministrazione pubblica.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-bold font-serif text-foreground">Risorse</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/temi" className="hover:text-primary transition-colors">Tutti i Temi</a></li>
              <li><a href="/contratti" className="hover:text-primary transition-colors">Appalti Pubblici</a></li>
              <li><a href="/albo" className="hover:text-primary transition-colors">Albo Pretorio</a></li>
              <li><a href="/statistiche" className="hover:text-primary transition-colors">Statistiche</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold font-serif text-foreground">Partecipa</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/segnalazioni" className="hover:text-primary transition-colors">Invia Segnalazione</a></li>
              <li><a href="/iscrizioni" className="hover:text-primary transition-colors">Centro Iscrizioni</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Metodologia</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Chi Siamo</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contattaci</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Iniziativa Civica Lamezia Terme. Tutti i dati sono raccolti da fonti pubbliche.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Termini</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
