interface ReviewedSessionSummaryInput {
  kind: "council" | "commission";
  title: { value: string | null };
}

type CommissionGroup = string;

const ROMAN_DIGITS: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

function romanToInteger(value: string): number {
  return [...value].reduceRight((total, digit, index, digits) => {
    const current = ROMAN_DIGITS[digit] ?? 0;
    const next = ROMAN_DIGITS[digits[index + 1]] ?? 0;
    return total + (current < next ? -current : current);
  }, 0);
}

function isRomanNumeral(value: string): boolean {
  return /^(?=[IVXLCDM]+$)M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(
    value,
  );
}

function commissionGroup(title: string): CommissionGroup | null {
  const joint = title.match(
    /^([IVXLCDM]+) e ([IVXLCDM]+) Commissioni consiliari/i,
  );
  if (joint && isRomanNumeral(joint[1]) && isRomanNumeral(joint[2])) {
    return `${joint[1]}-${joint[2]}`;
  }

  const single = title.match(/^([IVXLCDM]+) Commissione consiliare/i);
  if (!single || !isRomanNumeral(single[1])) return null;

  return single[1];
}

function compareCommissionGroups(
  left: CommissionGroup,
  right: CommissionGroup,
) {
  const leftParts = left.split("-");
  const rightParts = right.split("-");
  if (leftParts.length !== rightParts.length) {
    return leftParts.length - rightParts.length;
  }
  return romanToInteger(leftParts[0]) - romanToInteger(rightParts[0]);
}

function joinItalian(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} e ${items.at(-1)}`;
}

export function summarizeReviewedCommissions(
  records: readonly ReviewedSessionSummaryInput[],
): string {
  const commissionRecords = records.filter(
    (record) => record.kind === "commission",
  );
  const counts = new Map<CommissionGroup, number>();

  for (const record of commissionRecords) {
    const group = commissionGroup(record.title.value ?? "");
    if (group) counts.set(group, (counts.get(group) ?? 0) + 1);
  }

  const describedCount = Array.from(counts.values()).reduce(
    (total, count) => total + count,
    0,
  );
  const parts = Array.from(counts.keys())
    .sort(compareCommissionGroups)
    .flatMap((group) => {
      const count = counts.get(group) ?? 0;
      if (count === 0) return [];
      return [
        group.includes("-")
          ? `${count} congiunta ${group.replace("-", "–")}`
          : `${count} della ${group}`,
      ];
    });

  if (describedCount < commissionRecords.length) {
    parts.push(`${commissionRecords.length - describedCount} di altro organo`);
  }

  const sessionLabel = commissionRecords.length === 1 ? "seduta" : "sedute";
  const transcriptionLabel =
    commissionRecords.length === 1 ? "trascritta" : "trascritte";

  return `${commissionRecords.length} ${sessionLabel} di Commissione ${transcriptionLabel} dagli allegati ufficiali: ${joinItalian(parts)}`;
}
