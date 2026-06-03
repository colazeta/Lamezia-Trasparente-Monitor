import { Feather } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useHelper } from "@/context/HelperContext";
import { useColors } from "@/hooks/useColors";
import { Skeleton } from "@/components/ui";

export default function GuidaScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sections, storyChapters, guideLoading } = useHelper();

  const handleRestartTour = () => {
    router.push("/walkthrough" as Href);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 14),
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerEyebrow, { color: colors.primary }]}>GUIDA</Text>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Il progetto</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 60 : 32) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Storia del progetto */}
        {guideLoading ? (
          <View style={{ gap: 10 }}>
            <Skeleton height={180} radius={colors.radius + 4} />
          </View>
        ) : (
          <View
            style={[
              styles.storyCard,
              { backgroundColor: colors.foreground, borderRadius: colors.radius + 4 },
            ]}
          >
            <View style={styles.storyIconRow}>
              <Feather name="eye" size={22} color={colors.background} style={{ opacity: 0.8 }} />
            </View>
            <Text style={[styles.storyTitle, { color: colors.background }]}>
              rendiamoLameziaTrasparente
            </Text>
            {storyChapters.slice(0, 2).map((ch) => (
              <Text key={ch.id} style={[styles.storyBody, { color: colors.background }]}>
                {ch.body.split("\n\n")[0].replace(/\*\*/g, "")}
              </Text>
            ))}
          </View>
        )}

        {/* Riavvia tour */}
        <Pressable
          onPress={handleRestartTour}
          style={({ pressed }) => [
            styles.tourBtn,
            {
              backgroundColor: colors.accent,
              borderRadius: colors.radius,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather name="play-circle" size={20} color={colors.primary} />
          <Text style={[styles.tourBtnText, { color: colors.primary }]}>
            Riavvia il tour introduttivo
          </Text>
        </Pressable>

        {/* Sezioni */}
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          Le sezioni dell'app
        </Text>

        {guideLoading ? (
          <View style={{ gap: 10 }}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={72} radius={colors.radius + 2} />
            ))}
          </View>
        ) : (
          sections.map((section) => (
            <Pressable
              key={section.id}
              onPress={() => section.route && router.push(section.route as Href)}
              disabled={!section.route}
              style={({ pressed }) => ({ opacity: pressed && section.route ? 0.8 : 1 })}
            >
              <View
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    borderRadius: colors.radius + 2,
                  },
                ]}
              >
                <View
                  style={[
                    styles.sectionIcon,
                    { backgroundColor: colors.accent, borderRadius: colors.radius - 2 },
                  ]}
                >
                  <Feather name={section.icon as any} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                    {section.title}
                  </Text>
                  <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
                    {section.description}
                  </Text>
                </View>
                {section.route ? (
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                ) : null}
              </View>
            </Pressable>
          ))
        )}

        {/* Apri assistente */}
        <View
          style={[
            styles.assistenteCard,
            { backgroundColor: colors.muted, borderRadius: colors.radius + 2 },
          ]}
        >
          <Feather name="message-circle" size={18} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.assistenteTitle, { color: colors.foreground }]}>
              Hai ancora domande?
            </Text>
            <Text style={[styles.assistenteDesc, { color: colors.mutedForeground }]}>
              L'assistente risponde in italiano e ti guida nelle sezioni.
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/assistente" as Href)}
            style={({ pressed }) => [
              styles.assistenteBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: colors.radius - 2,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[styles.assistenteBtnText, { color: colors.primaryForeground }]}>
              Apri
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerEyebrow: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 1.1 },
  headerTitle: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 22,
    letterSpacing: -0.4,
    marginTop: 1,
  },
  content: { paddingHorizontal: 20, paddingTop: 20, gap: 14 },
  storyCard: { padding: 22, gap: 10 },
  storyIconRow: { marginBottom: 4 },
  storyTitle: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 20,
    letterSpacing: -0.3,
  },
  storyBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 14.5,
    lineHeight: 22,
    opacity: 0.88,
  },
  tourBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tourBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  sectionLabel: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 18,
    letterSpacing: -0.3,
    marginTop: 6,
    marginBottom: 2,
  },
  sectionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sectionTitle: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 15,
    letterSpacing: -0.2,
  },
  sectionDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  assistenteCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    marginTop: 6,
  },
  assistenteTitle: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 14 },
  assistenteDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 2,
  },
  assistenteBtn: { paddingVertical: 8, paddingHorizontal: 14 },
  assistenteBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13.5 },
});
