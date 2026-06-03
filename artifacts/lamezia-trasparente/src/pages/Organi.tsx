import { Link } from "wouter";
import { useListOrgani } from "@workspace/api-client-react";
import { Landmark, Users, CalendarClock, ChevronRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export function Organi() {
  const { data: organi, isLoading } = useListOrgani();

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
          fa parte e quali sedute hanno tenuto.
        </p>
      </div>

      <div data-tour="organi-list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-5 w-40 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ))
        ) : organi && organi.length > 0 ? (
          organi.map((o) => (
            <Link key={o.id} href={`/organi/${o.slug}`} className="block">
              <Card className="group h-full p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-brand/40">
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
