import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ThemeCard } from "@/components/ThemeCard";
import { EmptyState, ScreenHeader, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { THEME_SORTS } from "@/lib/civic";
import { useListCategories, useListThemes } from "@workspace/api-client-react";

export default function ThemesScreen() {
  const colors = useColors();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState<"recent" | "relevance" | "shares">("recent");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 450);
    return () => clearTimeout(t);
  }, [searchInput]);

  const categories = useListCategories();
  const params = useMemo(
    () => ({
      ...(search ? { search } : {}),
      ...(categoryId != null ? { categoryId } : {}),
      sort,
    }),
    [search, categoryId, sort],
  );
  const themes = useListThemes(params);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        eyebrow="Archivio civico"
        title="Temi monitorati"
        subtitle="Sfoglia le inchieste e i fascicoli aperti"
      />

      {/* Search */}
      <View style={styles.controls}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Feather name="search" size={17} color={colors.mutedForeground} />
          <TextInput
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder="Cerca per parola chiave…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchInput.length > 0 ? (
            <Pressable onPress={() => setSearchInput("")} hitSlop={8}>
              <Feather name="x" size={17} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>

        {/* Sort segmented */}
        <View style={[styles.segment, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
          {THEME_SORTS.map((opt) => {
            const active = sort === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setSort(opt.value)}
                style={[
                  styles.segmentItem,
                  {
                    backgroundColor: active ? colors.card : "transparent",
                    borderRadius: colors.radius - 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: active ? colors.foreground : colors.mutedForeground },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <Chip
            label="Tutte"
            active={categoryId == null}
            onPress={() => setCategoryId(undefined)}
          />
          {categories.data?.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              active={categoryId === c.id}
              onPress={() => setCategoryId(c.id)}
            />
          ))}
        </ScrollView>
      </View>

      {themes.isLoading ? (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={150} radius={colors.radius + 2} />
          ))}
        </View>
      ) : themes.isError ? (
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Non è stato possibile recuperare i temi."
          onRetry={() => themes.refetch()}
        />
      ) : (
        <FlatList
          data={themes.data ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ThemeCard theme={item} />}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          scrollEnabled={(themes.data?.length ?? 0) > 0}
          ListEmptyComponent={
            <EmptyState
              icon="search"
              title="Nessun risultato"
              message="Prova a modificare i filtri o la ricerca."
            />
          }
        />
      )}
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primary : colors.card,
          borderColor: active ? colors.primary : colors.border,
          borderRadius: 999,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? colors.primaryForeground : colors.foreground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  controls: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 10,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    height: "100%",
  },
  segment: {
    flexDirection: "row",
    padding: 3,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
  },
  segmentText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  chipRow: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  list: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: Platform.OS === "web" ? 110 : 40,
  },
});
