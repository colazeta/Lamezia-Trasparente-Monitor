import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { macrotemaColor, macrotemaLabel } from "@/lib/gis";
import type { MacrotemaKey } from "@workspace/api-client-react";

export const MACROTEMA_KEYS: MacrotemaKey[] = [
  "ambiente",
  "scuole",
  "strade",
  "sociale",
  "cultura",
  "mobilita",
  "altro",
];

export function MacrotemaChips({
  value,
  onChange,
}: {
  value: MacrotemaKey | null;
  onChange: (key: MacrotemaKey | null) => void;
}) {
  const colors = useColors();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      <MacrotemaChip
        label="Tutti i temi"
        color={colors.primary}
        active={value === null}
        onPress={() => onChange(null)}
      />
      {MACROTEMA_KEYS.map((key) => (
        <MacrotemaChip
          key={key}
          label={macrotemaLabel(key)}
          color={macrotemaColor(key)}
          active={value === key}
          onPress={() => onChange(key)}
        />
      ))}
    </ScrollView>
  );
}

function MacrotemaChip({
  label,
  color,
  active,
  onPress,
}: {
  label: string;
  color: string;
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
          backgroundColor: active ? color : `${color}1A`,
          borderColor: active ? color : `${color}55`,
        },
      ]}
    >
      <View style={[styles.chipDot, { backgroundColor: active ? "#fff" : color }]} />
      <Text
        style={[styles.chipText, { color: active ? "#fff" : colors.foreground }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chipRow: { gap: 8, paddingVertical: 2, paddingRight: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontFamily: "Inter_600SemiBold", fontSize: 12.5 },
});
