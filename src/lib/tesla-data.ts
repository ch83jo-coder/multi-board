import type { TeslaDataType } from "@/lib/types";

export const TESLA_MODELS = [
  "Model 3",
  "Model Y",
  "Model S",
  "Model X",
  "Cybertruck",
  "Roadster",
  "その他",
] as const;

export const PREFECTURES = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
] as const;

export const CHARGER_TYPES = [
  { value: "supercharger", label: "Teslaスーパーチャージャー" },
  { value: "destination", label: "デスティネーションチャージング" },
  { value: "public", label: "公共急速充電器" },
  { value: "home", label: "自宅・宿泊施設の普通充電" },
  { value: "other", label: "その他" },
] as const;

export const CONGESTION_LEVELS = [
  { value: "empty", label: "空いていた" },
  { value: "comfortable", label: "余裕あり" },
  { value: "busy", label: "混雑" },
  { value: "full", label: "満車・待ちあり" },
] as const;

export const OWNERSHIP_CATEGORIES = [
  { value: "maintenance", label: "点検・消耗品" },
  { value: "repair", label: "故障・修理" },
  { value: "insurance", label: "保険" },
  { value: "charging", label: "充電" },
  { value: "tax", label: "税金" },
  { value: "accessory", label: "タイヤ・アクセサリー" },
  { value: "other", label: "その他" },
] as const;

export const PRICE_REPORT_TYPES = [
  { value: "insurance", label: "保険料" },
  { value: "subsidy", label: "補助金" },
  { value: "used_price", label: "中古車価格" },
] as const;

export const TESLA_DATA_TABS: {
  value: TeslaDataType;
  label: string;
  shortLabel: string;
  icon: string;
}[] = [
  {
    value: "charging",
    label: "充電スポットレビュー",
    shortLabel: "充電",
    icon: "ev_station",
  },
  {
    value: "ownership",
    label: "維持費・故障事例",
    shortLabel: "維持費",
    icon: "build",
  },
  {
    value: "price",
    label: "保険・補助金・中古価格",
    shortLabel: "価格比較",
    icon: "compare_arrows",
  },
];

export function parseTeslaDataType(value?: string): TeslaDataType {
  return value === "ownership" || value === "price" ? value : "charging";
}

export function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function todayInJapan(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const valueByType = new Map(parts.map((part) => [part.type, part.value]));
  return `${valueByType.get("year")}-${valueByType.get("month")}-${valueByType.get("day")}`;
}

export function isValidReportDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value &&
    value <= todayInJapan()
  );
}
