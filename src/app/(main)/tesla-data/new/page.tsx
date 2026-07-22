import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DataReportForm } from "@/components/tesla-data/data-report-form";
import { DataTabs } from "@/components/tesla-data/data-tabs";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getViewer } from "@/lib/data";
import {
  parseTeslaDataType,
  TESLA_DATA_TABS,
  todayInJapan,
} from "@/lib/tesla-data";

export const metadata: Metadata = {
  title: "Tesla実体験データを登録",
  robots: { index: false, follow: false },
};

export default async function NewTeslaDataPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const type = parseTeslaDataType((await searchParams).type);
  const viewer = await getViewer();
  if (!viewer)
    redirect(
      `/login?next=${encodeURIComponent(`/tesla-data/new?type=${type}`)}`,
    );
  const currentTab = TESLA_DATA_TABS.find((tab) => tab.value === type);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href={`/tesla-data?type=${type}`}
          className="inline-flex items-center gap-1 text-body-sm font-semibold text-primary hover:underline"
        >
          <MaterialIcon name="arrow_back" className="text-[17px]" />
          比較データへ戻る
        </Link>
        <h1 className="mt-3 font-headline-lg text-headline-lg-mobile md:text-headline-lg">
          実体験データを登録
        </h1>
        <p className="mt-2 text-body-md text-text-muted">
          {currentTab?.label}を、ほかのオーナーが比較できる形で共有します。
        </p>
      </div>

      <DataTabs active={type} mode="write" />

      <div className="flex gap-3 rounded-lg border border-primary/15 bg-accent p-4 text-body-sm text-accent-foreground">
        <MaterialIcon name="verified_user" className="shrink-0 text-[20px]" />
        <p>
          実際に確認した情報だけを入力し、個人を特定できる情報や契約番号は記載しないでください。
        </p>
      </div>

      <Card className="p-5 md:p-7">
        <DataReportForm type={type} today={todayInJapan()} />
      </Card>

      <div className="text-center">
        <Link
          href={`/tesla-data?type=${type}`}
          className={buttonStyles({ variant: "ghost" })}
        >
          キャンセル
        </Link>
      </div>
    </div>
  );
}
