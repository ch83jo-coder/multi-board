"use client";

import { useActionState } from "react";
import { saveTeslaDataReport } from "@/app/actions/tesla-data";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { MaterialIcon } from "@/components/ui/material-icon";
import {
  CHARGER_TYPES,
  CONGESTION_LEVELS,
  OWNERSHIP_CATEGORIES,
  PREFECTURES,
  PRICE_REPORT_TYPES,
  TESLA_MODELS,
} from "@/lib/tesla-data";
import type { TeslaDataType } from "@/lib/types";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-1.5 block font-label-md text-label-md text-text-muted">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-label-sm text-text-muted">{hint}</span>
      )}
    </label>
  );
}

function OptionList({
  options,
}: {
  options: readonly { value: string; label: string }[];
}) {
  return options.map((option) => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ));
}

function ModelOptions() {
  return TESLA_MODELS.map((model) => (
    <option key={model} value={model}>
      {model}
    </option>
  ));
}

function PrefectureOptions() {
  return PREFECTURES.map((prefecture) => (
    <option key={prefecture} value={prefecture}>
      {prefecture}
    </option>
  ));
}

function ChargingFields({ today }: { today: string }) {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="充電スポット名" htmlFor="location-name">
          <Input
            id="location-name"
            name="locationName"
            minLength={2}
            maxLength={120}
            required
            placeholder="例: 東京ベイ スーパーチャージャー"
          />
        </Field>
        <Field label="都道府県" htmlFor="charging-prefecture">
          <Select id="charging-prefecture" name="prefecture" required>
            <option value="">選択してください</option>
            <PrefectureOptions />
          </Select>
        </Field>
        <Field label="充電器タイプ" htmlFor="charger-type">
          <Select id="charger-type" name="chargerType" required>
            <OptionList options={CHARGER_TYPES} />
          </Select>
        </Field>
        <Field
          label="充電器の最大出力"
          htmlFor="max-power"
          hint="充電器に表示されている定格出力"
        >
          <div className="relative">
            <Input
              id="max-power"
              name="maxPowerKw"
              type="number"
              min="0.1"
              max="1000"
              step="0.1"
              required
              className="pr-12"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-body-sm text-text-muted">
              kW
            </span>
          </div>
        </Field>
        <Field
          label="実測した最大速度"
          htmlFor="measured-speed"
          hint="車両画面またはアプリで確認した最大値"
        >
          <div className="relative">
            <Input
              id="measured-speed"
              name="measuredSpeedKw"
              type="number"
              min="0.1"
              max="1000"
              step="0.1"
              required
              className="pr-12"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-body-sm text-text-muted">
              kW
            </span>
          </div>
        </Field>
        <Field label="待ち時間" htmlFor="wait-minutes">
          <div className="relative">
            <Input
              id="wait-minutes"
              name="waitMinutes"
              type="number"
              min="0"
              max="1440"
              step="1"
              defaultValue="0"
              required
              className="pr-12"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-body-sm text-text-muted">
              分
            </span>
          </div>
        </Field>
        <Field label="混雑状況" htmlFor="congestion">
          <Select id="congestion" name="congestion" required>
            <OptionList options={CONGESTION_LEVELS} />
          </Select>
        </Field>
        <Field label="総合評価" htmlFor="rating">
          <Select id="rating" name="rating" required defaultValue="4">
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {"★".repeat(rating)}（{rating}）
              </option>
            ))}
          </Select>
        </Field>
        <Field label="利用日" htmlFor="visited-on">
          <Input
            id="visited-on"
            name="visitedOn"
            type="date"
            max={today}
            defaultValue={today}
            required
          />
        </Field>
      </div>
      <Field
        label="利用条件・補足（任意）"
        htmlFor="charging-notes"
        hint="訪問時刻、到着時SOC、気温などを含めると比較しやすくなります。"
      >
        <Textarea
          id="charging-notes"
          name="notes"
          maxLength={1000}
          className="min-h-28"
          placeholder="例: 平日19時台、到着時SOC 18%、4基中3基を利用中"
        />
      </Field>
    </>
  );
}

