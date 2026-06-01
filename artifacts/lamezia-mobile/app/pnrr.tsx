import { Feather } from "@expo/vector-icons";
import React from "react";
import { FlatList, Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Badge, Card, EmptyState, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { formatAmount } from "@/lib/civic";
import { useListPnrrProjects, type PnrrProject } from "@workspace/api-client-react";

export default function PnrrScreen() {
  const colors = useColors();
  const projects = useListPnrrProjects();
  const items = projects.data?.projects ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {projects.isLoading ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={130} radius={colors.radius + 2} />
          ))}
        </View>
      ) : projects.isError ? (
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare i progetti PNRR."
          onRetry={() => projects.refetch()}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => <PnrrCard project={item} />}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          scrollEnabled={items.length > 0}
          ListEmptyComponent={
            <EmptyState icon="trending-up" title="Nessun progetto" message="Nessun progetto PNRR." />
          }
        />
      )}
    </View>
  );
}

function PnrrCard({ project }: { project: PnrrProject }) {
  const colors = useColors();
  return (
    <Card style={{ gap: 9 }}>
      <View style={styles.topRow}>
        <Badge label="PNRR" bg={colors.accent} fg={colors.accentForeground} icon="trending-up" />
        {project.mission ? (
          <Badge label={project.mission} bg={colors.muted} fg={colors.mutedForeground} />
        ) : null}
        {project.status ? (
          <Badge label={project.status} bg={colors.secondary} fg={colors.secondaryForeground} />
        ) : null}
      </View>
      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={3}>
        {project.title}
      </Text>
      {project.importoFinanziato != null ? (
        <Text style={[styles.amount, { color: colors.primary }]}>
          {formatAmount(project.importoFinanziato)}
        </Text>
      ) : null}
      {project.attuatore || project.holder ? (
        <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>
          {project.attuatore ?? project.holder}
        </Text>
      ) : null}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.docCount}>
          <Feather name="file" size={13} color={colors.mutedForeground} />
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {project.documentsCount} doc.
          </Text>
        </View>
        {project.url ? (
          <Pressable
            onPress={() => Linking.openURL(project.url)}
            hitSlop={8}
            style={styles.linkBtn}
          >
            <Text style={[styles.link, { color: colors.primary }]}>Apri scheda</Text>
            <Feather name="external-link" size={13} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "web" ? 60 : 40,
  },
  topRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  title: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 15.5,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  amount: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 15 },
  meta: { fontFamily: "Inter_500Medium", fontSize: 12 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 2,
  },
  docCount: { flexDirection: "row", alignItems: "center", gap: 5 },
  linkBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  link: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
