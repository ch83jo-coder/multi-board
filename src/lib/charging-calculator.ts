export type TeslaEfficiencyPreset = {
  id: string;
  label: string;
  whPerKm: number;
};

export type ElectricityTier = {
  upToKwh: number | null;
  yenPerKwh: number;
};

export type ElectricityPlan = {
  id: string;
  label: string;
  area: string;
  tiers: ElectricityTier[];
  sourceUrl: string;
};

export const DATA_UPDATED_AT = "2026-07-23";
export const RENEWABLE_LEVY_YEN_PER_KWH = 4.18;

export const TESLA_EFFICIENCY_PRESETS: TeslaEfficiencyPreset[] = [
  { id: "model-3-rwd", label: "Model 3 RWD", whPerKm: 119 },
  {
    id: "model-3-long-range",
    label: "Model 3 ロングレンジ AWD",
    whPerKm: 123,
  },
  {
    id: "model-3-performance",
    label: "Model 3 Performance",
    whPerKm: 146,
  },
  { id: "model-y-rwd", label: "Model Y RWD", whPerKm: 130 },
  {
    id: "model-y-long-range",
    label: "Model Y ロングレンジ AWD",
    whPerKm: 138,
  },
  { id: "model-y-l", label: "Model Y L", whPerKm: 127 },
  { id: "custom", label: "カスタム入力", whPerKm: 140 },
];

export const ELECTRICITY_PLANS: ElectricityPlan[] = [
  {
    id: "tepco-standard-s",
    label: "東京電力 スタンダードS",
    area: "関東",
    tiers: [
      { upToKwh: 120, yenPerKwh: 29.8 },
      { upToKwh: 300, yenPerKwh: 36.4 },
      { upToKwh: null, yenPerKwh: 40.49 },
    ],
    sourceUrl:
      "https://www.tepco.co.jp/ep/private/plan/standard/kanto/index-j.html",
  },
  {
    id: "chubu-meter-rate-b",
    label: "中部電力 従量電灯B",
    area: "中部",
    tiers: [
      { upToKwh: 120, yenPerKwh: 21.2 },
      { upToKwh: 300, yenPerKwh: 25.67 },
      { upToKwh: null, yenPerKwh: 28.62 },
    ],
    sourceUrl:
      "https://miraiz.chuden.co.jp/home/electric/menu/basic/meterrate_hba/",
  },
  {
    id: "hepco-meter-rate-b",
    label: "北海道電力 従量電灯B",
    area: "北海道",
    tiers: [
      { upToKwh: 120, yenPerKwh: 35.69 },
      { upToKwh: 280, yenPerKwh: 41.98 },
      { upToKwh: null, yenPerKwh: 45.7 },
    ],
    sourceUrl:
      "https://www.hepco.co.jp/home/price/ratemenu/meterratelight.html",
  },
  {
    id: "kyuden-meter-rate-b",
    label: "九州電力 従量電灯B",
    area: "九州",
    tiers: [
      { upToKwh: 120, yenPerKwh: 18.37 },
      { upToKwh: 300, yenPerKwh: 23.97 },
      { upToKwh: null, yenPerKwh: 26.97 },
    ],
    sourceUrl:
      "https://customer.kyuden.co.jp/ja/electricity/home-plan/jyuryo-b.html",
  },
];

export const CHARGING_SOURCE_LINKS = [
  {
    label: "Tesla 車種別の交流電力量消費率",
    href: "https://www.tesla.com/ja_jp/support/range-calculator-ref",
  },
  {
    label: "Tesla スーパーチャージャー料金の確認方法",
    href: "https://www.tesla.com/ja_jp/support/charging/supercharging",
  },
  {
    label: "経済産業省 2026年度 再エネ賦課金",
    href: "https://www.meti.go.jp/press/2025/03/20260319004/20260319004.html",
  },
];

function calculateTieredCost(kwh: number, tiers: ElectricityTier[]) {
  let total = 0;
  let previousLimit = 0;
  let remaining = Math.max(0, kwh);

  for (const tier of tiers) {
    const capacity =
      tier.upToKwh === null ? remaining : tier.upToKwh - previousLimit;
    const usedInTier = Math.min(remaining, Math.max(0, capacity));
    total += usedInTier * tier.yenPerKwh;
    remaining -= usedInTier;
    if (tier.upToKwh !== null) previousLimit = tier.upToKwh;
    if (remaining <= 0) break;
  }

  return total;
}

export function calculateIncrementalElectricityCost({
  baselineKwh,
  chargingKwh,
  tiers,
  customRate,
}: {
  baselineKwh: number;
  chargingKwh: number;
  tiers: ElectricityTier[] | null;
  customRate: number;
}) {
  if (!tiers) return Math.max(0, chargingKwh) * Math.max(0, customRate);
  return (
    calculateTieredCost(baselineKwh + chargingKwh, tiers) -
    calculateTieredCost(baselineKwh, tiers)
  );
}
