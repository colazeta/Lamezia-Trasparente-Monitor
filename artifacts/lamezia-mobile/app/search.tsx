import { Feather } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { useListContracts, useListThemes } from "@workspace/api-client-react";

type SectionEntry = {
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  href: string;
  category: string;
};

const ALL_SECTIONS: SectionEntry[] = [
  { title: "Temi monitorati", subtitle: "Inchieste civiche aperte", icon: "folder", href: "/themes", category: "Archivio" },
  { title: "Appalti", subtitle: "Contratti e affidamenti pubblici", icon: "briefcase", href: "/contratti", category: "Appalti e risorse" },
  { title: "PNRR", subtitle: "Progetti Recovery Plan", icon: "trending-up", href: "/pnrr", category: "Appalti e risorse" },
  { title: "Delibere", subtitle: "Deliberazioni di Giunta e Consiglio", icon: "file-text", href: "/delibere", category: "Istituzioni" },
  { title: "Convocazioni", subtitle: "Sedute del Consiglio e commissioni", icon: "calendar", href: "/convocazioni", category: "Istituzioni" },
  { title: "Organi", subtitle: "Consiglio, Giunta e commissioni", icon: "home", href: "/organi", category: "Istituzioni" },
  { title: "Amministratori", subtitle: "Chi governa la città e come vota", icon: "users", href: "/amministratori", category: "Istituzioni" },
  { title: "Albo Pretorio", subtitle: "Atti e avvisi pubblicati", icon: "clipboard", href: "/albo", category: "Atti e controllo" },
  { title: "Pareri di Vigilanza", subtitle: "Controlli OIV, Revisori, ANAC", icon: "shield", href: "/pareri", category: "Atti e controllo" },
  { title: "Legalità e Trasparenza", subtitle: "Monitoraggio su trasparenza", icon: "eye", href: "/legality", category: "Atti e controllo" },
  { title: "Opendata", subtitle: "Catalogo dataset aperti", icon: "database", href: "/opendata", category: "Dati" },
  { title: "Performance", subtitle: "Indicatori e qualità della vita", icon: "bar-chart-2", href: "/performance", category: "Dati" },
  { title: "Segnalazioni", subtitle: "Invia una segnalazione civica", icon: "alert-triangle", href: "/report", category: "Partecipa" },
];

