import { Link } from "wouter";
import { useListOrgani, type Organo } from "@workspace/api-client-react";
import {
  Landmark,
  Users,
  CalendarClock,
  ChevronRight,
  History,
  UserRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  isOrganoList,
  listStaticOrgani,
} from "@/lib/institutionalStaticData";

const ORGANO_LABELS: Record<string, string> = {
  consiglio: "Consiglio",
  giunta: "Giunta",
  commissione: "Commissione",
};

export function Organi() {
  const { data: organiData, isLoading } = useListOrgani();
  const organi: Organo[] = isOrganoList(organiData)
    ? organiData
    : listStaticOrgani();
  const showLoading = isLoading && organi.length === 0;
  const totalCurrentMembers = organi.reduce((sum, o) => sum + o.memberCount, 0);
  const totalHistoryRows = organi.reduce((sum, o) => sum + o.historyCount, 0);
  const totalSedute = organi.reduce((sum, o) => sum + o.sedutaCount, 0);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <div className="mb-8">
        <span className="eyebrow text-primary">
          <Landmark className="h-3.5 w-3.5" />
          Chi governa il Comune
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
          Organi del Comune
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-3xl">
          Il Consiglio Comunale, la Giunta e le Commissioni Consiliari: chi ne
          fa parte oggi, quali composizioni sono già storicizzate e quali
          sedute sono collegate alle fonti pubbliche disponibili.
        </p>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            Componenti correnti
          </div>
          <p className="mt-2 text-2xl font-display font-bold">
            {showLoading ? "..." : totalCurrentMembers}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <History className="h-4 w-4 text-primary" />
            Righe storiche
          </div>
          <p className="mt-2 text-2xl font-display font-bold">
            {showLoading ? "..." : totalHistoryRows}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <CalendarClock className="h-4 w-4 text-primary" />
            Sedute collegate
          </div>
          <p className="mt-2 text-2xl font-display font-bold">
            {showLoading ? "..." : totalSedute}
          </p>
        </Card>
      </div>

      <div data-tour="organi-list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {showLoading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-5 w-40 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ))
        ) : organi.length > 0 ? (
          organi.map((o) => (
            <Link key={o.id} href={`/organi/${o.slug}`} className="block">
              <Card className="group h-full p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-brand/40">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {ORGANO_LABELS[o.type] ?? o.type}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <UserRound className="h-3.5 w-3.5" />
                    Profili
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold leading-snug mb-2 group-hover:text-brand transition-colors">
                  {o.name}
                </h3>
                {o.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {o.description}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground border-t border-border pt-3">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {o.memberCount} component{o.memberCount === 1 ? "e" : "i"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5" />
                    {o.historyCount} storic{o.historyCount === 1 ? "o" : "i"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {o.sedutaCount} sedut{o.sedutaCount === 1 ? "a" : "e"}
                  </span>
                  <ChevronRight className="ml-auto h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <div className="sm:col-span-2 lg:col-span-3">
            <Empty className="border bg-muted/20">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Landmark />
                </EmptyMedia>
                <EmptyTitle>Nessun organo disponibile</EmptyTitle>
                <EmptyDescription>
                  Gli organi del Comune non sono al momento disponibili.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )}
      </div>
    </div>
  );
}
