import { Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export function useTopInset(): number {
  const insets = useSafeAreaInsets();
  return Platform.OS === "web" ? 67 : insets.top;
}

export function ScreenHeader({
  title,
  subtitle,
  right,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  eyebrow?: string;
}) {
  const colors = useColors();
  const top = useTopInset();
  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: top + 14,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        {eyebrow ? (
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            {eyebrow.toUpperCase()}
          </Text>
        ) : null}
        <Text
          style={[styles.headerTitle, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.headerRight}>{right}</View> : null}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderRadius: colors.radius + 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Badge({
  label,
  bg,
  fg,
  icon,
}: {
  label: string;
  bg: string;
  fg: string;
  icon?: keyof typeof Feather.glyphMap;
}) {
  const colors = useColors();
  return (
    <View
      style={[styles.badge, { backgroundColor: bg, borderRadius: colors.radius }]}
    >
      {icon ? <Feather name={icon} size={11} color={fg} /> : null}
      <Text style={[styles.badgeText, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  icon,
  onPress,
  disabled,
  loading,
  variant = "primary",
}: {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "outline";
}) {
  const colors = useColors();
  const isOutline = variant === "outline";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          borderRadius: colors.radius,
          backgroundColor: isOutline ? "transparent" : colors.primary,
          borderColor: isOutline ? colors.border : colors.primary,
          borderWidth: 1,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      {icon ? (
        <Feather
          name={icon}
          size={16}
          color={isOutline ? colors.foreground : colors.primaryForeground}
        />
      ) : null}
      <Text
        style={[
          styles.buttonText,
          { color: isOutline ? colors.foreground : colors.primaryForeground },
        ]}
      >
        {loading ? "Attendere…" : label}
      </Text>
    </Pressable>
  );
}

export function Skeleton({
  width,
  height,
  radius = 6,
  style,
}: {
  width?: number | `${number}%`;
  height: number;
  radius?: number;
  style?: ViewStyle;
}) {
  const colors = useColors();
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacity]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        {
          width: width ?? "100%",
          height,
          borderRadius: radius,
          backgroundColor: colors.muted,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function EmptyState({
  icon,
  title,
  message,
  onRetry,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  message?: string;
  onRetry?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.empty}>
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor: colors.muted, borderRadius: 999 },
        ]}
      >
        <Feather name={icon} size={26} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
        {title}
      </Text>
      {message ? (
        <Text style={[styles.emptyMessage, { color: colors.mutedForeground }]}>
          {message}
        </Text>
      ) : null}
      {onRetry ? (
        <View style={{ marginTop: 14 }}>
          <PrimaryButton
            label="Riprova"
            icon="refresh-cw"
            variant="outline"
            onPress={onRetry}
          />
        </View>
      ) : null}
    </View>
  );
}

export function SearchBar({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
}) {
  const colors = useColors();
  return (
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
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        style={[styles.searchInput, { color: colors.foreground }]}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText("")} hitSlop={8}>
          <Feather name="x" size={17} color={colors.mutedForeground} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function Chip({
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

export function ChipRow<T>({
  options,
  selected,
  getLabel,
  getValue,
  onSelect,
}: {
  options: T[];
  selected: string | number | undefined;
  getLabel: (o: T) => string;
  getValue: (o: T) => string | number | undefined;
  onSelect: (v: string | number | undefined) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      {options.map((o, i) => {
        const v = getValue(o);
        return (
          <Chip
            key={`${v ?? "all"}-${i}`}
            label={getLabel(o)}
            active={selected === v}
            onPress={() => onSelect(v)}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "flex-end",
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
  chipRow: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  eyebrow: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 26,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  headerRight: { marginLeft: 12, marginBottom: 4 },
  card: {
    borderWidth: 1,
    padding: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.2,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 17,
    textAlign: "center",
  },
  emptyMessage: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
});
