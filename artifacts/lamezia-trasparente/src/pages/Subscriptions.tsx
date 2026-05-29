import { useState } from "react";
import { useRequestSubscriptionsLink } from "@workspace/api-client-react";
import { toast } from "sonner";
import { Bell, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Subscriptions() {
  const requestLink = useRequestSubscriptionsLink();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Email non valida", {
        description: "Inserisci un indirizzo email corretto.",
      });
      return;
    }
    requestLink.mutate(
      { data: { email: value } },
      {
        onSuccess: (res) => {
          setSent(true);
          toast.success("Richiesta inviata", { description: res.message });
        },
        onError: () => {
          toast.error("Errore", {
            description: "Non è stato possibile completare la richiesta. Riprova.",
          });
        },
      },
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bell className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
            Centro Iscrizioni
          </h1>
          <p className="text-muted-foreground text-lg">
            Gestisci i temi che segui. Inserisci la tua email e ti invieremo un
            link sicuro per vedere e modificare le tue iscrizioni.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">
              Ricevi il link via email
            </CardTitle>
            <CardDescription>
              Per la tua sicurezza, l'accesso al centro iscrizioni avviene
              tramite un link inviato al tuo indirizzo email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-6 py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-primary" />
                <h3 className="text-lg font-semibold">Controlla la tua casella</h3>
                <p className="text-muted-foreground text-sm">
                  Se l'indirizzo ha iscrizioni attive, riceverai un'email con il
                  link per gestirle. Controlla anche la cartella spam.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                >
                  Usa un altro indirizzo
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="latua@email.it"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    aria-label="Indirizzo email"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={requestLink.isPending}
                >
                  <Mail className="h-4 w-4" />
                  {requestLink.isPending ? "Invio in corso…" : "Inviami il link"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
