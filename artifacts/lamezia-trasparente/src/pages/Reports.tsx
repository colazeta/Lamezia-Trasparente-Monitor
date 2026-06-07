import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { Megaphone, AlertCircle, MapPin, CheckCircle2, Clock, Archive } from "lucide-react";

import { useCreateReport, useListReports, getListReportsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

const formSchema = z.object({
  title: z.string().min(5, "Il titolo deve avere almeno 5 caratteri").max(100),
  description: z.string().min(20, "La descrizione deve essere dettagliata (min. 20 caratteri)"),
  category: z.string().min(1, "Seleziona una categoria"),
  location: z.string().min(3, "Specifica un luogo o quartiere"),
  citizenName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const statusMap: Record<string, { label: string; icon: any; variant: BadgeProps["variant"] }> = {
  ricevuta: { label: "Ricevuta", icon: Clock, variant: "secondary" },
  in_valutazione: { label: "In Valutazione", icon: AlertCircle, variant: "warning" },
  presa_in_carico: { label: "Presa in Carico", icon: CheckCircle2, variant: "brand" },
  archiviata: { label: "Archiviata", icon: Archive, variant: "outline" },
};

export function Reports() {
  const queryClient = useQueryClient();
  const createReport = useCreateReport();
  const { data: reports, isLoading } = useListReports();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      citizenName: "",
    },
  });

  function onSubmit(data: FormValues) {
    createReport.mutate({ data }, {
      onSuccess: () => {
        toast.success("Segnalazione inviata con successo", {
          description: "La nostra redazione civica la valuterà a breve."
        });
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
        // Assuming we could switch tabs here in a more complex setup
      },
      onError: () => {
        toast.error("Errore nell'invio", {
          description: "Riprova più tardi."
        });
      }
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-8 max-w-3xl">
        <span className="eyebrow text-primary">
          <Megaphone className="h-3.5 w-3.5" />
          Sentinelle del territorio
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
          Segnalazioni Civiche
        </h1>
        <p className="mt-3 text-muted-foreground text-lg">
          Invia un segnale civico circostanziato su servizi, lavori o informazioni pubbliche
          che richiedono verifica. La segnalazione non sostituisce una richiesta di accesso
          civico né una denuncia formale alle autorità competenti.
        </p>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 h-12">
          <TabsTrigger value="new" className="text-base h-full">Invia Segnalazione</TabsTrigger>
          <TabsTrigger value="list" className="text-base h-full">Bacheca Segnalazioni</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new">
          <Card className="max-w-2xl mx-auto overflow-hidden shadow-md">
            <CardHeader className="border-b border-border bg-muted/40">
              <CardTitle className="font-display font-bold tracking-tight">Nuova Segnalazione</CardTitle>
              <CardDescription>
                Fornisci dettagli verificabili. I contenuti inviati restano soggetti a revisione
                redazionale prima di qualsiasi eventuale pubblicazione in bacheca.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Oggetto della segnalazione</FormLabel>
                        <FormControl>
                          <Input placeholder="Es. Lavori fermi da 6 mesi in Via Garibaldi" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11" aria-label="Categoria">
                                <SelectValue placeholder="Seleziona ambito" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="lavori_pubblici">Lavori Pubblici</SelectItem>
                              <SelectItem value="ambiente">Ambiente e Rifiuti</SelectItem>
                              <SelectItem value="viabilita">Viabilità</SelectItem>
                              <SelectItem value="trasparenza">Trasparenza Amministrativa</SelectItem>
                              <SelectItem value="altro">Altro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Luogo / Quartiere</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Es. Quartiere Sambiase" {...field} className="pl-9 h-11" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dettagli</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrivi la situazione. Includi date, luoghi, riferimenti amministrativi e ogni dettaglio utile alle verifiche..."
                            className="min-h-[150px] resize-y" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="citizenName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Il tuo nome <span className="text-muted-foreground font-normal">(Opzionale)</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Mario Rossi" {...field} className="h-11" />
                        </FormControl>
                        <FormDescription>
                          Lascia vuoto per restare anonimo. Il nome, se indicato, è trattato come dato interno e non viene pubblicato nella risposta pubblica.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    variant="brand"
                    size="lg" 
                    className="w-full text-base h-12 font-bold"
                    disabled={createReport.isPending}
                  >
                    {createReport.isPending ? "Invio in corso..." : "Invia Segnalazione Civica"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="grid gap-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : reports && reports.length > 0 ? (
              reports.map((report) => {
                const status = statusMap[report.status] || statusMap.ricevuta;
                const StatusIcon = status.icon;
                
                return (
                  <Card key={report.id} className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-brand/40">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 flex-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="font-display text-xl font-bold text-foreground leading-tight group-hover:text-brand transition-colors">
                            {report.title}
                          </h3>
                          <Badge variant={status.variant} className="shrink-0 gap-1.5 shadow-none">
                            <StatusIcon className="h-3.5 w-3.5" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {report.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {report.location}
                          </span>
                          <span className="px-2 py-0.5 bg-muted rounded">{report.category}</span>
                          <span className="ml-auto">
                            {format(new Date(report.createdAt), 'dd MMMM yyyy', { locale: it })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Empty className="border border-dashed border-border bg-muted/20">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-brand/10 text-brand">
                    <Megaphone className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle className="font-display">
                    Nessuna segnalazione pubblica
                  </EmptyTitle>
                  <EmptyDescription>
                    Al momento la bacheca mostra solo contenuti che possono essere resi
                    pubblici dopo revisione. Le nuove segnalazioni restano segnali civici
                    interni finché non esiste una verifica redazionale esplicita.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
