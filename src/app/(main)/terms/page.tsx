import type { Metadata } from "next";
import { Card } from "@/components/ui/card";

const title = "利用規約";
const description =
  "Panmoaの利用条件、禁止事項、投稿の取り扱い、免責事項について説明します。";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/terms" },
  openGraph: {
    title,
    description,
    url: "/terms",
    images: ["/og_image_v2.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og_image_v2.png"],
  },
};

type Section = {
  heading: string;
  body: React.ReactNode;
};

const sections: Section[] = [
  {
    heading: "第1条（適用）",
    body: (
      <p>
        本規約は、本サービスの利用に関するPanmoa運営者（以下「運営者」）とユーザーとの間の一切の関係に適用されます。
      </p>
    ),
  },
  {
    heading: "第2条（定義）",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          「会員」とは、メールアドレス等で会員登録を行ったユーザーをいいます。
        </li>
        <li>
          「ゲスト」とは、会員登録を行わずニックネームとパスワードで投稿するユーザーをいいます。
        </li>
        <li>
          「投稿」とは、会員またはゲストが本サービス上に掲載する文章、画像等の情報をいいます。
        </li>
      </ul>
    ),
  },
  {
    heading: "第3条（利用登録）",
    body: (
      <p>
        会員登録を希望する方は、運営者の定める方法により登録するものとします。ゲストは登録なしで一部機能を利用できますが、編集・削除用パスワードの管理はユーザー自身の責任で行うものとします。
      </p>
    ),
  },
  {
    heading: "第4条（禁止事項）",
    body: (
      <>
        <p>
          ユーザーは本サービスの利用にあたり、以下の行為をしてはなりません。
        </p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>
            運営者、他のユーザー、または第三者の知的財産権、肖像権、プライバシー、名誉その他の権利を侵害する行為
          </li>
          <li>事実と異なる情報を意図的に投稿する行為</li>
          <li>過度な宣伝、勧誘、スパム行為</li>
          <li>
            他のユーザーの編集・削除用パスワードを不正に取得・利用する行為
          </li>
          <li>本サービスの運営を妨害する行為</li>
          <li>その他、運営者が不適切と判断する行為</li>
        </ul>
      </>
    ),
  },
  {
    heading: "第5条（投稿の著作権と取り扱い）",
    body: (
      <p>
        投稿に関する著作権は投稿を行ったユーザーに帰属します。ただし、ユーザーは運営者に対し、本サービスの運営・改善・広報に必要な範囲で投稿を利用（複製、表示、要約等を含む）する権利を許諾するものとします。
      </p>
    ),
  },
  {
    heading: "第6条（投稿の削除・利用制限）",
    body: (
      <p>
        運営者は、投稿が第4条に該当すると判断した場合、事前の通知なく当該投稿を削除し、またはユーザーの利用を制限できるものとします。
      </p>
    ),
  },
  {
    heading: "第7条（免責事項）",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          本サービスに掲載される投稿は投稿者個人の意見・体験であり、運営者はその正確性、完全性を保証しません。
        </li>
        <li>
          充電費用シミュレーター等のツールで算出される数値は参考情報であり、実際の請求額と異なる場合があります。
        </li>
        <li>
          ユーザー間または第三者との間で生じたトラブルについて、運営者は一切の責任を負いません。
        </li>
        <li>
          運営者は、本サービスの中断、停止、終了、利用不能または変更、ユーザーが本サービスに送信した情報の削除または消失によってユーザーに生じた損害について、運営者の故意または重過失による場合を除き、賠償の責任を負いません。
        </li>
      </ul>
    ),
  },
  {
    heading: "第8条（サービス内容の変更・中断・終了）",
    body: (
      <p>
        運営者は、ユーザーへの事前通知なく、本サービスの内容を変更し、または提供を中断・終了できるものとします。
      </p>
    ),
  },
  {
    heading: "第9条（規約の変更）",
    body: (
      <p>
        運営者は、必要と判断した場合、ユーザーへの通知なく本規約を変更できるものとします。変更後の規約は本ページに掲載した時点で効力を生じます。
      </p>
    ),
  },
  {
    heading: "第10条（準拠法・裁判管轄）",
    body: (
      <p>
        本規約の解釈にあたっては日本法を準拠法とします。本サービスに関して紛争が生じた場合には、運営者の所在地を管轄する裁判所を第一審の専属的合意管轄とします。
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline-lg text-[28px] leading-tight text-on-surface sm:text-[32px]">
          利用規約
        </h1>
        <p className="mt-2 text-body-sm text-text-muted">
          制定日：2026年8月2日
        </p>
        <p className="mt-4 max-w-3xl text-body-md leading-7 text-on-surface-variant">
          本規約は、Panmoa運営者が提供するコミュニティサービス「Panmoa」（以下「本サービス」）の利用条件を定めるものです。ユーザーは本規約に同意のうえ、本サービスをご利用ください。
        </p>
      </header>

      <Card className="divide-y divide-border-subtle p-0">
        {sections.map((section) => (
          <section key={section.heading} className="p-6 sm:p-8">
            <h2 className="font-headline-md text-lg font-semibold text-on-surface">
              {section.heading}
            </h2>
            <div className="mt-3 text-body-sm leading-7 text-on-surface-variant">
              {section.body}
            </div>
          </section>
        ))}
      </Card>
    </div>
  );
}
