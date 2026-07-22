import type { Metadata } from "next";
import Link from "next/link";
import { DataTabs } from "@/components/tesla-data/data-tabs";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { MaterialIcon } from "@/components/ui/material-icon";
import {
  getChargingReviews,
  getOwnershipCosts,
  getPriceReports,
  getViewer,
} from "@/lib/data";
import {
  CHARGER_TYPES,
  CONGESTION_LEVELS,
  OWNERSHIP_CATEGORIES,
  optionLabel,
  PRICE_REPORT_TYPES,
  parseTeslaDataType,
} from "@/lib/tesla-data";
import type { ChargingReview, OwnershipCost, PriceReport } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tesla実測データ",
  description:
    "日本のTeslaオーナーが共有した充電速度、維持費、保険料、補助金、中古価格を比較できます。",
  alternates: { canonical: "/tesla-data" },
};

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat("ja-JP");
const decimal = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 1 });

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function authorName(report: {
  author?: { username: string; avatar_url: string | null };
}) {
  return report.author?.username ?? "メンバー";
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${value}T00:00:00+09:00`));
}

function EmptyData({ type }: { type: string }) {
  return (
    <div className="px-6 py-14 text-center">
      <MaterialIcon
        name="database"
        className="text-4xl text-muted-foreground"
      />
      <p className="mt-3 text-body-md text-text-muted">
        {type}はまだありません。最初の実体験を共有してください。
      </p>
    </div>
  );
}

function ChargingView({ reports }: { reports: ChargingReview[] }) {
  const regionMap = new Map<
    string,
    { count: number; speeds: number[]; ratings: number[]; waits: number[] }
  >();
  for (const report of reports) {
    const region = regionMap.get(report.prefecture) ?? {
      count: 0,
      speeds: [],
      ratings: [],
      waits: [],
    };
    region.count += 1;
    region.speeds.push(Number(report.measured_speed_kw));
    region.ratings.push(report.rating);
    region.waits.push(report.wait_minutes);
    regionMap.set(report.prefecture, region);
  }
  const regions = [...regionMap.entries()].sort(
    ([, a], [, b]) => b.count - a.count,
  );
  if (!reports.length) return <EmptyData type="充電スポットレビュー" />;
  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 font-headline-md text-headline-md">地域別比較</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {regions.map(([prefecture, stats]) => (
            <Card key={prefecture} className="p-4">
              <div className="flex items-center justify-between">
                <strong>{prefecture}</strong>
                <Chip>{stats.count}件</Chip>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <strong className="block text-primary">
                    {decimal.format(average(stats.speeds))}
                  </strong>
                  <span className="text-label-sm text-text-muted">平均kW</span>
                </div>
                <div>
                  <strong className="block text-primary">
                    {decimal.format(average(stats.waits))}
                  </strong>
                  <span className="text-label-sm text-text-muted">
                    待ち時間
                  </span>
                </div>
                <div>
                  <strong className="block text-primary">
                    {decimal.format(average(stats.ratings))}
                  </strong>
                  <span className="text-label-sm text-text-muted">評価</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-3 font-headline-md text-headline-md">最新レビュー</h2>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-body-sm">
            <thead className="bg-surface-alt text-text-muted">
              <tr>
                <th className="px-4 py-3">スポット</th>
                <th className="px-4 py-3">地域・種類</th>
                <th className="px-4 py-3 text-right">定格 / 実測</th>
                <th className="px-4 py-3 text-right">待ち</th>
                <th className="px-4 py-3">混雑</th>
                <th className="px-4 py-3">評価</th>
                <th className="px-4 py-3">利用日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {reports.map((report) => (
                <tr key={report.id} className="align-top hover:bg-surface-alt">
                  <td className="px-4 py-3">
                    <strong className="block">{report.location_name}</strong>
                    <span className="mt-0.5 block max-w-64 text-label-sm text-text-muted">
                      {report.notes || `${authorName(report)}さんの記録`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {report.prefecture}
                    <span className="block text-label-sm text-text-muted">
                      {optionLabel(CHARGER_TYPES, report.charger_type)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {decimal.format(Number(report.max_power_kw))} /{" "}
                    <span className="text-primary">
                      {decimal.format(Number(report.measured_speed_kw))} kW
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {report.wait_minutes}分
                  </td>
                  <td className="px-4 py-3">
                    {optionLabel(CONGESTION_LEVELS, report.congestion)}
                  </td>
                  <td className="px-4 py-3 text-tertiary">
                    {"★".repeat(report.rating)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {dateLabel(report.visited_on)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}

function OwnershipView({ reports }: { reports: OwnershipCost[] }) {
  const modelMap = new Map<string, { count: number; total: number }>();
  for (const report of reports) {
    const item = modelMap.get(report.model) ?? { count: 0, total: 0 };
    item.count += 1;
    item.total += report.amount_yen;
    modelMap.set(report.model, item);
  }
  if (!reports.length) return <EmptyData type="維持費・故障事例" />;
  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 font-headline-md text-headline-md">モデル別集計</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[...modelMap.entries()].map(([model, stats]) => (
            <Card key={model} className="p-4">
              <div className="flex items-center justify-between">
                <strong>{model}</strong>
                <Chip>{stats.count}件</Chip>
              </div>
              <p className="mt-3 text-label-sm text-text-muted">平均報告額</p>
              <p className="mt-1 font-headline-md text-xl text-primary">
                {yen.format(stats.total / stats.count)}
              </p>
            </Card>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-3 font-headline-md text-headline-md">費用明細</h2>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-body-sm">
            <thead className="bg-surface-alt text-text-muted">
              <tr>
                <th className="px-4 py-3">モデル</th>
                <th className="px-4 py-3">走行距離</th>
                <th className="px-4 py-3">区分・内容</th>
                <th className="px-4 py-3 text-right">金額</th>
                <th className="px-4 py-3">発生日</th>
                <th className="px-4 py-3">投稿者</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {reports.map((report) => (
                <tr key={report.id} className="align-top hover:bg-surface-alt">
                  <td className="px-4 py-3 font-semibold">
                    {report.model}
                    <span className="block font-normal text-label-sm text-text-muted">
                      {report.model_year}年式
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {number.format(report.mileage_km)} km
                  </td>
                  <td className="px-4 py-3">
                    <Chip>
                      {optionLabel(OWNERSHIP_CATEGORIES, report.category)}
                    </Chip>
                    <span className="mt-1 block max-w-72 text-text-muted">
                      {report.details}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">
                    {yen.format(report.amount_yen)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {dateLabel(report.occurred_on)}
                  </td>
                  <td className="px-4 py-3">{authorName(report)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}

function PriceView({ reports }: { reports: PriceReport[] }) {
  const comparisonMap = new Map<
    string,
    { label: string; count: number; total: number }
  >();
  for (const report of reports) {
    const key = `${report.report_type}:${report.model}`;
    const item = comparisonMap.get(key) ?? {
      label: `${optionLabel(PRICE_REPORT_TYPES, report.report_type)} · ${report.model}`,
      count: 0,
      total: 0,
    };
    item.count += 1;
    item.total += report.amount_yen;
    comparisonMap.set(key, item);
  }
  if (!reports.length) return <EmptyData type="価格比較データ" />;
  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 font-headline-md text-headline-md">
          種類・モデル別比較
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[...comparisonMap.values()].map((stats) => (
            <Card key={stats.label} className="p-4">
              <p className="font-semibold">{stats.label}</p>
              <p className="mt-3 text-label-sm text-text-muted">
                平均額 · {stats.count}件
              </p>
              <p className="mt-1 font-headline-md text-xl text-primary">
                {yen.format(stats.total / stats.count)}
              </p>
            </Card>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-3 font-headline-md text-headline-md">比較明細</h2>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-body-sm">
            <thead className="bg-surface-alt text-text-muted">
              <tr>
                <th className="px-4 py-3">種別</th>
                <th className="px-4 py-3">モデル</th>
                <th className="px-4 py-3">地域・提供元</th>
                <th className="px-4 py-3 text-right">金額</th>
                <th className="px-4 py-3">条件</th>
                <th className="px-4 py-3">確認日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {reports.map((report) => (
                <tr key={report.id} className="align-top hover:bg-surface-alt">
                  <td className="px-4 py-3">
                    <Chip>
                      {optionLabel(PRICE_REPORT_TYPES, report.report_type)}
                    </Chip>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {report.model}
                    {report.model_year && (
                      <span className="block font-normal text-label-sm text-text-muted">
                        {report.model_year}年式
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {report.prefecture}
                    <span className="block text-label-sm text-text-muted">
                      {report.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">
                    {yen.format(report.amount_yen)}
                  </td>
                  <td className="max-w-72 px-4 py-3 text-text-muted">
                    {report.details || `${authorName(report)}さんの記録`}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {dateLabel(report.observed_on)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}

export default async function TeslaDataPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; saved?: string }>;
}) {
  const query = await searchParams;
  const type = parseTeslaDataType(query.type);
  const [charging, ownership, prices, viewer] = await Promise.all([
    getChargingReviews(),
    getOwnershipCosts(),
    getPriceReports(),
    getViewer(),
  ]);
  const totalReports = charging.length + ownership.length + prices.length;
  const averageSpeed = average(
    charging.map((report) => Number(report.measured_speed_kw)),
  );
  const averageOwnershipCost = average(
    ownership.map((report) => report.amount_yen),
  );

  return (
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 font-label-sm text-primary">
            <MaterialIcon name="database" className="text-[18px]" />
            PANMOA OWNER DATA
          </div>
          <h1 className="mt-2 font-headline-lg text-headline-lg-mobile md:text-headline-lg">
            Tesla実測データ
          </h1>
          <p className="mt-2 max-w-2xl text-body-md text-text-muted">
            オーナーが実際に確認した充電、維持費、価格情報を条件ごとに比較できます。
          </p>
        </div>
        <Link
          href={
            viewer
              ? `/tesla-data/new?type=${type}`
              : `/login?next=${encodeURIComponent(`/tesla-data/new?type=${type}`)}`
          }
          className={buttonStyles({ size: "lg" })}
        >
          <MaterialIcon name="add_chart" className="text-[19px]" />
          データを共有
        </Link>
      </header>

      {query.saved === "1" && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-secondary/20 bg-secondary-container px-4 py-3 text-body-sm text-on-secondary-container"
        >
          <MaterialIcon name="check_circle" className="text-[20px]" />
          実体験データを登録しました。比較結果に反映されています。
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-3" aria-label="データ概要">
        <Card className="p-4">
          <p className="text-label-sm text-text-muted">蓄積データ</p>
          <p className="mt-1 font-headline-md text-2xl text-primary">
            {number.format(totalReports)}件
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-label-sm text-text-muted">平均実測充電速度</p>
          <p className="mt-1 font-headline-md text-2xl text-primary">
            {decimal.format(averageSpeed)} kW
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-label-sm text-text-muted">平均維持費報告額</p>
          <p className="mt-1 font-headline-md text-2xl text-primary">
            {yen.format(averageOwnershipCost)}
          </p>
        </Card>
      </section>

      <DataTabs active={type} />

      {type === "charging" ? (
        <ChargingView reports={charging} />
      ) : type === "ownership" ? (
        <OwnershipView reports={ownership} />
      ) : (
        <PriceView reports={prices} />
      )}

      <p className="text-center text-label-sm text-text-muted">
        掲載内容は投稿者の記録です。契約・購入前には公式情報と最新条件をご確認ください。
      </p>
    </div>
  );
}