export default function SearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const hasQuery = debouncedQuery.length > 1;

  const themes = useListThemes(
    { search: debouncedQuery, sort: "relevance" },
    { query: { enabled: hasQuery } },
  );
  const contracts = useListContracts(
    { search: debouncedQuery },
    { query: { enabled: hasQuery } },
  );

  const filteredSections = useMemo(() => {
    if (!query.trim()) return ALL_SECTIONS;
    const lower = query.trim().toLowerCase();
    return ALL_SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(lower) ||
        s.subtitle.toLowerCase().includes(lower) ||
        s.category.toLowerCase().includes(lower),
    );
  }, [query]);

  const groupedSections = useMemo(() => {
    const map = new Map<string, SectionEntry[]>();
    for (const s of filteredSections) {
      const group = map.get(s.category) ?? [];
      group.push(s);
      map.set(s.category, group);
    }
    return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
  }, [filteredSections]);

  function navigate(href: string) {
    router.push(href as Href);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Search header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 14,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
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
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Cerca sezioni, temi, appalti…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Feather name="x" size={17} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.cancelBtn}>
          <Text style={[styles.cancelText, { color: colors.primary }]}>Annulla</Text>
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 110 : 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Dynamic API results */}
        {hasQuery ? (
          <>
            {/* Themes */}
            <ResultSection title="Temi">
              {themes.isLoading ? (
                <View style={{ gap: 8 }}>
                  {[0, 1].map((i) => <Skeleton key={i} height={52} radius={colors.radius} />)}
                </View>
              ) : (themes.data?.length ?? 0) > 0 ? (
                themes.data!.slice(0, 5).map((t) => (
                  <Pressable
                    key={t.id}
                    onPress={() => navigate(`/theme/${t.id}`)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  >
                    <Card style={styles.resultRow}>
                      <View style={[styles.resultIcon, { backgroundColor: colors.accent }]}>
                        <Feather name="folder" size={16} color={colors.accentForeground} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.resultTitle, { color: colors.foreground }]} numberOfLines={1}>
                          {t.title}
                        </Text>
                        {t.category ? (
                          <Text style={[styles.resultSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                            {t.category}
                          </Text>
                        ) : null}
                      </View>
                      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                    </Card>
                  </Pressable>
                ))
              ) : (
                <Text style={[styles.noResults, { color: colors.mutedForeground }]}>Nessun tema trovato</Text>
              )}
            </ResultSection>

            {/* Contracts */}
            <ResultSection title="Appalti">
              {contracts.isLoading ? (
                <View style={{ gap: 8 }}>
                  {[0, 1].map((i) => <Skeleton key={i} height={52} radius={colors.radius} />)}
                </View>
              ) : (contracts.data?.length ?? 0) > 0 ? (
                contracts.data!.slice(0, 5).map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => navigate(`/contratti/${c.id}`)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  >
                    <Card style={styles.resultRow}>
                      <View style={[styles.resultIcon, { backgroundColor: colors.accent }]}>
                        <Feather name="briefcase" size={16} color={colors.accentForeground} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.resultTitle, { color: colors.foreground }]} numberOfLines={1}>
                          {c.subject ?? c.cig}
                        </Text>
                        {c.cig ? (
                          <Text style={[styles.resultSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                            CIG {c.cig}
                          </Text>
                        ) : null}
                      </View>
                      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                    </Card>
                  </Pressable>
                ))
              ) : (
                <Text style={[styles.noResults, { color: colors.mutedForeground }]}>Nessun appalto trovato</Text>
              )}
            </ResultSection>
          </>
        ) : null}

        {/* Sections directory */}
        <Text style={[styles.dirLabel, { color: colors.mutedForeground }]}>
          {hasQuery ? "SEZIONI CORRISPONDENTI" : "ESPLORA PER SEZIONE"}
        </Text>

        {groupedSections.length === 0 ? (
          <Text style={[styles.noResults, { color: colors.mutedForeground }]}>Nessun risultato per "{query}"</Text>
        ) : (
          groupedSections.map((group) => (
            <View key={group.title} style={styles.group}>
              <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>
                {group.title.toUpperCase()}
              </Text>
              <View
                style={[
                  styles.groupCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: colors.radius + 4,
                  },
                ]}
              >
                {group.data.map((s, idx) => (
                  <Pressable
                    key={s.href}
                    onPress={() => navigate(s.href)}
                    style={({ pressed }) => [
                      styles.sectionRow,
                      {
                        borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth,
                        borderTopColor: colors.border,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <View style={[styles.sectionIcon, { backgroundColor: colors.accent }]}>
                      <Feather name={s.icon} size={17} color={colors.accentForeground} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{s.title}</Text>
                      <Text style={[styles.sectionSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                        {s.subtitle}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
                  </Pressable>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.resultSection}>
      <Text style={[styles.dirLabel, { color: colors.mutedForeground }]}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    height: "100%",
  },
  cancelBtn: { paddingLeft: 4 },
  cancelText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  content: { padding: 16, gap: 4 },
  dirLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.4,
    marginBottom: 8,
    marginTop: 16,
  },
  group: { marginBottom: 4 },
  groupLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  groupCard: {
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 15, letterSpacing: -0.2 },
  sectionSub: { fontFamily: "Inter_400Regular", fontSize: 12.5, marginTop: 1 },
  resultSection: { marginBottom: 4 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    marginBottom: 6,
  },
  resultIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  resultTitle: { fontFamily: "Inter_500Medium", fontSize: 14.5, letterSpacing: -0.1 },
  resultSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  noResults: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", paddingVertical: 12 },
});
