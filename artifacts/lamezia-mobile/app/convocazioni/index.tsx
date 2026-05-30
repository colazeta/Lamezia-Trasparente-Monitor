import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Badge, Card, ChipRow, EmptyState, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { CONVOCAZIONE_TIPI, formatDateOpt } from "@/lib/civic";
import { useListConvocazioni, type Publication } from "@workspace/api-client-react";

export default function ConvocazioniScreen() {
  const colors = useColors();
  const router = useRouter();
  const [tipo, setTipo] = useState<string | undefined>(undefined);
  const convocazioni = useListConvocazioni(tipo ? { tipo } : {});

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.controls}>
        <ChipRow
          options={CONVOCAZIONE_TIPI}
          selected={tipo}
          getLabel={(o) => o.label}
          getValue={(o) => o.value}
          onSelect={(v) => setTipo(v as string | undefined)}
        />
      </View>

      {convocazioni.isLoading ? (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={100} radius={colors.radius + 2} />
          ))}
        </View>
      ) : convocazioni.isError ? (
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare le convocazioni."
          onRetry={() => convocazioni.refetch()}
        />
      ) : (
        <FlatList
          data={convocazioni.data ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ConvocazioneCard
              pub={item}
              onPress={() => router.push(`/convocazioni/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          scrollEnabled={(convocazioni.data?.length ?? 0) > 0}
          ListEmptyComponent={
            <EmptyState icon="calendar" title="Nessuna seduta" message="Nessuna convocazione." />
          }
        />
      )}
    </View>
  );
}

function ConvocazioneCard({ pub, onPress }: { pub: Publication; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <Card style={{ gap: 8 }}>
        <View style={styles.topRow}>
          <Badge
            label={pub.subcategory || pub.tipologia || "Seduta"}
            bg={colors.accent}
            fg={colors.accentForeground}
          />
          <View style={styles.dateRow}>
            <Feather name="calendar" size={13} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {formatDateOpt(pub.dataAtto ?? pub.pubStart)}
            </Text>
          </View>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={3}>
          {pub.oggetto}
        </Text>
        <View style={styles.linkRow}>
          <Text style={[styles.link, { color: colors.primary }]}>Vedi seduta</Text>
          <Feather name="chevron-right" size={16} color={colors.primary} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  controls: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 },
  list: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: Platform.OS === "web" ? 60 : 40,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  title: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 15.5,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  meta: { fontFamily: "Inter_500Medium", fontSize: 12 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  link: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
