import { useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useListContracts,
  useUpdateContractMacrotema,
  getListContractsQueryKey,
  getGetContractsAnalyticsQueryKey,
  type Contract,
  type MacrotemaKey,
} from "@workspace/api-client-react";
import {
  ShieldCheck,
  LogOut,
  Search,
  Leaf,
  GraduationCap,
  HardHat,
  HeartHandshake,
  Palette,
  Bus,
  Package,
  Wand2,
  CheckCircle2,
  MapPin,
  AlertTriangle,
  Locate,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { LocationEditor } from "@/components/LocationEditor";

const TOKEN_STORAGE_KEY = "lt_ingest_token";

const MACROTEMA_OPTIONS: {
  key: MacrotemaKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "ambiente", label: "Ambiente e rifiuti", icon: Leaf },
  { key: "scuole", label: "Scuole e istruzione", icon: GraduationCap },
  { key: "strade", label: "Strade e lavori pubblici", icon: HardHat },
  { key: "sociale", label: "Sociale e servizi alla persona", icon: HeartHandshake },
  { key: "cultura", label: "Cultura, sport e turismo", icon: Palette },
  { key: "mobilita", label: "Mobilità e trasporti", icon: Bus },
  { key: "altro", label: "Altri servizi e forniture", icon: Package },
];

const MACROTEMA_LABEL: Record<string, string> = Object.fromEntries(
  MACROTEMA_OPTIONS.map((o) => [o.key, o.label]),
);

function readStoredToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function AdminAppalti() {
  const [token, setToken] = useState<string>(() => readStoredToken());

  if (!token) {
    return (
      <TokenGate
        onAuthenticated={(value) => {
          try {
            sessionStorage.setItem(TOKEN_STORAGE_KEY, value);
          } catch {
            /* sessionStorage unavailable — keep in-memory only */
          }
          setToken(value);
        }}
      />
    );
  }

  return (
    <AdminEditor
      token={token}
      onSignOut={() => {
        try {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setToken("");
      }}
    />
  );
}

function TokenGate({
  onAuthenticated,
}: {
  onAuthenticated: (token: string) => void;
}) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("Inserisci il token di accesso.");
      return;
    }
    onAuthenticated(trimmed);
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="mx-auto max-w-md">
        <Card className="border-brand/30 shadow-md">
          <CardHeader className="space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="font-display text-2xl">
              Area Redazione
            </CardTitle>
            <CardDescription>
              Inserisci il token di accesso per assegnare gli appalti agli ambiti
              di spesa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ingest-token">Token di accesso</Label>
                <Input
                  id="ingest-token"
                  type="password"
                  autoComplete="off"
                  placeholder="••••••••••••"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  aria-label="Token di accesso redazione"
                />
              </div>
              <Button type="submit" variant="brand" className="w-full gap-2">
                <ShieldCheck className="h-4 w-4" />
                Accedi
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminEditor({
  token,
  onSignOut,
}: {
  token: string;
  onSignOut: () => void;
}) {
  const queryClient = useQueryClient();
  const authRequest = {
    request: { headers: { Authorization: `Bearer ${token}` } },
  };

  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [editingLocation, setEditingLocation] = useState<Contract | null>(null);
  const [locationFilter, setLocationFilter] = useState<
    "all" | "review" | "confirmed"
  >("all");
  const [quickQueue, setQuickQueue] = useState<Contract[]>([]);
  const [quickIndex, setQuickIndex] = useState(0);

  const { data: contracts, isLoading } = useListContracts();
  const updateMacrotema = useUpdateContractMacrotema(authRequest);

  const refreshContracts = () => {
    queryClient.invalidateQueries({ queryKey: getListContractsQueryKey() });
    queryClient.invalidateQueries({
      queryKey: getGetContractsAnalyticsQueryKey(),
    });
  };

  const isAuthError = (error: unknown): boolean => {
    const status = (error as { status?: number } | null)?.status;
    return status === 401 || status === 403;
  };

  const handleAuthError = () => {
    toast.error("Sessione scaduta o token non valido", {
      description: "Effettua di nuovo l'accesso.",
    });
    onSignOut();
  };

  const hasLocation = (c: Contract) => typeof c.latitude === "number";
  // Un appalto va "rivisto" quando non ha posizione oppure ne ha una soltanto
  // suggerita automaticamente (geoVerify) che la redazione deve confermare.
  const needsReview = (c: Contract) => !hasLocation(c) || c.geoVerify === true;

  const toReview = useMemo(
    () => (contracts ?? []).filter((c) => needsReview(c)),
    [contracts],
  );

  const total = contracts?.length ?? 0;
  const confirmedCount = total - toReview.length;
  const confirmedPct = total ? Math.round((confirmedCount / total) * 100) : 0;

  const filtered = useMemo(() => {
    let list = contracts ?? [];
    if (locationFilter === "review") {
      list = list.filter((c) => needsReview(c));
    } else if (locationFilter === "confirmed") {
      list = list.filter((c) => !needsReview(c));
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.supplier.toLowerCase().includes(q) ||
        (c.cig ?? "").toLowerCase().includes(q),
    );
  }, [contracts, search, locationFilter]);

  const startQuickPlace = () => {
    if (toReview.length === 0) return;
    setQuickQueue(toReview);
    setQuickIndex(0);
    setEditingLocation(toReview[0]);
  };

  const closeEditor = () => {
    setEditingLocation(null);
    setQuickQueue([]);
    setQuickIndex(0);
  };

  const advanceQuick = () => {
    const next = quickIndex + 1;
    if (next < quickQueue.length) {
      setQuickIndex(next);
      setEditingLocation(quickQueue[next]);
    } else {
      closeEditor();
      toast.success("Hai esaminato tutti gli appalti da posizionare.");
    }
  };

  const handleChange = (contract: Contract, macrotema: MacrotemaKey) => {
    if (contract.macrotema === macrotema && contract.macrotemaManual) return;
    setSavingId(contract.id);
    updateMacrotema.mutate(
      { id: contract.id, data: { macrotema } },
      {
        onSuccess: () => {
          toast.success("Ambito aggiornato", {
            description: `“${
              contract.title.length > 60
                ? `${contract.title.slice(0, 57)}…`
                : contract.title
            }” → ${MACROTEMA_LABEL[macrotema]}`,
          });
          queryClient.invalidateQueries({
            queryKey: getListContractsQueryKey(),
          });
          queryClient.invalidateQueries({
            queryKey: getGetContractsAnalyticsQueryKey(),
          });
        },
        onError: (error) => {
          if (isAuthError(error)) {
            handleAuthError();
            return;
          }
          toast.error("Impossibile aggiornare l'ambito di spesa");
        },
        onSettled: () => setSavingId(null),
      },
    );
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow text-brand">
            <Wand2 className="h-3.5 w-3.5" />
            Area Redazione
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
            Ambiti di spesa degli appalti
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Ogni appalto viene assegnato automaticamente a un ambito di spesa
            (macrotema). Qui puoi correggere la classificazione: le correzioni
            manuali non vengono più sovrascritte dall'aggiornamento automatico.
          </p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0" onClick={onSignOut}>
          <LogOut className="h-4 w-4" />
          Esci
        </Button>
      </div>

      <Card className="mb-4 border-card-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-display font-bold text-foreground">
                <MapPin className="h-4 w-4 text-brand" />
                Avanzamento mappa
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {confirmedCount} di {total} appalti con posizione confermata
                {toReview.length > 0
                  ? ` · ${toReview.length} da rivedere`
                  : " · tutti confermati"}
              </p>
            </div>
            <Button
              variant="brand"
              className="gap-2 shrink-0"
              onClick={startQuickPlace}
              disabled={toReview.length === 0}
            >
              <Locate className="h-4 w-4" />
              Rivedi in sequenza
            </Button>
          </div>
          <div
            className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={confirmedPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Appalti geolocalizzati"
          >
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${confirmedPct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            { key: "all", label: `Tutti (${total})` },
            { key: "review", label: `Da rivedere (${toReview.length})` },
            { key: "confirmed", label: `Confermati (${confirmedCount})` },
          ] as const
        ).map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={locationFilter === f.key ? "brand" : "outline"}
            onClick={() => setLocationFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca oggetto, beneficiario, CIG..."
          className="pl-9 h-11 bg-background"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-card-border bg-card p-10 text-center text-muted-foreground">
          {locationFilter === "review"
            ? "Nessun appalto da rivedere: le posizioni sono tutte confermate."
            : "Nessun appalto corrisponde alla ricerca."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((contract) => (
            <div
              key={contract.id}
              className="flex flex-col gap-3 rounded-xl border border-card-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="font-display font-bold text-foreground">
                  {contract.title}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  {contract.cig ? (
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] shadow-none"
                    >
                      CIG {contract.cig}
                    </Badge>
                  ) : null}
                  <span className="truncate">{contract.supplier}</span>
                  {contract.macrotemaManual ? (
                    <Badge className="gap-1 border-transparent bg-emerald-100 text-emerald-800 text-[10px] shadow-none dark:bg-emerald-500/20 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      Corretto a mano
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] shadow-none">
                      Automatico
                    </Badge>
                  )}
                  {typeof contract.latitude === "number" ? (
                    contract.geoVerify ? (
                      <Badge className="gap-1 border-transparent bg-amber-100 text-amber-800 text-[10px] shadow-none dark:bg-amber-500/20 dark:text-amber-300">
                        <AlertTriangle className="h-3 w-3" />
                        Posizione da verificare
                      </Badge>
                    ) : (
                      <Badge className="gap-1 border-transparent bg-sky-100 text-sky-800 text-[10px] shadow-none dark:bg-sky-500/20 dark:text-sky-300">
                        <MapPin className="h-3 w-3" />
                        Geolocalizzato
                      </Badge>
                    )
                  ) : (
                    <Badge variant="outline" className="gap-1 text-[10px] shadow-none">
                      <MapPin className="h-3 w-3" />
                      Senza posizione
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-2 sm:w-72">
                <Select
                  value={contract.macrotema ?? "altro"}
                  onValueChange={(value) =>
                    handleChange(contract, value as MacrotemaKey)
                  }
                  disabled={savingId === contract.id}
                >
                  <SelectTrigger
                    className="h-11 bg-background"
                    aria-label={`Ambito di spesa per ${contract.title}`}
                  >
                    <span className="truncate">
                      {MACROTEMA_LABEL[contract.macrotema ?? "altro"]}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {MACROTEMA_OPTIONS.map((o) => {
                      const Icon = o.icon;
                      return (
                        <SelectItem key={o.key} value={o.key}>
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {o.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="h-10 w-full gap-2"
                  onClick={() => setEditingLocation(contract)}
                >
                  <MapPin className="h-4 w-4" />
                  {typeof contract.latitude === "number"
                    ? contract.geoVerify
                      ? "Conferma posizione"
                      : "Modifica posizione"
                    : "Imposta posizione"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <LocationEditor
        contract={editingLocation}
        token={token}
        onClose={closeEditor}
        onSaved={refreshContracts}
        onAuthError={handleAuthError}
        queue={
          quickQueue.length > 0
            ? {
                position: quickIndex + 1,
                total: quickQueue.length,
                onNext: advanceQuick,
              }
            : null
        }
      />
    </div>
  );
}
