"use client";

import {
  createContext,
  useActionState,
  useContext,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  extractTeslaDataFromImage,
  saveTeslaDataReport,
} from "@/app/actions/tesla-data";
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

type FormDefaults = Record<string, string>;
type AiFieldMeta = {
  sourceText: string | null;
  confidence: number;
  inferred: boolean;
  calculation: string | null;
};

const AiFieldContext = createContext<ReadonlyMap<string, AiFieldMeta>>(
  new Map(),
);

function initialDefaults(type: TeslaDataType, today: string): FormDefaults {
  if (type === "charging")
    return {
      chargerType: "supercharger",
      waitMinutes: "0",
      congestion: "empty",
      rating: "4",
      visitedOn: today,
    };
  if (type === "ownership")
    return {
      model: "Model 3",
      category: "maintenance",
      occurredOn: today,
    };
  return {
    reportType: "insurance",
    model: "Model 3",
    observedOn: today,
  };
}

function Field({
  label,
  htmlFor,
  fieldName,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  fieldName: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const aiMeta = useContext(AiFieldContext).get(fieldName);
  const aiFilled = Boolean(aiMeta);
  return (
    <label
      className={`block rounded-lg transition-colors ${aiFilled ? "-m-2 border border-primary/15 bg-primary/5 p-2" : ""}`}
      htmlFor={htmlFor}
    >
      <span className="mb-1.5 flex items-center justify-between gap-2 font-label-md text-label-md text-text-muted">
        <span>{label}</span>
        {aiFilled && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-on-primary">
            {aiMeta?.inferred ? "AI推定・要確認" : "AI入力・要確認"}
          </span>
        )}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-label-sm text-text-muted">{hint}</span>
      )}
      {aiMeta && (aiMeta.sourceText || aiMeta.calculation) && (
        <span className="mt-1.5 block rounded bg-primary/5 px-2 py-1.5 text-label-sm text-text-muted">
          {aiMeta.inferred && aiMeta.calculation
            ? `推定根拠: ${aiMeta.calculation}`
            : `読取根拠: ${aiMeta.sourceText}`}
          <span className="ml-2 whitespace-nowrap">
            信頼度 {Math.round(aiMeta.confidence * 100)}%
          </span>
        </span>
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

function ChargingFields({
  today,
  defaults,
}: {
  today: string;
  defaults: FormDefaults;
}) {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="充電スポット名"
          htmlFor="location-name"
          fieldName="locationName"
        >
          <Input
            id="location-name"
            name="locationName"
            defaultValue={defaults.locationName ?? ""}
            minLength={2}
            maxLength={120}
            required
            placeholder="例: 東京ベイ スーパーチャージャー"
          />
        </Field>
        <Field
          label="都道府県"
          htmlFor="charging-prefecture"
          fieldName="prefecture"
        >
          <Select
            id="charging-prefecture"
            name="prefecture"
            defaultValue={defaults.prefecture ?? ""}
            required
          >
            <option value="">選択してください</option>
            <PrefectureOptions />
          </Select>
        </Field>
        <Field
          label="充電器タイプ"
          htmlFor="charger-type"
          fieldName="chargerType"
        >
          <Select
            id="charger-type"
            name="chargerType"
            defaultValue={defaults.chargerType ?? ""}
            required
          >
            <option value="">選択してください</option>
            <OptionList options={CHARGER_TYPES} />
          </Select>
        </Field>
        <Field
          label="充電器の最大出力"
          htmlFor="max-power"
          fieldName="maxPowerKw"
          hint="充電器に表示されている定格出力"
        >
          <div className="relative">
            <Input
              id="max-power"
              name="maxPowerKw"
              defaultValue={defaults.maxPowerKw ?? ""}
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
          fieldName="measuredSpeedKw"
          hint="車両画面またはアプリで確認した最大値"
        >
          <div className="relative">
            <Input
              id="measured-speed"
              name="measuredSpeedKw"
              defaultValue={defaults.measuredSpeedKw ?? ""}
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
        <Field label="待ち時間" htmlFor="wait-minutes" fieldName="waitMinutes">
          <div className="relative">
            <Input
              id="wait-minutes"
              name="waitMinutes"
              defaultValue={defaults.waitMinutes ?? ""}
              type="number"
              min="0"
              max="1440"
              step="1"
              required
              className="pr-12"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-body-sm text-text-muted">
              分
            </span>
          </div>
        </Field>
        <Field label="混雑状況" htmlFor="congestion" fieldName="congestion">
          <Select
            id="congestion"
            name="congestion"
            defaultValue={defaults.congestion ?? ""}
            required
          >
            <option value="">選択してください</option>
            <OptionList options={CONGESTION_LEVELS} />
          </Select>
        </Field>
        <Field label="総合評価" htmlFor="rating" fieldName="rating">
          <Select
            id="rating"
            name="rating"
            required
            defaultValue={defaults.rating ?? ""}
          >
            <option value="">選択してください</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {"★".repeat(rating)}（{rating}）
              </option>
            ))}
          </Select>
        </Field>
        <Field label="利用日" htmlFor="visited-on" fieldName="visitedOn">
          <Input
            id="visited-on"
            name="visitedOn"
            type="date"
            max={today}
            defaultValue={defaults.visitedOn ?? ""}
            required
          />
        </Field>
      </div>
      <Field
        label="利用条件・補足（任意）"
        htmlFor="charging-notes"
        fieldName="notes"
        hint="訪問時刻、到着時SOC、気温などを含めると比較しやすくなります。"
      >
        <Textarea
          id="charging-notes"
          name="notes"
          defaultValue={defaults.notes ?? ""}
          maxLength={1000}
          className="min-h-28"
          placeholder="例: 平日19時台、到着時SOC 18%、4基中3基を利用中"
        />
      </Field>
    </>
  );
}

