import { ShieldAlert, BookOpen, AlertTriangle, Info, TrendingUp, HandCoins, Users } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { useListCategories, useListThemes, useMarkThemeRelevant, getListThemesQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ThemeCardProps {
  theme: any;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "brand" | "success" | "warning", icon: any }> = {
  aperto: { label: "Aperto", variant: "destructive", icon: AlertTriangle },
  in_corso: { label: "In Corso", variant: "brand", icon: TrendingUp },
  monitoraggio: { label: "In Monitoraggio", variant: "warning", icon: BookOpen },
  chiuso: { label: "Risolto/Chiuso", variant: "success", icon: ShieldAlert },
};

export function ThemeCard({ theme }: ThemeCardProps) {
  const queryClient = useQueryClient();
  const markRelevant = useMarkThemeRelevant();
  
  const handleRelevant = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    markRelevant.mutate({ id: theme.id }, {
      onSuccess: () => {
        toast.success("Segnato come rilevante", {
          description: "Il tuo interesse aiuta a stabilire le priorità civiche."
        });
        queryClient.invalidateQueries({ queryKey: ["/api/themes"] });
        queryClient.invalidateQueries({ queryKey: [`/api/themes/${theme.id}`] });
      },
      onError: () => {
        toast.error("Errore", { description: "Non è stato possibile segnare il tema come rilevante." });
      }
    });
  };

  const statusInfo = statusMap[theme.status] || { label: theme.status, variant: "outline", icon: Info };
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="group flex flex-col h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-brand/40">
      <Link href={`/temi/${theme.id}`} className="flex-1 flex flex-col p-5 gap-4">
        <div className="flex justify-between items-start gap-4">
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/40">
            {theme.categoryName}
          </Badge>
          <Badge variant={statusInfo.variant as any} className="gap-1 shadow-none">
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
        </div>
        
        <div>
          <h3 className="font-display font-bold text-xl leading-tight mb-2 group-hover:text-brand transition-colors">
            {theme.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3">
            {theme.summary}
          </p>
        </div>
      </Link>
      
      <div className="mt-auto px-5 py-4 border-t bg-muted/10 flex items-center justify-between">
        <div className="text-xs text-muted-foreground font-mono">
          Aggiornato il {format(new Date(theme.updatedAt), 'dd MMM yyyy', { locale: it })}
        </div>
        
        <div className="flex items-center gap-2">
          <span
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
            title={`${theme.followerCount} follower`}
          >
            <Users className="h-4 w-4" />
            <span className="font-mono">{theme.followerCount}</span>
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleRelevant}
            disabled={markRelevant.isPending}
          >
            <HandCoins className="h-4 w-4" />
            <span className="font-mono">{theme.relevanceCount}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ThemeCardSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden border-border/50">
      <div className="flex-1 flex flex-col p-5 gap-4">
        <div className="flex justify-between items-start gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div>
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="px-5 py-4 border-t bg-muted/10 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-16" />
      </div>
    </Card>
  );
}
