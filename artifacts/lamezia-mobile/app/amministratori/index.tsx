import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Badge, Card, ChipRow, EmptyState, SearchBar, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { OFFICIAL_ROLES, officialRoleLabel, officialStatusInfo, intentColors } from "@/lib/civic";
import { useListOfficials, type Official } from "@workspace/api-client-react";

const ROLE_FILTERS = [{ value: undefined, label: "Tutti" }, ...OFFICIAL_ROLES];

export default function AmministratoriScreen() {
  const colors = useColors();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [role, setRole] = useState<string | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => setQ(input.trim()), 400);
    return () => clearTimeout(t);
  }, [input]);

  const params = useMemo(
    () => ({ ...(q ? { q } : {}), ...(role ? { role } : {}) }),
    [q, role],
  );
  const officials = useListOfficials(params);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.controls}>
        <SearchBar value={input} onChangeText={setInput} placeholder="Cerca per nome…" />
        <ChipRow
          options={ROLE_FILTERS}
          selected={role}
          getLabel={(o) => o.label}
          getValue={(o) => o.value}
          onSelect={(v) => setRole(v as string | undefined)}
        />
      </View>

      {officials.isLoading ? (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={76} radius={colors.radius + 2} />
          ))}
        </View>
      ) : officials.isError ? (
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare gli amministratori."
          onRetry={() => officials.refetch()}
        />
      ) : (
        <FlatList
          data={officials.data ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <OfficialRow
              official={item}
              onPress={() => router.push(`/amministratori/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          showsVerticalScrollIndicator={false}
          scrollEnabled={(officials.data?.length ?? 0) > 0}
          ListEmptyComponent={
            <EmptyState icon="users" title="Nessun risultato" message="Nessun amministratore trovato." />
          }
        />
      )}
    </View>
  );
}

function OfficialRow({ official, onPress }: { official: Official; onPress: () => void }) {
  const colors = useColors();
  const status = officialStatusInfo(official.status);
  const si = intentColors(status.intent, colors);
  const initials = official.name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <Card style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.initials, { color: colors.primaryForeground }]}>{initials}</Text>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {official.name}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.role, { color: colors.mutedForeground }]} numberOfLines={1}>
              {official.roleTitle || officialRoleLabel(official.role)}
            </Text>
            <Badge label={status.label} bg={si.bg} fg={si.fg} />
          </View>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
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
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 15 },
  name: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 15.5, letterSpacing: -0.2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  role: { fontFamily: "Inter_400Regular", fontSize: 13, flexShrink: 1 },
});
