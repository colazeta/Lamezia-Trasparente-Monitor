import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";

import { MacrotemaChips } from "@/components/MacrotemaChips";
import { Badge, Card, ChipRow, EmptyState, SearchBar, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { DELIBERA_TIPI, formatDateOpt } from "@/lib/civic";
import {
  useListDelibere,
  type MacrotemaKey,
  type Publication,
} from "@workspace/api-client-react";

export default function DelibereScreen() {
  const colors = useColors();
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<string | undefined>(undefined);
  const [macrotema, setMacrotema] = useState<MacrotemaKey | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setQ(input.trim()), 400);
    return () => clearTimeout(t);
  }, [input]);

  const params = useMemo(
    () => ({ ...(q ? { q } : {}), ...(tipo ? { tipo } : {}) }),
    [q, tipo],
  );
  const delibere = useListDelibere(params);

  const items = useMemo(() => {
    const data = delibere.data ?? [];
    if (!macrotema) return data;
    return data.filter((d) => d.macrotema === macrotema);
  }, [delibere.data, macrotema]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.controls}>
        <SearchBar value={input} onChangeText={setInput} placeholder="Cerca delibera…" />
        <ChipRow
          options={DELIBERA_TIPI}
          selected={tipo}
          getLabel={(o) => o.label}
          getValue={(o) => o.value}
          onSelect={(v) => setTipo(v as string | undefined)}
        />
        <MacrotemaChips value={macrotema} onChange={setMacrotema} />
      </View>

      {delibere.isLoading ? (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={110} radius={colors.radius + 2} />
          ))}
        </View>
      ) : delibere.isError ? (
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare le delibere."
          onRetry={() => delibere.refetch()}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <DeliberaCard pub={item} />}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          scrollEnabled={items.length > 0}
          ListEmptyComponent={
            <EmptyState icon="file-text" title="Nessuna delibera" message="Nessun risultato." />
          }
        />
      )}
    </View>
  );
}

function DeliberaCard({ pub }: { pub: Publication }) {
  const colors = useColors();
  return (
    <Card style={{ gap: 8 }}>
      <View style={styles.topRow}>
        <Badge
          label={pub.subcategory || pub.tipologia || "Delibera"}
          bg={colors.accent}
          fg={colors.accentForeground}
        />
        {pub.numRegGen ? (
          <Badge label={`N. ${pub.numRegGen}`} bg={colors.muted} fg={colors.mutedForeground} />
        ) : null}
      </View>
      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={3}>
        {pub.oggetto}
      </Text>
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>
          {pub.provenienza ?? ""}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {formatDateOpt(pub.dataAtto ?? pub.pubStart)}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  controls: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8, gap: 10 },
  list: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: Platform.OS === "web" ? 60 : 40,
  },
  topRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  title: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 15.5,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 2,
  },
  meta: { fontFamily: "Inter_500Medium", fontSize: 12 },
});
