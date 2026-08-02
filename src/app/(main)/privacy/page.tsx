import type { Metadata } from "next";
import { Card } from "@/components/ui/card";

const title = "プライバシーポリシー";
const description =
  "Panmoaが取得する情報の種類、利用目的、Cookieの利用、第三者への提供について説明します。";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/privacy" },
  openGraph: {
    title,
    description,
    url: "/privacy",
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
    heading: "1. 運営者情報",
    body: (
      <>
        <p>
          Panmoa（以下「当サービス」）は「Panmoa運営者」が個人で運営しています。お問い合わせは、以下のX（旧Twitter）アカウントのダイレクトメッセージまでご連絡ください。現時点でメールでのお問い合わせ窓口は設けておりません。
        </p>
        <a
          href="https://x.com/soloEnginerbmb"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block font-semibold text-primary hover:underline"
        >
          @soloEnginerbmb（X）
        </a>
      </>
    ),
  },
  {
    heading: "2. 取得する情報と利用目的",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>
          会員登録時：メールアドレス（Supabase
          Authによる認証・アカウント管理のため）
        </li>
        <li>
          ゲスト投稿時：ニックネーム、編集・削除用パスワード（投稿の編集・削除時の本人確認のため。パスワードは復元できない形式で保存されます）
        </li>
        <li>
          アクセス情報：IPアドレス、ブラウザ種別、閲覧ページなど（Vercel
          Analyticsによるアクセス解析・サービス改善のため）
        </li>
        <li>
          広告配信を開始した場合、Googleおよび広告配信パートナーがCookie等を用いて、ユーザーの興味関心に基づく広告を配信することがあります。
        </li>
      </ul>
    ),
  },
  {
    heading: "3. Cookieその他の技術",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>ログイン状態を維持するためのセッションCookie（Supabase Auth）</li>
        <li>アクセス状況を把握するための解析ツール（Vercel Analytics）</li>
        <li>
          広告配信を開始した場合、Googleおよびそのパートナーは、ユーザーが当サイトや他のサイトに以前アクセスした際の情報に基づいてCookieを使用し、広告を配信することがあります。ユーザーは
          <a
            href="https://adssettings.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            Google広告設定
          </a>
          でパーソナライズ広告を無効にできます。
        </li>
      </ul>
    ),
  },
  {
    heading: "4. 第三者への提供",
    body: (
      <>
        <p>
          当サービスは、法令に基づく場合を除き、取得した情報を本人の同意なく第三者に提供しません。ただし、サービス運営のため以下の外部事業者に情報の取り扱いを委託しています。
        </p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>Supabase（データベース・認証基盤）</li>
          <li>Vercel（ホスティング・アクセス解析）</li>
          <li>Google（広告配信を開始した場合の広告関連情報の取り扱い）</li>
        </ul>
      </>
    ),
  },
  {
    heading: "5. 保有期間と削除",
    body: (
      <p>
        会員が退会した場合、法令上保存が必要な場合を除き、速やかに個人情報を削除します。ゲスト投稿のパスワードは投稿削除時に削除されます。
      </p>
    ),
  },
  {
    heading: "6. ユーザーの権利",
    body: (
      <p>
        自己の情報の開示・訂正・削除を希望する場合は、上記Xアカウントまでご連絡ください。内容を確認のうえ、合理的な期間内に対応します。
      </p>
    ),
  },
  {
    heading: "7. 未成年の利用について",
    body: <p>当サービスは、特に児童を対象としたサービスではありません。</p>,
  },
  {
    heading: "8. ポリシーの変更",
    body: (
      <p>
        本ポリシーの内容は、法令の変更やサービス内容の変更に応じて予告なく改定される場合があります。改定後の内容は本ページに掲載した時点で効力を生じます。
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline-lg text-[28px] leading-tight text-on-surface sm:text-[32px]">
          プライバシーポリシー
        </h1>
        <p className="mt-2 text-body-sm text-text-muted">
          制定日・最終改定日：2026年8月2日
        </p>
        <p className="mt-4 max-w-3xl text-body-md leading-7 text-on-surface-variant">
          Panmoaは、Teslaオーナーおよび購入検討者のための情報共有コミュニティです。本ポリシーは、当サービスが取得する情報の種類、利用目的、第三者への提供、Cookie等の技術について説明します。
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
