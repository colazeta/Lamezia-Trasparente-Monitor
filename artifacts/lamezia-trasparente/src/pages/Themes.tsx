import { useEffect, useState } from "react";
import { useListCategories, useListThemes } from "@workspace/api-client-react";
import { Search, Filter, SlidersHorizontal, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeCard, ThemeCardSkeleton } from "@/components/theme/ThemeCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function Themes() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [sort, setSort] = useState<"recent" | "relevance" | "shares">("recent");

  const { data: categories, isLoading: categoriesLoading } = useListCategories();
  
  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: themes, isLoading: themesLoading } = useListThemes({
    search: debouncedSearch || undefined,
    categoryId: categoryId !== "all" ? Number(categoryId) : undefined,
    sort
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">Temi Monitorati</h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          Esplora le questioni pubbliche sotto osservazione. I cittadini raccolgono documenti, atti e contratti per fare chiarezza su ogni tema.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cerca per parola chiave..." 
            className="pl-9 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-[180px] h-11">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Categoria" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le Categorie</SelectItem>
              {!categoriesLoading && categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(val: any) => setSort(val)}>
            <SelectTrigger className="w-[180px] h-11">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Ordina per" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Più Recenti</SelectItem>
              <SelectItem value="relevance">Più Rilevanti</SelectItem>
              <SelectItem value="shares">Più Condivisi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {themesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <ThemeCardSkeleton key={i} />)}
        </div>
      ) : themes && themes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {themes.map(theme => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 border border-dashed rounded-xl">
          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-1">Nessun tema trovato</h3>
          <p className="text-muted-foreground">Prova a modificare i filtri di ricerca.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearch("");
              setCategoryId("all");
              setSort("recent");
            }}
          >
            Azzera filtri
          </Button>
        </div>
      )}
    </div>
  );
}
