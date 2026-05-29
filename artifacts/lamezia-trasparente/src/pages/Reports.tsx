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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  title: z.string().min(5, "Il titolo deve avere almeno 5 caratteri").max(100),
  description: z.string().min(20, "La descrizione deve essere dettagliata (min. 20 caratteri)"),
  category: z.string().min(1, "Seleziona una categoria"),
  location: z.string().min(3, "Specifica un luogo o quartiere"),
  citizenName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const statusMap: Record<string, { label: string; icon: any; color: string }> = {
  ricevuta: { label: "Ricevuta", icon: Clock, color: "text-blue-500 bg-blue-50 border-blue-200" },
  in_valutazione: { label: "In Valutazione", icon: AlertCircle, color: "text-amber-500 bg-amber-50 border-amber-200" },
  presa_in_carico: { label: "Presa in Carico", icon: CheckCircle2, color: "text-primary bg-primary/10 border-primary/20" },
  archiviata: { label: "Archiviata", icon: Archive, color: "text-muted-foreground bg-muted border-muted-foreground/20" },
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
      <div className="mb-8 space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
          <Megaphone className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight">Segnalazioni Civiche</h1>
        <p className="text-muted-foreground text-lg">
          I cittadini sono le prime sentinelle del territorio. Invia segnalazioni su sprechi, 
          lavori bloccati o disservizi per attivare un monitoraggio indipendente.
        </p>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 h-12">
          <TabsTrigger value="new" className="text-base h-full">Invia Segnalazione</TabsTrigger>
          <TabsTrigger value="list" className="text-base h-full">Bacheca Segnalazioni</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new">
          <Card className="border-primary/20 shadow-md max-w-2xl mx-auto">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle>Nuova Segnalazione</CardTitle>
              <CardDescription>
                Fornisci dettagli precisi. Le segnalazioni anonime sono accettate, ma i dati circostanziati sono essenziali per le verifiche.
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
                              <SelectTrigger className="h-11">
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
                            placeholder="Descrivi la situazione. Includi date, attori coinvolti e ogni dettaglio utile alle verifiche..." 
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
                          Lascia vuoto per restare anonimo. Non pubblicheremo il tuo nome.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full text-base h-12"
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
                  <Card key={report.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 flex-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="font-serif text-xl font-bold text-foreground leading-tight">
                            {report.title}
                          </h3>
                          <Badge variant="outline" className={`shrink-0 flex gap-1.5 items-center px-2.5 py-1 ${status.color}`}>
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
              <div className="text-center py-20 bg-muted/20 border border-dashed rounded-xl">
                <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Nessuna segnalazione pubblica al momento.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