function OwnershipFields({
  today,
  defaults,
}: {
  today: string;
  defaults: FormDefaults;
}) {
  const currentYear = today.slice(0, 4);
  const [category, setCategory] = useState(defaults.category ?? "maintenance");
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="モデル" htmlFor="ownership-model" fieldName="model">
          <Select
            id="ownership-model"
            name="model"
            defaultValue={defaults.model ?? ""}
            required
          >
            <option value="">選択してください</option>
            <ModelOptions />
          </Select>
        </Field>
        <Field
          label="年式"
          htmlFor="ownership-model-year"
          fieldName="modelYear"
        >
          <Input
            id="ownership-model-year"
            name="modelYear"
            defaultValue={defaults.modelYear ?? ""}
            type="number"
            min="2008"
            max={currentYear}
            step="1"
            placeholder="例: 2024"
            required
          />
        </Field>
        <Field
          label="発生時の走行距離"
          htmlFor="mileage-km"
          fieldName="mileageKm"
        >
          <div className="relative">
            <Input
              id="mileage-km"
              name="mileageKm"
              defaultValue={defaults.mileageKm ?? ""}
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
        <Field
          label="費用区分"
          htmlFor="ownership-category"
          fieldName="category"
        >
          <Select
            id="ownership-category"
            name="category"
            defaultValue={defaults.category ?? ""}
            onChange={(event) => setCategory(event.currentTarget.value)}
            required
          >
            <option value="">選択してください</option>
            <OptionList options={OWNERSHIP_CATEGORIES} />
          </Select>
        </Field>
        <Field
          label={
            category === "insurance" ? "年間保険料（年額）" : "支払額（総額）"
          }
          htmlFor="ownership-amount"
          fieldName="amountYen"
          hint={
            category === "insurance"
              ? "年額を入力します。画像が月額表記だけの場合、AIは月額×12の推定年額と計算根拠を入力します。"
              : "今回発生した費用の合計額を入力してください。"
          }
        >
          <div className="relative">
            <Input
              id="ownership-amount"
              name="amountYen"
              defaultValue={defaults.amountYen ?? ""}
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
        <Field
          label="発生日・支払日"
          htmlFor="occurred-on"
          fieldName="occurredOn"
        >
          <Input
            id="occurred-on"
            name="occurredOn"
            type="date"
            max={today}
            defaultValue={defaults.occurredOn ?? ""}
            required
          />
        </Field>
      </div>
      <Field label="内容" htmlFor="ownership-details" fieldName="details">
        <Textarea
          id="ownership-details"
          name="details"
          defaultValue={defaults.details ?? ""}
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

function PriceFields({
  today,
  defaults,
}: {
  today: string;
  defaults: FormDefaults;
}) {
  const currentYear = today.slice(0, 4);
  const [reportType, setReportType] = useState(
    defaults.reportType ?? "insurance",
  );
  const amountLabel =
    reportType === "insurance"
      ? "年間保険料（年額）"
      : reportType === "subsidy"
        ? "補助金額"
        : "中古車価格";
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="データ種別" htmlFor="report-type" fieldName="reportType">
          <Select
            id="report-type"
            name="reportType"
            defaultValue={defaults.reportType ?? ""}
            onChange={(event) => setReportType(event.currentTarget.value)}
            required
          >
            <option value="">選択してください</option>
            <OptionList options={PRICE_REPORT_TYPES} />
          </Select>
        </Field>
        <Field label="モデル" htmlFor="price-model" fieldName="model">
          <Select
            id="price-model"
            name="model"
            defaultValue={defaults.model ?? ""}
            required
          >
            <option value="">選択してください</option>
            <ModelOptions />
          </Select>
        </Field>
        <Field
          label="年式（任意）"
          htmlFor="price-model-year"
          fieldName="modelYear"
          hint="中古価格の場合は入力を推奨します。"
        >
          <Input
            id="price-model-year"
            name="modelYear"
            defaultValue={defaults.modelYear ?? ""}
            type="number"
            min="2008"
            max={currentYear}
            step="1"
            placeholder="例: 2023"
          />
        </Field>
        <Field
          label="都道府県"
          htmlFor="price-prefecture"
          fieldName="prefecture"
        >
          <Select
            id="price-prefecture"
            name="prefecture"
            defaultValue={defaults.prefecture ?? ""}
            required
          >
            <option value="">選択してください</option>
            <PrefectureOptions />
          </Select>
        </Field>
        <Field
          label={amountLabel}
          htmlFor="price-amount"
          fieldName="amountYen"
          hint={
            reportType === "insurance"
              ? "年額を入力します。画像が月額表記だけの場合、AIは月額×12の推定年額と計算根拠を入力します。"
              : undefined
          }
        >
          <div className="relative">
            <Input
              id="price-amount"
              name="amountYen"
              defaultValue={defaults.amountYen ?? ""}
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
        <Field
          label="保険会社・制度・販売店"
          htmlFor="provider"
          fieldName="provider"
        >
          <Input
            id="provider"
            name="provider"
            defaultValue={defaults.provider ?? ""}
            minLength={2}
            maxLength={120}
            required
            placeholder="公開できる範囲で入力"
          />
        </Field>
        <Field label="確認日" htmlFor="observed-on" fieldName="observedOn">
          <Input
            id="observed-on"
            name="observedOn"
            type="date"
            max={today}
            defaultValue={defaults.observedOn ?? ""}
            required
          />
        </Field>
      </div>
      <Field
        label="条件・補足（任意）"
        htmlFor="price-details"
        fieldName="details"
        hint="保険の等級、補助金の対象条件、中古車の走行距離など"
      >
        <Textarea
          id="price-details"
          name="details"
          defaultValue={defaults.details ?? ""}
          maxLength={1000}
          className="min-h-28"
        />
      </Field>
    </>
  );
}

