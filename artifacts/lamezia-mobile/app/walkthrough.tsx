import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useHelper } from "@/context/HelperContext";
import { useColors } from "@/hooks/useColors";
import { type WalkthroughSlide, FALLBACK_SLIDES } from "@/lib/helper";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function WalkthroughScreen() {
  const colors = useColors();
  const router = useRouter();
  const { markWalkthroughSeen, slides } = useHelper();
  const insets = useSafeAreaInsets();

  const activeSlides = slides.length > 0 ? slides : FALLBACK_SLIDES;
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList<WalkthroughSlide>>(null);

  const isLast = activeIndex === activeSlides.length - 1;

  const finish = async () => {
    await markWalkthroughSeen();
    if (router.canGoBack()) {
      router.back();
    }
  };

  const goNext = () => {
    if (isLast) {
      finish();
      return;
    }
    const next = activeIndex + 1;
    flatRef.current?.scrollToIndex({ index: next, animated: true });
    setActiveIndex(next);
  };

  const renderSlide = ({ item }: ListRenderItemInfo<WalkthroughSlide>) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: colors.accent, borderRadius: colors.radius + 8 },
        ]}
      >
        <Feather name={item.icon as any} size={48} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>{item.body}</Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingBottom: insets.bottom + 20 },
      ]}
    >
      <Pressable
        onPress={finish}
        hitSlop={12}
        style={[styles.skipBtn, { top: insets.top + (Platform.OS === "web" ? 80 : 16) }]}
      >
        <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Salta</Text>
      </Pressable>

      <FlatList
        ref={flatRef}
        data={activeSlides}
        renderItem={renderSlide}
        keyExtractor={(s) => s.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIndex(idx);
        }}
        style={styles.list}
      />

      <View style={styles.dotsRow}>
        {activeSlides.map((s, i) => (
          <View
            key={s.id}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === activeIndex ? colors.primary : colors.border,
                width: i === activeIndex ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>

      <Pressable
        onPress={goNext}
        style={({ pressed }) => [
          styles.nextBtn,
          {
            backgroundColor: colors.primary,
            borderRadius: colors.radius,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={[styles.nextBtnText, { color: colors.primaryForeground }]}>
          {isLast ? "Inizia a esplorare" : "Avanti"}
        </Text>
        <Feather
          name={isLast ? "check" : "arrow-right"}
          size={18}
          color={colors.primaryForeground}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  skipBtn: {
    position: "absolute",
    right: 24,
    zIndex: 10,
  },
  skipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
  list: {
    flex: 1,
    marginTop: Platform.OS === "web" ? 60 : 40,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 24,
  },
  iconWrap: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 26,
    letterSpacing: -0.5,
    textAlign: "center",
    lineHeight: 34,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 28,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "88%",
  },
  nextBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
});
