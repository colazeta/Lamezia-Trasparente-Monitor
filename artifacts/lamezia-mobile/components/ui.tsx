import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  type StyleProp,
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
  style?: StyleProp<ViewStyle>;
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

export function NoticeBanner({
  title,
  message,
  icon = "info",
}: {
  title: string;
  message: string;
  icon?: keyof typeof Feather.glyphMap;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.notice,
        {
          backgroundColor: colors.muted,
          borderColor: colors.border,
          borderRadius: colors.radius + 2,
        },
      ]}
    >
      <Feather name={icon} size={16} color={colors.primary} style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.noticeTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.noticeBody, { color: colors.mutedForeground }]}>{message}</Text>
      </View>
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

function parseYMD(v: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

export function DateField({
  value,
  onChange,
  placeholder = "Seleziona data",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const colors = useColors();
  const scheme = useColorScheme();
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const parsed = parseYMD(value);

  const boxStyle = [
    styles.dateField,
    { borderColor: colors.border, backgroundColor: colors.background, borderRadius: 8 },
  ];

  if (Platform.OS === "web") {
    return (
      <View style={boxStyle}>
        <Feather name="calendar" size={15} color={colors.mutedForeground} />
        <input
          type="date"
          value={value}
          onChange={(e: { target: { value: string } }) => onChange(e.target.value)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            color: colors.foreground,
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            height: "100%",
            minWidth: 0,
          }}
        />
        {value ? (
          <Pressable onPress={() => onChange("")} hitSlop={8}>
            <Feather name="x" size={15} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>
    );
  }

  const open = () => {
    setTempDate(parsed ?? new Date());
    setShow(true);
  };

  const onAndroidChange = (event: DateTimePickerEvent, selected?: Date) => {
    setShow(false);
    if (event.type === "set" && selected) onChange(toYMD(selected));
  };

  return (
    <>
      <Pressable onPress={open} style={boxStyle}>
        <Feather name="calendar" size={15} color={colors.mutedForeground} />
        <Text
          style={[styles.dateText, { color: parsed ? colors.foreground : colors.mutedForeground }]}
          numberOfLines={1}
        >
          {parsed ? value : placeholder}
        </Text>
        {value ? (
          <Pressable onPress={() => onChange("")} hitSlop={8}>
            <Feather name="x" size={15} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </Pressable>

      {Platform.OS === "android" && show ? (
        <DateTimePicker
          value={parsed ?? new Date()}
          mode="date"
          display="default"
          onChange={onAndroidChange}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal visible={show} transparent animationType="fade" onRequestClose={() => setShow(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShow(false)}>
            <Pressable
              style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {}}
            >
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setShow(false)} hitSlop={8}>
                  <Text style={[styles.modalAction, { color: colors.mutedForeground }]}>Annulla</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (tempDate) onChange(toYMD(tempDate));
                    setShow(false);
                  }}
                  hitSlop={8}
                >
                  <Text style={[styles.modalAction, { color: colors.primary }]}>Fatto</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={tempDate ?? new Date()}
                mode="date"
                display="spinner"
                themeVariant={scheme === "dark" ? "dark" : "light"}
                onChange={(_e: DateTimePickerEvent, selected?: Date) => {
                  if (selected) setTempDate(selected);
                }}
                style={{ alignSelf: "stretch" }}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </>
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
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    padding: 12,
  },
  noticeTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  noticeBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 2,
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
  dateField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
  },
  dateText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopWidth: 1,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 24,
    paddingHorizontal: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  modalAction: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
});