function OwnershipFields({ today }: { today: string }) {
  const currentYear = today.slice(0, 4);
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="モデル" htmlFor="ownership-model">
          <Select id="ownership-model" name="model" required>
            <ModelOptions />
          </Select>
        </Field>
        <Field label="年式" htmlFor="ownership-model-year">
          <Input
            id="ownership-model-year"
            name="modelYear"
            type="number"
            min="2008"
            max={currentYear}
            step="1"
            placeholder="例: 2024"
            required
          />
        </Field>
        <Field label="発生時の走行距離" htmlFor="mileage-km">
          <div className="relative">
            <Input
              id="mileage-km"
              name="mileageKm"
              type="number"
              min="0"
              max="3000000"
              step="1"
              required
              className="pr-12"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-body-sm text-text-muted">
              km
            </span>
          </div>
        </Field>
        <Field label="費用区分" htmlFor="ownership-category">
          <Select id="ownership-category" name="category" required>
            <OptionList options={OWNERSHIP_CATEGORIES} />
          </Select>
        </Field>
        <Field label="支払額" htmlFor="ownership-amount">
          <div className="relative">
            <Input
              id="ownership-amount"
              name="amountYen"
              type="number"
              min="0"
              max="100000000"
              step="1"
              required
              className="pr-10"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-body-sm text-text-muted">
              円
            </span>
          </div>
        </Field>
        <Field label="発生日・支払日" htmlFor="occurred-on">
          <Input
            id="occurred-on"
            name="occurredOn"
            type="date"
            max={today}
            defaultValue={today}
            required
          />
        </Field>
      </div>
      <Field label="内容" htmlFor="ownership-details">
        <Textarea
          id="ownership-details"
          name="details"
          minLength={2}
          maxLength={1000}
          required
          className="min-h-28"
          placeholder="交換部品、作業内容、保険条件など、比較に必要な条件を入力してください。"
        />
      </Field>
    </>
  );
}

function PriceFields({ today }: { today: string }) {
  const currentYear = today.slice(0, 4);
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="データ種別" htmlFor="report-type">
          <Select id="report-type" name="reportType" required>
            <OptionList options={PRICE_REPORT_TYPES} />
          </Select>
        </Field>
        <Field label="モデル" htmlFor="price-model">
          <Select id="price-model" name="model" required>
            <ModelOptions />
          </Select>
        </Field>
        <Field
          label="年式（任意）"
          htmlFor="price-model-year"
          hint="中古価格の場合は入力を推奨します。"
        >
          <Input
            id="price-model-year"
            name="modelYear"
            type="number"
            min="2008"
            max={currentYear}
            step="1"
            placeholder="例: 2023"
          />
        </Field>
        <Field label="都道府県" htmlFor="price-prefecture">
          <Select id="price-prefecture" name="prefecture" required>
            <option value="">選択してください</option>
            <PrefectureOptions />
          </Select>
        </Field>
        <Field label="金額" htmlFor="price-amount">
          <div className="relative">
            <Input
              id="price-amount"
              name="amountYen"
              type="number"
              min="0"
              max="100000000"
              step="1"
              required
              className="pr-10"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-body-sm text-text-muted">
              円
            </span>
          </div>
        </Field>
        <Field label="保険会社・制度・販売店" htmlFor="provider">
          <Input
            id="provider"
            name="provider"
            minLength={2}
            maxLength={120}
            required
            placeholder="公開できる範囲で入力"
          />
        </Field>
        <Field label="確認日" htmlFor="observed-on">
          <Input
            id="observed-on"
            name="observedOn"
            type="date"
            max={today}
            defaultValue={today}
            required
          />
        </Field>
      </div>
      <Field
        label="条件・補足（任意）"
        htmlFor="price-details"
        hint="保険の等級、補助金の対象条件、中古車の走行距離など"
      >
        <Textarea
          id="price-details"
          name="details"
          maxLength={1000}
          className="min-h-28"
        />
      </Field>
    </>
  );
}

export function DataReportForm({
  type,
  today,
}: {
  type: TeslaDataType;
  today: string;
}) {
  const [state, action, pending] = useActionState(saveTeslaDataReport, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="type" value={type} />
      {type === "charging" ? (
        <ChargingFields today={today} />
      ) : type === "ownership" ? (
        <OwnershipFields today={today} />
      ) : (
        <PriceFields today={today} />
      )}
      {state.error && (
        <p
          role="alert"
          className="rounded-md bg-error-container px-3 py-2 text-body-sm text-on-error-container"
        >
          {state.error}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          <MaterialIcon name="database_upload" className="text-[19px]" />
          {pending ? "保存中..." : "実体験データを登録"}
        </Button>
      </div>
    </form>
  );
}
