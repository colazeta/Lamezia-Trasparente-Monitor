import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Badge, Card, EmptyState, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { formatDateOpt } from "@/lib/civic";
import {
  useGetOversightOpinion,
  type OversightOpinionDocument,
} from "@workspace/api-client-react";

export default function PareriDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const opinionId = Number(id);
  const opinion = useGetOversightOpinion(opinionId);

  if (opinion.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 14 }}>
        <Skeleton height={28} width="70%" />
        <Skeleton height={120} radius={colors.radius + 2} />
        <Skeleton height={200} radius={colors.radius + 2} />
      </View>
    );
  }

  if (opinion.isError || !opinion.data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare il parere."
          onRetry={() => opinion.refetch()}
        />
      </View>
    );
  }

  const data = opinion.data;
  const documents = data.documents ?? [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerBlock}>
        <View style={styles.topRow}>
          <Badge label={data.issuingBody} bg={colors.accent} fg={colors.accentForeground} icon="shield" />
          <Badge label={data.opinionType} bg={colors.muted} fg={colors.mutedForeground} />
          {data.referenceYear != null ? (
            <Badge label={`Rif. ${data.referenceYear}`} bg={colors.muted} fg={colors.mutedForeground} icon="calendar" />
          ) : null}
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>{data.title}</Text>
        <View style={styles.dateRow}>
          <Feather name="calendar" size={14} color={colors.mutedForeground} />
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {formatDateOpt(data.opinionDate)}
          </Text>
          {data.outcome ? (
            <>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>·</Text>
              <Feather name="check-circle" size={14} color={colors.primary} />
              <Text style={[styles.meta, { color: colors.primary }]}>{data.outcome}</Text>
            </>
          ) : null}
        </View>
      </View>

      <Card style={{ gap: 8 }}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Oggetto</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>{data.subject}</Text>
      </Card>

      {data.body ? (
        <Card style={{ gap: 8 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Testo / Sintesi</Text>
          {data.body
            .split("\n")
            .map((p) => p.trim())
            .filter((p) => p.length > 0)
            .map((p, i) => (
              <Text key={i} style={[styles.body, { color: colors.foreground }]}>
                {p}
              </Text>
            ))}
        </Card>
      ) : null}

      <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
        Documenti allegati {documents.length > 0 ? `(${documents.length})` : ""}
      </Text>

      {documents.length === 0 ? (
        <Card>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            Nessun documento allegato a questo parere.
          </Text>
        </Card>
      ) : (
        documents.map((doc) => <DocumentRow key={doc.id} doc={doc} />)
      )}
    </ScrollView>
  );
}

function DocumentRow({ doc }: { doc: OversightOpinionDocument }) {
  const colors = useColors();
  const open = () => {
    if (doc.url) Linking.openURL(doc.url);
  };
  return (
    <Pressable
      onPress={open}
      disabled={!doc.url}
      style={({ pressed }) => ({ opacity: pressed && doc.url ? 0.85 : 1 })}
    >
      <Card style={styles.docRow}>
        <View style={[styles.docIcon, { backgroundColor: colors.muted }]}>
          <Feather name="file-text" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.docTitle, { color: colors.foreground }]} numberOfLines={2}>
            {doc.title}
          </Text>
          <Text style={[styles.docMeta, { color: colors.mutedForeground }]}>
            {doc.type.toUpperCase()} · {formatDateOpt(doc.date)}
          </Text>
        </View>
        {doc.url ? (
          <Feather name="external-link" size={18} color={colors.primary} />
        ) : null}
      </Card>
    </Pressable>
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
    flexWrap: "wrap",
    gap: 6,
  },
  dateRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 5 },
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
  meta: { fontFamily: "Inter_500Medium", fontSize: 12.5 },
  docRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  docTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, lineHeight: 19 },
  docMeta: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
});
