import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Card, EmptyState, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { useListOrgani, type Organo } from "@workspace/api-client-react";

export default function OrganiScreen() {
  const colors = useColors();
  const router = useRouter();
  const organi = useListOrgani();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {organi.isLoading ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 14, gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={120} radius={colors.radius + 2} />
          ))}
        </View>
      ) : organi.isError ? (
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare gli organi."
          onRetry={() => organi.refetch()}
        />
      ) : (
        <FlatList
          data={organi.data ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <OrganoCard
              organo={item}
              onPress={() => router.push(`/organi/${item.slug}`)}
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          scrollEnabled={(organi.data?.length ?? 0) > 0}
          ListEmptyComponent={
            <EmptyState
              icon="home"
              title="Nessun organo"
              message="Gli organi del Comune non sono disponibili."
            />
          }
        />
      )}
    </View>
  );
}

function OrganoCard({ organo, onPress }: { organo: Organo; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <Card style={{ gap: 8 }}>
        <Text style={[styles.title, { color: colors.foreground }]}>{organo.name}</Text>
        {organo.description ? (
          <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={3}>
            {organo.description}
          </Text>
        ) : null}
        <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
          <View style={styles.stat}>
            <Feather name="users" size={13} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {organo.memberCount} component{organo.memberCount === 1 ? "e" : "i"}
            </Text>
          </View>
          <View style={styles.stat}>
            <Feather name="calendar" size={13} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {organo.sedutaCount} sedut{organo.sedutaCount === 1 ? "a" : "e"}
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={16}
            color={colors.primary}
            style={{ marginLeft: "auto" }}
          />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === "web" ? 60 : 40,
  },
  title: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 17,
    letterSpacing: -0.3,
  },
  desc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 2,
  },
  stat: { flexDirection: "row", alignItems: "center", gap: 5 },
  meta: { fontFamily: "Inter_500Medium", fontSize: 12 },
});
