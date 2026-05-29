import { useEffect, useState } from "react";
import { useListContracts, useListThemes } from "@workspace/api-client-react";
import { Search, FileText, Filter, ArrowRight, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Link } from "wouter";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function Contracts() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [themeId, setThemeId] = useState<string>("all");

  const { data: themes, isLoading: themesLoading } = useListThemes();
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: contracts, isLoading } = useListContracts({
    search: debouncedSearch || undefined,
    themeId: themeId !== "all" ? Number(themeId) : undefined
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">Appalti Pubblici</h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          Database degli affidamenti e dei contratti pubblici. Monitoriamo dove vengono spesi i soldi della comunità e chi esegue i lavori.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cerca per oggetto o fornitore..." 
            className="pl-9 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-72">
          <Select value={themeId} onValueChange={setThemeId}>
            <SelectTrigger className="h-11">
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {themeId === "all" ? "Tutti i Temi" : themes?.find(t => t.id.toString() === themeId)?.title || "Tema"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i Temi</SelectItem>
              {!themesLoading && themes?.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px]">Oggetto</TableHead>
                <TableHead>Fornitore</TableHead>
                <TableHead className="text-right">Importo</TableHead>
                <TableHead className="hidden md:table-cell">Procedura</TableHead>
                <TableHead className="hidden lg:table-cell">Data</TableHead>
                <TableHead className="text-center">Tema</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-full" /><Skeleton className="h-4 w-2/3 mt-2" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : contracts && contracts.length > 0 ? (
                contracts.map(contract => (
                  <TableRow key={contract.id} className="group">
                    <TableCell>
                      <div className="font-medium text-foreground">{contract.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2" title={contract.description}>
                        {contract.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{contract.supplier}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-mono font-medium whitespace-nowrap text-primary">
                        € {contract.amount.toLocaleString('it-IT')}
                      </div>
                      <Badge variant="outline" className="mt-1 text-[10px] font-normal leading-none shadow-none">{contract.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {contract.procedureType}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm font-mono text-muted-foreground whitespace-nowrap">
                      {format(new Date(contract.awardDate), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="text-center">
                      {contract.themeId ? (
                        <Link href={`/temi/${contract.themeId}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-muted-foreground/30">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Nessun appalto trovato con i filtri attuali.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
