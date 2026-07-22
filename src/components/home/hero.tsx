import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { Board } from "@/lib/types";

const benefits = [
  {
    icon: "speed",
    title: "実測データを比較",
    description: "充電速度や待ち時間を、地域と条件ごとに確認できます。",
  },
  {
    icon: "payments",
    title: "所有コストを共有",
    description: "保険、整備、故障、補助金の実例をモデル別に蓄積します。",
  },
  {
    icon: "forum",
    title: "オーナーに質問",
    description: "購入前の疑問を、実際の利用条件に近い人へ相談できます。",
  },
];

export function Hero({
  boards,
  isAuthenticated,
}: {
  boards: Board[];
  isAuthenticated: boolean;
}) {
  const teslaBoard =
    boards.find((board) => board.slug === "tesla") ?? boards[0];
  const boardHref = teslaBoard ? `/boards/${teslaBoard.slug}` : "/boards";
  const questionHref = teslaBoard
    ? `/boards/${teslaBoard.slug}/write`
    : "/boards?mode=write";

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1.3fr_0.7fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <p className="flex items-center gap-2 font-label-md text-label-md text-primary">
            <MaterialIcon name="electric_car" className="text-[20px]" />
            日本のTeslaオーナーと購入検討者へ
          </p>
          <h1 className="mt-4 max-w-3xl font-headline-lg text-[30px] leading-tight text-on-surface sm:text-[38px] sm:leading-[1.2]">
            充電・保険・維持費の
            <span className="text-primary">リアルを共有する場所</span>
          </h1>
          <p className="mt-4 max-w-2xl text-body-lg leading-7 text-on-surface-variant">
            カタログだけでは分からない実測値と所有体験を比較して、購入前も納車後も迷いを減らせるTesla専門コミュニティです。
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={isAuthenticated ? "/tesla-data/new" : "/signup"}
              className={buttonStyles({ size: "lg" })}
            >
              <MaterialIcon
                name={isAuthenticated ? "add_chart" : "person_add"}
                className="text-[19px]"
              />
              {isAuthenticated ? "実測データを共有" : "無料で会員登録"}
            </Link>
            <Link
              href={isAuthenticated ? boardHref : questionHref}
              className={buttonStyles({ variant: "outline", size: "lg" })}
            >
              <MaterialIcon name="chat" className="text-[19px]" />
              {isAuthenticated ? "Tesla掲示板へ" : "ゲストで質問する"}
            </Link>
          </div>
          <p className="mt-3 text-label-sm text-text-muted">
            閲覧は登録不要。会員登録するとデータ共有、回答・投票、返信通知を利用できます。
          </p>
        </div>
        <div className="relative flex min-h-64 items-center overflow-hidden bg-inverse-surface p-6 text-inverse-on-surface sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(37,99,235,0.85),transparent_45%),radial-gradient(circle_at_15%_85%,rgba(21,128,61,0.45),transparent_42%)]" />
          <div className="relative space-y-5">
            <p className="font-label-sm text-inverse-primary">
              PANMOA OWNER DATA
            </p>
            <p className="font-headline-md text-2xl leading-8">
              人が共有した事実を、比べられる知識へ。
            </p>
            <div className="grid gap-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="flex gap-3 rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
                >
                  <MaterialIcon
                    name={benefit.icon}
                    className="mt-0.5 text-[20px] text-inverse-primary"
                  />
                  <div>
                    <p className="font-label-md text-white">{benefit.title}</p>
                    <p className="mt-0.5 text-label-sm leading-5 text-white/65">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
