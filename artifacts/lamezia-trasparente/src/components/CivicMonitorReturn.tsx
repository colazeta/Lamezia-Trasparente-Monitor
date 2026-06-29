import { Link } from "wouter";
import { ArrowRight, Telescope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type CivicMonitorReturnProps = {
  context: string;
};

export function CivicMonitorReturn({ context }: CivicMonitorReturnProps) {
  return (
    <Card className="mt-5 flex flex-col gap-3 border-brand/20 bg-brand/5 p-3 sm:p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 rounded-md bg-brand/10 p-2 text-brand">
          <Telescope className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold">Parte del Monitor civico</p>
          <p className="mt-1 text-sm text-muted-foreground">{context}</p>
        </div>
      </div>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="w-full shrink-0 gap-2 sm:w-auto"
      >
        <Link href="/monitoraggio">
          Torna all'hub
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </Card>
  );
}
