/**
 * Formatting utilities for units and figures in Compass
 * Follows hackathon prototype guidelines:
 * - Hectares with 1-2 decimals
 * - INR crore, or lakh if value is under 1 crore; no "0.00 Cr"
 * - Clean MoM delta formatting
 */

export function formatArea(ha: number): string {
  if (ha === 0 || isNaN(ha)) return "0 ha";
  // If whole number or has 1-2 decimals
  const formatted = ha % 1 === 0 ? ha.toFixed(0) : ha.toFixed(ha >= 100 ? 1 : 2);
  return `${Number(formatted).toLocaleString("en-IN")} ha`;
}

export function formatCurrencyCr(cr: number): string {
  if (!cr || cr === 0 || isNaN(cr)) return "₹0";

  // If under 1 crore, display in Lakhs to avoid "0.xx Cr" or "0.00 Cr"
  if (cr < 1) {
    const lakh = cr * 100;
    if (lakh < 0.01) return "₹0";
    return `₹${lakh.toFixed(1)} Lakh`;
  }

  // Otherwise display in Crores
  return `₹${cr.toFixed(2)} Cr`;
}

export function formatPercentage(pct: number): string {
  if (isNaN(pct)) return "0%";
  return `${Math.round(pct)}%`;
}

export interface DeltaInfo {
  text: string;
  isPositive: boolean;
  isNeutral: boolean;
  sentiment: "positive" | "negative" | "neutral";
}

/**
 * Calculates MoM delta text and visual sentiment
 * @param current Current value
 * @param previous Previous value from monthly snapshot
 * @param unit Optional unit suffix (e.g. '%', ' ha', ' Cr')
 * @param lowerIsBetter When true (e.g. projects at risk), a decrease is positive
 */
export function calculateDelta(
  current: number,
  previous: number,
  unit: string = "%",
  lowerIsBetter: boolean = false
): DeltaInfo {
  if (previous === 0 && current === 0) {
    return { text: "0% vs last mo", isPositive: true, isNeutral: true, sentiment: "neutral" };
  }

  // Calculate percentage change
  const diff = current - previous;
  const pctChange = previous > 0 ? ((diff / previous) * 100) : (diff > 0 ? 100 : 0);
  const isPositiveDiff = diff > 0;
  const isZero = Math.abs(diff) < 0.01;

  if (isZero) {
    return { text: "0% vs last mo", isPositive: true, isNeutral: true, sentiment: "neutral" };
  }

  const sign = isPositiveDiff ? "+" : "";
  const formattedPct = `${sign}${pctChange.toFixed(1)}%`;

  let sentiment: "positive" | "negative" | "neutral" = "neutral";
  if (lowerIsBetter) {
    // For risks, negative diff is good
    sentiment = diff < 0 ? "positive" : "negative";
  } else {
    sentiment = diff > 0 ? "positive" : "negative";
  }

  return {
    text: `${formattedPct} vs last mo`,
    isPositive: isPositiveDiff,
    isNeutral: false,
    sentiment,
  };
}
