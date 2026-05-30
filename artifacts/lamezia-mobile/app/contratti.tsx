import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";

import { Badge, Card, EmptyState, SearchBar, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { formatAmount, formatDateOpt, intentColors } from "@/lib/civic";
import { useListContracts, type Contract } from "@workspace/api-client-react";

export default function ContrattiScreen() {
  const colors = useColors();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(input.trim()), 400);
    return () => clearTimeout(t);
  }, [input]);

  const params = useMemo(() => (search ? { search } : {}), [search]);
  const contracts = useListContracts(params);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.controls}>
        <SearchBar value={input} onChangeText={setInput} placeholder="Cerca appalto o fornitore…" />
      </View>

      {contracts.isLoading ? (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={120} radius={colors.radius + 2} />
          ))}
        </View>
      ) : contracts.isError ? (
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare gli appalti."
          onRetry={() => contracts.refetch()}
        />
      ) : (
        <FlatList
          data={contracts.data ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ContractCard contract={item} />}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          scrollEnabled={(contracts.data?.length ?? 0) > 0}
          ListEmptyComponent={
            <EmptyState icon="briefcase" title="Nessun appalto" message="Nessun risultato." />
          }
        />
      )}
    </View>
  );
}

function ContractCard({ contract }: { contract: Contract }) {
  const colors = useColors();
  const statusIntent = contract.status?.toLowerCase().includes("aggiudic")
    ? "active"
    : "monitor";
  const si = intentColors(statusIntent, colors);
  return (
    <Card style={{ gap: 8 }}>
      <View style={styles.topRow}>
        <Badge label={contract.procedureType} bg={colors.muted} fg={colors.mutedForeground} />
        {contract.status ? <Badge label={contract.status} bg={si.bg} fg={si.fg} /> : null}
      </View>
      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={3}>
        {contract.title}
      </Text>
      <Text style={[styles.supplier, { color: colors.mutedForeground }]} numberOfLines={1}>
        {contract.supplier}
      </Text>
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.amount, { color: colors.primary }]}>
          {formatAmount(contract.amount)}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {formatDateOpt(contract.awardDate)}
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
  supplier: { fontFamily: "Inter_500Medium", fontSize: 13 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 2,
  },
  amount: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 15 },
  meta: { fontFamily: "Inter_500Medium", fontSize: 12 },
});
