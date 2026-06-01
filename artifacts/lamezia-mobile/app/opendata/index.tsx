import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Badge, Card, ChipRow, EmptyState, SearchBar, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { formatDateOpt } from "@/lib/civic";
import {
  useGetOpendataFeedStatus,
  useListOpendataDatasets,
  type ListOpendataDatasetsParams,
  type OpendataDataset,
} from "@workspace/api-client-react";

const PORTAL_URL = "https://opendata.comune.lamezia-terme.cz.it";

export default function OpendataScreen() {
  const colors = useColors();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [theme, setTheme] = useState<string | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => setSearch(input.trim()), 400);
    return () => clearTimeout(t);
  }, [input]);

  const params = useMemo(() => {
    const p: ListOpendataDatasetsParams = {};
    if (search) p.search = search;
    if (category) p.category = category;
    return p;
  }, [search, category]);

  const datasets = useListOpendataDatasets(params);
  const allDatasets = useListOpendataDatasets({});
  const feedStatus = useGetOpendataFeedStatus();

  const categories = useMemo(() => {
    const set = new Set<string>();
    (allDatasets.data ?? []).forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allDatasets.data]);

  const categoryOptions = useMemo(
    () => [
      { label: "Tutte le categorie", value: undefined as string | undefined },
      ...categories.map((c) => ({ label: c, value: c as string | undefined })),
    ],
    [categories],
  );

  const themes = useMemo(() => {
    const set = new Set<string>();
    (datasets.data ?? []).forEach((d) => {
      if (d.theme) set.add(d.theme);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [datasets.data]);

  const themeOptions = useMemo(
    () => [
      { label: "Tutti i temi", value: undefined as string | undefined },
      ...themes.map((t) => ({ label: t, value: t as string | undefined })),
    ],
    [themes],
  );

  useEffect(() => {
    if (theme && !themes.includes(theme)) setTheme(undefined);
  }, [themes, theme]);

  const items = useMemo(() => {
    const list = datasets.data ?? [];
    return theme ? list.filter((d) => d.theme === theme) : list;
  }, [datasets.data, theme]);

  const Header = (
    <View style={styles.headerArea}>
      <FeedBanner feedStatus={feedStatus.data} />
      {categories.length > 0 ? (
        <ChipRow
          options={categoryOptions}
          selected={category}
          getLabel={(o) => o.label}
          getValue={(o) => o.value}
          onSelect={(v) => setCategory(v as string | undefined)}
        />
      ) : null}
      {themes.length > 0 ? (
        <ChipRow
          options={themeOptions}
          selected={theme}
          getLabel={(o) => o.label}
          getValue={(o) => o.value}
          onSelect={(v) => setTheme(v as string | undefined)}
        />
      ) : null}
      <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
        {items.length} {items.length === 1 ? "dataset" : "dataset"}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.controls}>
        <SearchBar
          value={input}
          onChangeText={setInput}
          placeholder="Cerca dataset per titolo, tema…"
        />
      </View>

      {datasets.isLoading ? (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={120} radius={colors.radius + 2} />
          ))}
        </View>
      ) : datasets.isError ? (
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare i dataset."
          onRetry={() => datasets.refetch()}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <DatasetCard dataset={item} onPress={() => router.push(`/opendata/${item.id}`)} />
          )}
          ListHeaderComponent={Header}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState
              icon="database"
              title="Nessun dataset"
              message="Nessun dataset corrisponde ai filtri attivi."
            />
          }
        />
      )}
    </View>
  );
}

function FeedBanner({
  feedStatus,
}: {
  feedStatus?: { lastUpdatedAt?: string | null; itemsTotal?: number; url?: string | null };
}) {
  const colors = useColors();
  const url = feedStatus?.url || PORTAL_URL;
  return (
    <Card style={{ gap: 8 }}>
      <View style={styles.feedRow}>
        <Feather name="refresh-cw" size={14} color={colors.primary} />
        <Text style={[styles.feedText, { color: colors.mutedForeground }]}>
          Ultimo aggiornamento:{" "}
          <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
            {formatDateOpt(feedStatus?.lastUpdatedAt)}
          </Text>
          {feedStatus?.itemsTotal ? ` · ${feedStatus.itemsTotal} dataset` : ""}
        </Text>
      </View>
      <Pressable onPress={() => Linking.openURL(url)} hitSlop={8} style={styles.linkBtn}>
        <Feather name="external-link" size={13} color={colors.primary} />
        <Text style={[styles.link, { color: colors.primary }]}>Portale Opendata del Comune</Text>
      </Pressable>
    </Card>
  );
}

function DatasetCard({ dataset, onPress }: { dataset: OpendataDataset; onPress: () => void }) {
  const colors = useColors();
  const formats = useMemo(() => {
    const set = new Set<string>();
    dataset.resources.forEach((r) => {
      if (r.format) set.add(r.format.toUpperCase());
    });
    return Array.from(set).sort();
  }, [dataset.resources]);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <Card style={{ gap: 8 }}>
        <View style={styles.topRow}>
          {dataset.category ? (
            <Badge label={dataset.category} bg={colors.accent} fg={colors.accentForeground} icon="layers" />
          ) : null}
          {dataset.theme ? (
            <Badge label={dataset.theme} bg={colors.muted} fg={colors.mutedForeground} icon="tag" />
          ) : null}
        </View>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {dataset.title}
        </Text>
        {dataset.description ? (
          <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={3}>
            {dataset.description}
          </Text>
        ) : null}
        {formats.length > 0 ? (
          <View style={styles.formatRow}>
            {formats.map((f) => (
              <Badge key={f} label={f} bg={colors.muted} fg={colors.mutedForeground} />
            ))}
          </View>
        ) : null}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>
            {dataset.resourceCount} {dataset.resourceCount === 1 ? "risorsa" : "risorse"}
            {dataset.metadataModified ? ` · agg. ${formatDateOpt(dataset.metadataModified)}` : ""}
          </Text>
          <View style={styles.openRow}>
            <Text style={[styles.openText, { color: colors.primary }]}>Apri</Text>
            <Feather name="chevron-right" size={16} color={colors.primary} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  controls: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8, gap: 10 },
  list: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: Platform.OS === "web" ? 60 : 40,
  },
  headerArea: { gap: 12, marginBottom: 12 },
  feedRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  feedText: { fontFamily: "Inter_400Regular", fontSize: 12.5, flex: 1, lineHeight: 17 },
  linkBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  link: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  resultCount: { fontFamily: "Inter_500Medium", fontSize: 12.5 },
  topRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  title: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 15.5,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  description: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  formatRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 2,
  },
  meta: { fontFamily: "Inter_500Medium", fontSize: 12, flex: 1 },
  openRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  openText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
