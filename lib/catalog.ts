// Shared catalog vocabulary: values stored in the database and their Romanian labels.

export const DIAGONALS = [32, 43, 50, 55, 65, 75, 85] as const;

export const RESOLUTIONS = ["HD", "FULL_HD", "4K", "8K"] as const;
export type Resolution = (typeof RESOLUTIONS)[number];
export const RESOLUTION_LABELS: Record<Resolution, string> = {
  HD: "HD",
  FULL_HD: "Full HD",
  "4K": "4K Ultra HD",
  "8K": "8K",
};

export const PANEL_TYPES = ["LED", "QLED", "OLED", "MINI_LED"] as const;
export type PanelType = (typeof PANEL_TYPES)[number];
export const PANEL_LABELS: Record<PanelType, string> = {
  LED: "LED",
  QLED: "QLED",
  OLED: "OLED",
  MINI_LED: "Mini LED",
};

export const REFRESH_RATES = [50, 60, 100, 120, 144] as const;

export const NO_SMART = "Fără Smart TV";
export const SMART_OSES = ["VidaOS", "Nimbus TV", "Orbit Smart", "Lumexa OS", NO_SMART] as const;

export const BRANDS = ["Aurion", "Kairo", "Lumexa", "Nordis", "Voltra"] as const;

export const FREE_SHIPPING_THRESHOLD = 100_000; // 1.000 lei, in bani
export const SHIPPING_COST = 2_500; // 25 lei, in bani

export function resolutionLabel(value: string) {
  return RESOLUTION_LABELS[value as Resolution] ?? value;
}

export function panelLabel(value: string) {
  return PANEL_LABELS[value as PanelType] ?? value;
}
