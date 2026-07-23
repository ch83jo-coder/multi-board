"use client";

import { useId, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { MaterialIcon } from "@/components/ui/material-icon";
import {
  calculateIncrementalElectricityCost,
  ELECTRICITY_PLANS,
  RENEWABLE_LEVY_YEN_PER_KWH,
  TESLA_EFFICIENCY_PRESETS,
} from "@/lib/charging-calculator";

const yenFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 1,
});

function clamp(value: number, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) {
  if (!Number.isFinite(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
}

export function ChargingCostCalculator() {
  const [modelId, setModelId] = useState("model-3-rwd");
  const [consumptionWhPerKm, setConsumptionWhPerKm] = useState(119);
  const [monthlyDistanceKm, setMonthlyDistanceKm] = useState(1000);
  const [realWorldAdjustmentPercent, setRealWorldAdjustmentPercent] =
    useState(15);
  const [planId, setPlanId] = useState("tepco-standard-s");
  const [baselineKwh, setBaselineKwh] = useState(300);
  const [customHomeRate, setCustomHomeRate] = useState(35);
  const [fuelAdjustmentRate, setFuelAdjustmentRate] = useState(0);
  const [superchargerRate, setSuperchargerRate] = useState(50);

  const selectedPlan = ELECTRICITY_PLANS.find((plan) => plan.id === planId);
  const distance = clamp(monthlyDistanceKm, 0, 10000);
  const consumption = clamp(consumptionWhPerKm, 50, 400);
  const adjustment = clamp(realWorldAdjustmentPercent, -30, 100);
  const monthlyChargingKwh =
    (distance * consumption * (1 + adjustment / 100)) / 1000;
  const energyCharge = calculateIncrementalElectricityCost({
    baselineKwh: clamp(baselineKwh, 0, 5000),
    chargingKwh: monthlyChargingKwh,
    tiers: selectedPlan?.tiers ?? null,
    customRate: clamp(customHomeRate, 0, 200),
  });
  const homeAdjustmentRate =
    RENEWABLE_LEVY_YEN_PER_KWH + clamp(fuelAdjustmentRate, -30, 50);
  const homeCost = Math.max(
    0,
    energyCharge + monthlyChargingKwh * homeAdjustmentRate,
  );
  const superchargerCost = monthlyChargingKwh * clamp(superchargerRate, 0, 200);
  const monthlyDifference = Math.abs(superchargerCost - homeCost);
  const homeIsCheaper = homeCost <= superchargerCost;
  const largestCost = Math.max(homeCost, superchargerCost, 1);
  const homeCostPer100Km = distance ? (homeCost / distance) * 100 : 0;
  const superchargerCostPer100Km = distance
    ? (superchargerCost / distance) * 100
    : 0;

  const handleModelChange = (nextModelId: string) => {
    setModelId(nextModelId);
    const preset = TESLA_EFFICIENCY_PRESETS.find(
      (presetItem) => presetItem.id === nextModelId,
    );
    if (preset) setConsumptionWhPerKm(preset.whPerKm);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.72fr)]">
      <Card className="p-5 sm:p-6">
        <div className="mb-6 flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary">
            <MaterialIcon name="tune" />
          </span>
          <div>
            <h2 className="font-headline-md text-xl font-semibold">
              走行条件と料金を入力
            </h2>
            <p className="mt-1 text-body-sm text-text-muted">
              入力内容は保存・送信されず、このブラウザ内だけで計算します。
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label htmlFor="tesla-model" className="space-y-2">
            <span className="font-label-md text-label-md font-semibold">
              Teslaモデル
            </span>
            <Select
              id="tesla-model"
              value={modelId}
              onChange={(event) => handleModelChange(event.target.value)}
            >
              {TESLA_EFFICIENCY_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </Select>
          </label>

          <NumberField
            label="交流電力量消費率"
            value={consumptionWhPerKm}
            onChange={setConsumptionWhPerKm}
            min={50}
            max={400}
            step={1}
            suffix="Wh/km"
            helper="Tesla公表の国土交通省審査値。実車値に変更できます。"
          />

          <NumberField
            label="月間走行距離"
            value={monthlyDistanceKm}
            onChange={setMonthlyDistanceKm}
            min={0}
            max={10000}
            step={100}
            suffix="km"
          />

          <NumberField
            label="実走行補正"
            value={realWorldAdjustmentPercent}
            onChange={setRealWorldAdjustmentPercent}
            min={-30}
            max={100}
            step={5}
            suffix="%"
            helper="空調・気温・速度による増減。迷った場合は+15%。"
          />
        </div>

        <div className="my-6 border-t border-border-subtle" />

        <div className="grid gap-5 sm:grid-cols-2">
          <label htmlFor="electricity-plan" className="space-y-2">
            <span className="font-label-md text-label-md font-semibold">
              自宅の電気料金プラン
            </span>
            <Select
              id="electricity-plan"
              value={planId}
              onChange={(event) => setPlanId(event.target.value)}
            >
              {ELECTRICITY_PLANS.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.label}
                </option>
              ))}
              <option value="custom">単価を直接入力</option>
            </Select>
          </label>

          {selectedPlan ? (
            <NumberField
              label="EV充電前の月間使用量"
              value={baselineKwh}
              onChange={setBaselineKwh}
              min={0}
              max={5000}
              step={10}
              suffix="kWh"
              helper="段階料金のどこに充電分が加わるかを計算します。"
            />
          ) : (
            <NumberField
              label="自宅充電の電力量単価"
              value={customHomeRate}
              onChange={setCustomHomeRate}
              min={0}
              max={200}
              step={0.1}
              suffix="円/kWh"
              helper="請求書の実質単価を入れると精度が上がります。"
            />
          )}

          <NumberField
            label="燃料費等調整単価"
            value={fuelAdjustmentRate}
            onChange={setFuelAdjustmentRate}
            min={-30}
            max={50}
            step={0.01}
            suffix="円/kWh"
            helper={`再エネ賦課金 ${RENEWABLE_LEVY_YEN_PER_KWH}円/kWhは別途自動加算。`}
          />

          <NumberField
            label="スーパーチャージャー表示単価"
            value={superchargerRate}
            onChange={setSuperchargerRate}
            min={0}
            max={200}
            step={1}
            suffix="円/kWh"
            helper="Teslaアプリまたは車両画面の利用予定地点の価格を入力。"
          />
        </div>

        {selectedPlan && (
          <p className="mt-5 rounded-lg bg-muted px-4 py-3 text-label-sm leading-5 text-text-muted">
            {selectedPlan.area}
            エリアの公表電力量料金を使用しています。基本料金はEV充電の有無で変わらないため差額計算に含めません。{" "}
            <a
              href={selectedPlan.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary underline underline-offset-2"
            >
              料金表を確認
            </a>
          </p>
        )}
      </Card>

      <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
        <Card className="overflow-hidden">
          <div className="bg-inverse-surface p-5 text-inverse-on-surface sm:p-6">
            <p className="font-label-md text-inverse-primary">月間の比較結果</p>
            <output aria-live="polite">
              <p className="mt-2 font-headline-lg text-3xl font-bold text-white">
                {homeIsCheaper ? "自宅充電" : "スーパーチャージャー"}が
                <br />
                {yenFormatter.format(monthlyDifference)} 安い
              </p>
              <p className="mt-2 text-body-sm text-white/65">
                年間差額の目安 {yenFormatter.format(monthlyDifference * 12)}
              </p>
            </output>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <CostBar
              label="自宅充電"
              icon="home"
              cost={homeCost}
              costPer100Km={homeCostPer100Km}
              widthPercent={(homeCost / largestCost) * 100}
              accentClass="bg-primary"
            />
            <CostBar
              label="スーパーチャージャー"
              icon="bolt"
              cost={superchargerCost}
              costPer100Km={superchargerCostPer100Km}
              widthPercent={(superchargerCost / largestCost) * 100}
              accentClass="bg-destructive"
            />

            <div className="grid grid-cols-2 gap-3 border-t border-border-subtle pt-5">
              <Metric
                label="推定充電量"
                value={`${numberFormatter.format(monthlyChargingKwh)} kWh/月`}
              />
              <Metric
                label="補正後の電費"
                value={`${numberFormatter.format(consumption * (1 + adjustment / 100))} Wh/km`}
              />
            </div>
          </div>
        </Card>

        <div className="rounded-lg border border-tertiary/30 bg-tertiary-container p-4 text-body-sm leading-6 text-on-tertiary-container">
          <div className="flex gap-2 font-semibold">
            <MaterialIcon name="info" className="mt-0.5 text-[18px]" />
            スーパーチャージャー価格は固定ではありません
          </div>
          <p className="mt-1 pl-7">
            場所・時間帯・混雑状況で変動します。初期値50円/kWhは比較用の仮入力です。利用前にTeslaアプリまたは車両画面で必ず確認してください。
          </p>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  helper,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  suffix: string;
  helper?: string;
}) {
  const inputId = useId();

  return (
    <label htmlFor={inputId} className="space-y-2">
      <span className="font-label-md text-label-md font-semibold">{label}</span>
      <span className="relative block">
        <Input
          id={inputId}
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            const nextValue = event.target.valueAsNumber;
            onChange(Number.isFinite(nextValue) ? nextValue : 0);
          }}
          className="pr-20"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-label-sm text-text-muted">
          {suffix}
        </span>
      </span>
      {helper && (
        <span className="block text-label-sm leading-5 text-text-muted">
          {helper}
        </span>
      )}
    </label>
  );
}

function CostBar({
  label,
  icon,
  cost,
  costPer100Km,
  widthPercent,
  accentClass,
}: {
  label: string;
  icon: string;
  cost: number;
  costPer100Km: number;
  widthPercent: number;
  accentClass: string;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-2 font-label-md font-semibold">
          <MaterialIcon name={icon} className="text-[19px] text-text-muted" />
          {label}
        </div>
        <div className="text-right">
          <p className="font-headline-md text-xl font-bold">
            {yenFormatter.format(cost)}
          </p>
          <p className="text-label-sm text-text-muted">
            100kmあたり {yenFormatter.format(costPer100Km)}
          </p>
        </div>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-[width] ${accentClass}`}
          style={{ width: `${clamp(widthPercent, 0, 100)}%` }}
        />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <p className="text-label-sm text-text-muted">{label}</p>
      <p className="mt-1 font-label-md font-semibold text-on-surface">
        {value}
      </p>
    </div>
  );
}
