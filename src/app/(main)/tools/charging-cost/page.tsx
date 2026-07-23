import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { ChargingCostCalculator } from "@/components/tools/charging-cost-calculator";
import { Card } from "@/components/ui/card";
import { MaterialIcon } from "@/components/ui/material-icon";
import {
  CHARGING_SOURCE_LINKS,
  DATA_UPDATED_AT,
  ELECTRICITY_PLANS,
} from "@/lib/charging-calculator";
import { absoluteUrl } from "@/lib/seo";

const title = "Tesla充電代シミュレーター｜自宅充電とスーパーチャージャーを比較";
const description =
  "Teslaの車種、月間走行距離、電気料金を入力して、自宅充電とスーパーチャージャーの月額・年間コスト差を無料で計算できます。";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tools/charging-cost" },
  openGraph: {
    title,
    description,
    url: "/tools/charging-cost",
    images: ["/og_image_v2.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og_image_v2.png"],
  },
};

const faqs = [
  {
    question: "Teslaの充電代は月いくらですか？",
    answer:
      "車種の電費、月間走行距離、充電場所の単価で変わります。例えば月1,000kmでも、自宅の段階料金とスーパーチャージャーの表示単価によって数千円の差が出ます。",
  },
  {
    question: "スーパーチャージャーの料金は全国同じですか？",
    answer:
      "同じではありません。Tesla公式案内では、場所・時間帯・稼働率などに応じて料金が変動します。利用予定地点のTeslaアプリまたは車両画面に表示される単価を入力してください。",
  },
  {
    question: "計算結果に基本料金は含まれますか？",
    answer:
      "EVを充電しなくても発生する電気の基本料金は差額に含めません。充電によって増える段階別の電力量料金、再エネ賦課金、入力した燃料費等調整単価を計算します。",
  },
];

export default function ChargingCostPage() {
  return (
    <div className="space-y-8">
      <JsonLd
        id="charging-calculator-jsonld"
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Tesla充電代シミュレーター",
            url: absoluteUrl("/tools/charging-cost"),
            description,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: 0, priceCurrency: "JPY" },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          },
        ]}
      />

      <header className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10">
          <div>
            <p className="flex items-center gap-2 font-label-md text-label-md font-semibold text-primary">
              <MaterialIcon name="calculate" className="text-[20px]" />
              登録不要・入力データは保存しません
            </p>
            <h1 className="mt-3 max-w-4xl font-headline-lg text-[30px] leading-tight text-on-surface sm:text-[38px]">
              Teslaの充電代、
              <span className="text-primary">自宅とスーパーチャージャー</span>
              でいくら違う？
            </h1>
            <p className="mt-4 max-w-3xl text-body-lg leading-7 text-on-surface-variant">
              国土交通省審査値の電費と電力会社の公開料金を使い、月額・年間コストをその場で比較します。Teslaアプリの実際の料金も入力できます。
            </p>
          </div>
          <div className="hidden size-28 items-center justify-center rounded-full bg-primary-fixed text-primary lg:flex">
            <MaterialIcon name="ev_station" className="text-[56px]" />
          </div>
        </div>
      </header>

      <ChargingCostCalculator />

      <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <Card className="p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-headline-md text-xl font-semibold">
            <MaterialIcon name="verified" className="text-primary" />
            計算に使用する公開データ
          </h2>
          <p className="mt-2 text-body-sm leading-6 text-text-muted">
            データ基準日：{DATA_UPDATED_AT}
            。料金改定や燃料費調整により実際の請求額とは異なる場合があります。
          </p>
          <div className="mt-4 grid gap-2">
            {CHARGING_SOURCE_LINKS.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle px-4 py-3 text-body-sm font-semibold text-on-surface transition-colors hover:bg-surface-alt hover:text-primary"
              >
                {source.label}
                <MaterialIcon name="open_in_new" className="text-[18px]" />
              </a>
            ))}
            {ELECTRICITY_PLANS.map((plan) => (
              <a
                key={plan.id}
                href={plan.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle px-4 py-3 text-body-sm font-semibold text-on-surface transition-colors hover:bg-surface-alt hover:text-primary"
              >
                {plan.label} 料金表
                <MaterialIcon name="open_in_new" className="text-[18px]" />
              </a>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-label-md text-label-sm font-semibold text-secondary">
                NEXT TOOL
              </p>
              <h2 className="mt-1 font-headline-md text-xl font-semibold">
                Tesla補助金かんたん検索
              </h2>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-label-sm font-semibold text-text-muted">
              準備中
            </span>
          </div>
          <p className="mt-3 text-body-sm leading-6 text-text-muted">
            郵便番号と車種から、国のCEV補助金と自治体制度を合算するツールを準備しています。2026年4月以降登録分の国費は、対象となるModel
            3・Model Yの多くで127万円です。
          </p>
          <a
            href="https://www.cev-pc.or.jp/hojo/cev.html?vm=r"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-body-sm font-semibold text-primary hover:underline"
          >
            CEV補助金の公式情報を確認
            <MaterialIcon name="open_in_new" className="text-[18px]" />
          </a>
        </Card>
      </section>

      <section aria-labelledby="charging-faq" className="space-y-3">
        <h2
          id="charging-faq"
          className="font-headline-md text-2xl font-semibold"
        >
          よくある質問
        </h2>
        <div className="grid gap-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-lg border border-border bg-white p-4 shadow-sm"
            >
              <summary className="cursor-pointer list-none pr-8 font-label-md text-label-md font-semibold marker:hidden">
                {faq.question}
              </summary>
              <p className="mt-3 border-t border-border-subtle pt-3 text-body-sm leading-6 text-text-muted">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