function AiImageAssist({
  type,
  onExtract,
}: {
  type: TeslaDataType;
  onExtract: (
    fields: FormDefaults,
    fieldMeta: Record<string, AiFieldMeta>,
  ) => void;
}) {
  const imageRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  function extract() {
    const image = imageRef.current?.files?.[0];
    if (!image) {
      setMessage({ kind: "error", text: "画像を選択してください。" });
      return;
    }
    if (image.size > 5 * 1024 * 1024) {
      setMessage({
        kind: "error",
        text: "画像は5MB以下のファイルをアップロードしてください。",
      });
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
      setMessage({
        kind: "error",
        text: "JPG、PNG、WebP形式の画像のみアップロードできます。",
      });
      return;
    }
    setMessage(null);
    const formData = new FormData();
    formData.set("image", image);
    startTransition(async () => {
      try {
        const result = await extractTeslaDataFromImage(type, formData);
        if (result.error) {
          setMessage({ kind: "error", text: result.error });
          return;
        }
        if (result.fields) onExtract(result.fields, result.fieldMeta ?? {});
        setMessage({
          kind: "success",
          text: result.success ?? "画像の読み取りが完了しました。",
        });
      } catch {
        setMessage({
          kind: "error",
          text: "画像を読み取れませんでした。もう一度お試しください。",
        });
      }
    });
  }

  return (
    <section
      aria-labelledby="ai-image-title"
      className="space-y-3 rounded-lg border border-primary/15 bg-accent/60 p-4"
    >
      <div className="flex gap-3">
        <MaterialIcon
          name="document_scanner"
          className="mt-0.5 shrink-0 text-[22px] text-primary"
        />
        <div>
          <h2 id="ai-image-title" className="font-label-lg text-on-surface">
            写真から自動入力
          </h2>
          <p className="mt-1 text-body-sm text-text-muted">
            Teslaアプリの画面、領収書、見積書などを選択してください。
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block" htmlFor={`ai-image-${type}`}>
          <span className="mb-1.5 block font-label-md text-label-md text-text-muted">
            読み取る画像
          </span>
          <input
            ref={imageRef}
            id={`ai-image-${type}`}
            type="file"
            accept="image/*"
            aria-describedby="ai-image-privacy"
            className="block w-full rounded-md border border-input bg-white text-body-sm text-on-surface shadow-sm file:mr-3 file:h-10 file:border-0 file:border-r file:border-border-subtle file:bg-muted file:px-3 file:font-semibold file:text-on-surface hover:file:bg-surface-container-high"
          />
        </label>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={pending}
          onClick={extract}
        >
          <MaterialIcon name="auto_awesome" className="text-[19px]" />
          {pending ? "読み取り中..." : "AIで読み取る"}
        </Button>
      </div>
      <p id="ai-image-privacy" className="text-label-sm text-text-muted">
        JPG・PNG・WebP、5MB以下。画像は入力補助のためAIに送信され、このサイトには保存されません。読み取り結果は必ず確認してください。
      </p>
      {message && (
        <p
          role={message.kind === "error" ? "alert" : "status"}
          className={`rounded-md px-3 py-2 text-body-sm ${
            message.kind === "error"
              ? "bg-error-container text-on-error-container"
              : "bg-secondary-container text-on-secondary-container"
          }`}
        >
          {message.text}
        </p>
      )}
    </section>
  );
}

