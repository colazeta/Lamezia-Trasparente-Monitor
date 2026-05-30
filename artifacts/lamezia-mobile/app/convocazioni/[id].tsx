import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";

import { Badge, Card, EmptyState, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { formatDateOpt } from "@/lib/civic";
import { useGetSeduta } from "@workspace/api-client-react";

export default function SedutaDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sedutaId = Number(id);
  const seduta = useGetSeduta(sedutaId);

  if (seduta.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 14 }}>
        <Skeleton height={28} width="70%" />
        <Skeleton height={120} radius={colors.radius + 2} />
        <Skeleton height={200} radius={colors.radius + 2} />
      </View>
    );
  }

  if (seduta.isError || !seduta.data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare la seduta."
          onRetry={() => seduta.refetch()}
        />
      </View>
    );
  }

  const data = seduta.data;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerBlock}>
        <View style={styles.topRow}>
          <Badge
            label={data.subcategory || data.tipologia || "Seduta"}
            bg={colors.accent}
            fg={colors.accentForeground}
          />
          <View style={styles.dateRow}>
            <Feather name="calendar" size={14} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {formatDateOpt(data.dataAtto ?? data.pubStart)}
            </Text>
          </View>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>{data.oggetto}</Text>
      </View>

      {data.summary ? (
        <Card style={{ gap: 8 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sintesi</Text>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>{data.summary}</Text>
        </Card>
      ) : null}

      <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
        Interventi {data.interventions.length > 0 ? `(${data.interventions.length})` : ""}
      </Text>

      {!data.hasReport || data.interventions.length === 0 ? (
        <Card>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            Nessun resoconto disponibile per questa seduta.
          </Text>
        </Card>
      ) : (
        data.interventions
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((iv) => (
            <Card key={iv.id} style={{ gap: 6 }}>
              <View style={styles.speakerRow}>
                <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                  <Feather name="user" size={15} color={colors.secondaryForeground} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.speaker, { color: colors.foreground }]}>
                    {iv.speakerName}
                  </Text>
                  {iv.speakerRole ? (
                    <Text style={[styles.speakerRole, { color: colors.mutedForeground }]}>
                      {iv.speakerRole}
                    </Text>
                  ) : null}
                </View>
              </View>
              <Text style={[styles.body, { color: colors.foreground }]}>{iv.content}</Text>
            </Card>
          ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 14,
    paddingBottom: Platform.OS === "web" ? 80 : 48,
  },
  headerBlock: { gap: 10 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  title: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 21,
    lineHeight: 27,
    letterSpacing: -0.4,
  },
  sectionTitle: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 15 },
  sectionLabel: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 17,
    letterSpacing: -0.2,
    marginTop: 2,
  },
  body: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
  speakerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  speaker: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  speakerRole: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 1 },
  meta: { fontFamily: "Inter_500Medium", fontSize: 12.5 },
});
