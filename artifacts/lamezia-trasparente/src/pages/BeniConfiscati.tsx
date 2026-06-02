import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  useListConfiscatedAssets,
  useGetConfiscatedAssetsSummary,
  type ConfiscatedAsset,
  type ConfiscatedAssetStatus,
  type ListConfiscatedAssetsParams,
} from "@workspace/api-client-react";
import {
  ShieldOff,
  Info,
  MapPin,
  Building2,
  Landmark,
  ArrowRight,
  KeyRound,
  Sprout,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  ConfiscatedAssetsMap,
  STATUS_COLOR,
  STATUS_LABEL,
} from "@/components/ConfiscatedAssetsMap";

const STATUS_BADGE: Record<ConfiscatedAssetStatus, string> = {
  sequestrato:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  confiscato:
    "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  assegnato:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  riutilizzato:
    "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-400",
};

function StatusBadge({ status }: { status: ConfiscatedAssetStatus }) {
  return (
    <Badge
      variant="outline"
      className={`text-[10px] ${STATUS_BADGE[status]}`}
      data-testid={`badge-status-${status}`}
    >
      {STATUS_LABEL[status] ?? status}
    </Badge>
  );
}

function SummaryCards() {
  const { data: summary, isLoading } = useGetConfiscatedAssetsSummary();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }
  if (!summary) return null;

  const cards = [
    {
      label: "Beni mappati",
      value: String(summary.totale),
      hint: `${summary.geolocalizzati} geolocalizzati`,
      icon: Landmark,
      tone: "text-brand",
    },
    {
      label: "Confiscati",
      value: String(summary.confiscati),
      hint: `${summary.sequestrati} ancora sequestrati`,
      icon: ShieldOff,
      tone: "text-sky-600 dark:text-sky-400",
    },
    {
      label: "Assegnati",
      value: String(summary.assegnati),
      hint: "Affidati a enti o associazioni",
      icon: KeyRound,
      tone: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Riutilizzati",
      value: String(summary.riutilizzati),
      hint: "Restituiti alla collettività",
      icon: Sprout,
      tone: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label} className="flex flex-col gap-2 p-5">
            <div className={`flex items-center gap-2 ${c.tone}`}>
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium text-muted-foreground">
                {c.label}
              </span>
            </div>
            <div className="font-display text-2xl font-bold tracking-tight">
              {c.value}
            </div>
            <p className="text-xs text-muted-foreground">{c.hint}</p>
          </Card>
        );
      })}
    </div>
  );
}

export function BeniConfiscati() {
  const [status, setStatus] = useState<string>("all");
  const [tipologia, setTipologia] = useState<string>("all");

  const { data: summary } = useGetConfiscatedAssetsSummary();

  const params = useMemo(() => {
    const p: ListConfiscatedAssetsParams = {};
    if (status !== "all") p.status = status as ConfiscatedAssetStatus;
    if (tipologia !== "all") p.tipologia = tipologia;
    return p;
  }, [status, tipologia]);

  const { data: assets, isLoading } = useListConfiscatedAssets(params);

  const tipologie = useMemo(
    () => summary?.perTipologia.map((t) => t.tipologia) ?? [],
    [summary],
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 max-w-3xl space-y-3">
        <div className="flex items-center gap-2 text-brand">
          <ShieldOff className="h-5 w-5" />
          <span className="font-mono text-xs uppercase tracking-wider">
            Legalità e riuso sociale
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Beni confiscati alle mafie
        </h1>
        <p className="text-muted-foreground">
          La mappa dei beni immobili sequestrati e confiscati alla criminalità
          organizzata sul territorio di Lamezia Terme. Per ciascun bene è
          indicato lo stato (sequestrato, confiscato, assegnato o riutilizzato),
          l'eventuale ente o associazione assegnataria e la destinazione d'uso,
          per seguire il percorso di restituzione alla collettività.
        </p>
      </div>

      <div className="mb-8">
        <SummaryCards />
      </div>

      {assets && assets.length > 0 ? (
        <Card className="mb-8 overflow-hidden p-0">
          <ConfiscatedAssetsMap
            assets={assets}
            className="h-[460px] w-full"
          />
          <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border p-3 text-xs">
            {(
              Object.keys(STATUS_LABEL) as ConfiscatedAssetStatus[]
            ).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: STATUS_COLOR[s] }}
                />
                {STATUS_LABEL[s]}
              </span>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[200px]" data-testid="filter-status">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="sequestrato">Sequestrati</SelectItem>
            <SelectItem value="confiscato">Confiscati</SelectItem>
            <SelectItem value="assegnato">Assegnati</SelectItem>
            <SelectItem value="riutilizzato">Riutilizzati</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tipologia} onValueChange={setTipologia}>
          <SelectTrigger className="w-[220px]" data-testid="filter-tipologia">
            <SelectValue placeholder="Tipologia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le tipologie</SelectItem>
            {tipologie.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : assets && assets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {assets.map((a) => (
            <AssetCard key={a.id} asset={a} />
          ))}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Info className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Nessun bene trovato</EmptyTitle>
            <EmptyDescription>
              Non ci sono beni confiscati che corrispondono ai filtri
              selezionati.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}

function AssetCard({ asset }: { asset: ConfiscatedAsset }) {
  return (
    <Link href={`/beni-confiscati/${asset.slug}`}>
      <Card
        className="flex h-full cursor-pointer flex-col gap-3 p-5 transition-colors hover:border-brand/50"
        data-testid={`card-asset-${asset.slug}`}
      >
        <div className="flex items-start justify-between gap-2">
          <StatusBadge status={asset.status} />
          {asset.tipologia && (
            <Badge variant="secondary" className="text-[10px]">
              {asset.tipologia}
            </Badge>
          )}
        </div>

        <h2 className="font-display text-base font-semibold leading-tight">
          {asset.denominazione}
        </h2>

        {(asset.indirizzo || asset.geoAddress) && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {asset.geoAddress || asset.indirizzo}
            </span>
          </div>
        )}

        {asset.assegnatario?.trim() && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{asset.assegnatario}</span>
          </div>
        )}

        {asset.destinazioneUso?.trim() && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {asset.destinazioneUso}
          </p>
        )}

        <div className="mt-auto flex items-center gap-1 pt-1 text-xs font-medium text-brand">
          Dettagli <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </Card>
    </Link>
  );
}