export function DataReportForm({
  type,
  today,
  aiEnabled,
}: {
  type: TeslaDataType;
  today: string;
  aiEnabled: boolean;
}) {
  const [state, action, pending] = useActionState(saveTeslaDataReport, {});
  const [defaults, setDefaults] = useState<FormDefaults>(() =>
    initialDefaults(type, today),
  );
  const [aiFields, setAiFields] = useState<ReadonlyMap<string, AiFieldMeta>>(
    new Map(),
  );
  const [fieldVersion, setFieldVersion] = useState(0);

  function applyExtractedFields(
    fields: FormDefaults,
    fieldMeta: Record<string, AiFieldMeta>,
  ) {
    setDefaults((current) => ({ ...current, ...fields }));
    setAiFields(new Map(Object.entries(fieldMeta)));
    setFieldVersion((version) => version + 1);
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="type" value={type} />
      {aiEnabled && (
        <AiImageAssist type={type} onExtract={applyExtractedFields} />
      )}
      <AiFieldContext.Provider value={aiFields}>
        <div key={fieldVersion} className="space-y-5">
          {type === "charging" ? (
            <ChargingFields today={today} defaults={defaults} />
          ) : type === "ownership" ? (
            <OwnershipFields today={today} defaults={defaults} />
          ) : (
            <PriceFields today={today} defaults={defaults} />
          )}
        </div>
      </AiFieldContext.Provider>
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
