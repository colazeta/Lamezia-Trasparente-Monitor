import { useParams, Link } from "wouter";
import {
  useGetConfiscatedAsset,
  type ConfiscatedAssetStatus,
} from "@workspace/api-client-react";
import {
  ArrowLeft,
  ShieldOff,
  MapPin,
  Building2,
  Landmark,
  ExternalLink,
  Info,
  FileText,
  Home,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  ConfiscatedAssetsMap,
  STATUS_LABEL,
} from "@/components/ConfiscatedAssetsMap";
import { quartiereLabel } from "@/lib/gis";

const STATUS_META: Record<
  ConfiscatedAssetStatus,
  { className: string; description: string }
> = {
  sequestrato: {
    className:
      "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    description:
      "Bene sottoposto a sequestro: la confisca non è ancora definitiva.",
  },
  confiscato: {
    className:
      "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
    description:
      "Confisca definitiva: il bene è entrato nel patrimonio dello Stato.",
  },
  assegnato: {
    className:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    description:
      "Bene assegnato a un ente o a un'associazione per finalità sociali o istituzionali.",
  },
  riutilizzato: {
    className:
      "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-400",
    description:
      "Bene effettivamente riutilizzato e restituito alla collettività.",
  },
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : format(d, "dd MMMM yyyy", { locale: it });
}

export function BeneConfiscatoDetail() {
  const params = useParams();
  const slug = params.slug ?? "";
  const { data: asset, isLoading, error } = useGetConfiscatedAsset(slug);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Skeleton className="mb-4 h-8 w-40" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Info className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Bene non trovato</EmptyTitle>
            <EmptyDescription>
              Il bene confiscato richiesto non esiste o non è più disponibile.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const meta = STATUS_META[asset.status];
  const hasLocation = asset.latitude != null && asset.longitude != null;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Link href="/beni-confiscati">
        <Button
          variant="ghost"
          className="mb-4 gap-2 px-2"
          data-testid="link-back"
        >
          <ArrowLeft className="h-4 w-4" /> Tutti i beni confiscati
        </Button>
      </Link>

      <div data-tour="beni-detail" className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-brand">
              <ShieldOff className="h-5 w-5" />
              <span className="font-mono text-xs uppercase tracking-wider">
                Bene confiscato alle mafie
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              {asset.denominazione}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={meta.className}>
                {STATUS_LABEL[asset.status] ?? asset.status}
              </Badge>
              {asset.tipologia && (
                <Badge variant="secondary">{asset.tipologia}</Badge>
              )}
            </div>
            {(asset.indirizzo || asset.geoAddress) && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {asset.geoAddress || asset.indirizzo}
                {asset.geoQuartiere
                  ? ` · ${quartiereLabel(asset.geoQuartiere)}`
                  : ""}
              </div>
            )}
          </div>

          {asset.description?.trim() && (
            <Card className="p-5">
              <h2 className="mb-2 font-display text-lg font-semibold">
                Descrizione
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {asset.description}
              </p>
            </Card>
          )}

          {hasLocation && (
            <Card className="overflow-hidden p-0">
              <ConfiscatedAssetsMap
                assets={[asset]}
                selectedId={asset.id}
                className="h-[360px] w-full"
                zoom={15}
              />
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className={`border p-5 ${meta.className}`}>
            <div className="flex items-center gap-2">
              <ShieldOff className="h-5 w-5" />
              <span className="font-display text-lg font-semibold">
                {STATUS_LABEL[asset.status] ?? asset.status}
              </span>
            </div>
            <p className="mt-2 text-sm opacity-90">{meta.description}</p>
          </Card>

          <Card className="space-y-4 p-5">
            {asset.assegnatario?.trim() && (
              <div className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" /> Assegnatario
                </span>
                <span className="text-right text-sm font-semibold">
                  {asset.assegnatario}
                </span>
              </div>
            )}
            {asset.destinazioneUso?.trim() && (
              <div className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Home className="h-4 w-4" /> Destinazione d'uso
                </span>
                <span className="text-right text-sm font-semibold">
                  {asset.destinazioneUso}
                </span>
              </div>
            )}
            {asset.datiCatastali?.trim() && (
              <div className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" /> Dati catastali
                </span>
                <span className="text-right font-mono text-xs font-semibold">
                  {asset.datiCatastali}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Landmark className="h-4 w-4" /> Ultimo aggiornamento
              </span>
              <span className="text-sm font-semibold">
                {formatDate(asset.updatedAt)}
              </span>
            </div>
          </Card>

          {asset.officialUrl && (
            <a
              href={asset.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="brand" className="w-full gap-2">
                <ExternalLink className="h-4 w-4" /> Scheda ufficiale del bene
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
