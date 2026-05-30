import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Badge, Card, EmptyState, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { formatAmount, formatDateOpt, intentColors } from "@/lib/civic";
import { useGetContract } from "@workspace/api-client-react";

export default function ContractDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const contract = useGetContract(Number(id));

  if (contract.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 14 }}>
        <Skeleton height={140} radius={colors.radius + 2} />
        <Skeleton height={220} radius={colors.radius + 2} />
      </View>
    );
  }

  if (contract.isError || !contract.data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare il contratto."
          onRetry={() => contract.refetch()}
        />
      </View>
    );
  }

  const c = contract.data;
  const warn = intentColors("warn", colors);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Card style={{ gap: 12 }}>
        <View style={styles.badgeRow}>
          {c.cig ? <Badge label={`CIG ${c.cig}`} bg={intentColors("active", colors).bg} fg={colors.primary} /> : null}
          {c.cup ? <Badge label={`CUP ${c.cup}`} bg={colors.muted} fg={colors.mutedForeground} /> : null}
          {c.withoutTender ? <Badge label="Senza gara" bg={warn.bg} fg={warn.fg} /> : null}
          {c.withoutMepa ? <Badge label="Fuori MePA" bg={colors.muted} fg={colors.mutedForeground} /> : null}
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>{c.title}</Text>
        {c.description ? (
          <Text style={[styles.description, { color: colors.mutedForeground }]}>{c.description}</Text>
        ) : null}
      </Card>

      <Card style={{ gap: 2 }}>
        <MetaRow icon="dollar-sign" label="Importo" value={c.amount > 0 ? formatAmount(c.amount) : "Non disponibile"} />
        <MetaRow icon="briefcase" label="Beneficiario" value={c.supplier} />
        <MetaRow icon="award" label="Modalità di scelta" value={c.procedureType} />
        <MetaRow icon="shopping-cart" label="Strumento di acquisto" value={c.acquisitionTool ?? "Non specificato"} />
        <MetaRow icon="home" label="Stazione appaltante" value={c.stazioneAppaltante ?? "Comune di Lamezia Terme"} />
        <MetaRow icon="calendar" label="Data" value={formatDateOpt(c.awardDate)} />
        <MetaRow icon="tag" label="Stato" value={c.status} last />
      </Card>

      {c.anacUrl ? (
        <Pressable
          onPress={() => Linking.openURL(c.anacUrl as string)}
          hitSlop={8}
          style={styles.linkBtn}
        >
          <Feather name="external-link" size={15} color={colors.primary} />
          <Text style={[styles.link, { color: colors.primary }]}>Scheda ufficiale su ANAC</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

function MetaRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string | null | undefined;
  last?: boolean;
}) {
  const colors = useColors();
  if (!value) return null;
  return (
    <View style={[styles.metaRow, !last && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <Feather name={icon} size={16} color={colors.mutedForeground} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>{label.toUpperCase()}</Text>
        <Text style={[styles.metaValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 14,
    paddingBottom: Platform.OS === "web" ? 80 : 48,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  title: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 20,
    lineHeight: 27,
    letterSpacing: -0.4,
  },
  description: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
  metaRow: { flexDirection: "row", gap: 10, paddingVertical: 11 },
  metaLabel: { fontFamily: "Inter_500Medium", fontSize: 10.5, letterSpacing: 0.4 },
  metaValue: { fontFamily: "Inter_500Medium", fontSize: 14, marginTop: 2, lineHeight: 19 },
  linkBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 6 },
  link: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
