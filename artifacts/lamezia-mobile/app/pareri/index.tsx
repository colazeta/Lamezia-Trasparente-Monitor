import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Badge, Card, ChipRow, EmptyState, SearchBar, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { formatDateOpt } from "@/lib/civic";
import {
  useListOversightOpinions,
  type ListOversightOpinionsParams,
  type OversightOpinion,
} from "@workspace/api-client-react";

export default function PareriScreen() {
  const colors = useColors();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [issuingBody, setIssuingBody] = useState<string | undefined>(undefined);
  const [year, setYear] = useState<number | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => setSearch(input.trim()), 400);
    return () => clearTimeout(t);
  }, [input]);

  const params = useMemo(() => {
    const p: ListOversightOpinionsParams = {};
    if (search) p.search = search;
    if (issuingBody) p.issuingBody = issuingBody;
    if (year !== undefined) p.year = year;
    return p;
  }, [search, issuingBody, year]);

  const opinions = useListOversightOpinions(params);
  const allOpinions = useListOversightOpinions({});

  const issuingBodies = useMemo(() => {
    const set = new Set<string>();
    (allOpinions.data ?? []).forEach((o) => set.add(o.issuingBody));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "it"));
  }, [allOpinions.data]);

  const years = useMemo(() => {
    const set = new Set<number>();
    (allOpinions.data ?? []).forEach((o) => {
      if (o.referenceYear != null) set.add(o.referenceYear);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [allOpinions.data]);

  const bodyOptions = useMemo(
    () => [
      { label: "Tutti gli organi", value: undefined as string | undefined },
      ...issuingBodies.map((b) => ({ label: b, value: b as string | undefined })),
    ],
    [issuingBodies],
  );

  const yearOptions = useMemo(
    () => [
      { label: "Tutti gli anni", value: undefined as number | undefined },
      ...years.map((y) => ({ label: String(y), value: y as number | undefined })),
    ],
    [years],
  );

  const items = opinions.data ?? [];

  const Header = (
    <View style={styles.headerArea}>
      {issuingBodies.length > 0 ? (
        <ChipRow
          options={bodyOptions}
          selected={issuingBody}
          getLabel={(o) => o.label}
          getValue={(o) => o.value}
          onSelect={(v) => setIssuingBody(v as string | undefined)}
        />
      ) : null}
      {years.length > 0 ? (
        <ChipRow
          options={yearOptions}
          selected={year}
          getLabel={(o) => o.label}
          getValue={(o) => o.value}
          onSelect={(v) => setYear(v as number | undefined)}
        />
      ) : null}
      <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
        {items.length} {items.length === 1 ? "parere" : "pareri"}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.controls}>
        <SearchBar
          value={input}
          onChangeText={setInput}
          placeholder="Cerca per titolo, oggetto o tipo…"
        />
      </View>

      {opinions.isLoading ? (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={120} radius={colors.radius + 2} />
          ))}
        </View>
      ) : opinions.isError ? (
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare i pareri."
          onRetry={() => opinions.refetch()}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <OpinionCard opinion={item} onPress={() => router.push(`/pareri/${item.id}`)} />
          )}
          ListHeaderComponent={Header}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState
              icon="shield"
              title="Nessun parere disponibile"
              message="Non risultano pareri degli organi di vigilanza corrispondenti ai criteri selezionati."
            />
          }
        />
      )}
    </View>
  );
}

function OpinionCard({
  opinion,
  onPress,
}: {
  opinion: OversightOpinion;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <Card style={{ gap: 8 }}>
        <View style={styles.topRow}>
          <Badge label={opinion.issuingBody} bg={colors.accent} fg={colors.accentForeground} icon="shield" />
          <Badge label={opinion.opinionType} bg={colors.muted} fg={colors.mutedForeground} />
          {opinion.referenceYear != null ? (
            <Badge label={`Rif. ${opinion.referenceYear}`} bg={colors.muted} fg={colors.mutedForeground} icon="calendar" />
          ) : null}
        </View>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {opinion.title}
        </Text>
        <Text style={[styles.subject, { color: colors.mutedForeground }]} numberOfLines={3}>
          {opinion.subject}
        </Text>
        {opinion.outcome ? (
          <Text style={[styles.outcome, { color: colors.primary }]} numberOfLines={1}>
            {opinion.outcome}
          </Text>
        ) : null}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <View style={styles.dateRow}>
            <Feather name="calendar" size={13} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {formatDateOpt(opinion.opinionDate)}
            </Text>
          </View>
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
  resultCount: { fontFamily: "Inter_500Medium", fontSize: 12.5 },
  topRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  title: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 15.5,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  subject: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  outcome: { fontFamily: "Inter_600SemiBold", fontSize: 12.5 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 2,
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  meta: { fontFamily: "Inter_500Medium", fontSize: 12 },
  openRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  openText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
