"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import {
  CHARGER_TYPES,
  CONGESTION_LEVELS,
  isValidReportDate,
  OWNERSHIP_CATEGORIES,
  PREFECTURES,
  PRICE_REPORT_TYPES,
  parseTeslaDataType,
  TESLA_MODELS,
  todayInJapan,
} from "@/lib/tesla-data";
import type { ActionState } from "@/lib/types";

function textValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function numberValue(formData: FormData, name: string) {
  const raw = textValue(formData, name);
  return raw ? Number(raw) : Number.NaN;
}

function optionalInteger(formData: FormData, name: string) {
  const raw = textValue(formData, name);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isInteger(value) ? value : Number.NaN;
}

function isChoice<T extends string>(
  value: string,
  choices: readonly T[],
): value is T {
  return choices.includes(value as T);
}

async function authenticatedUser() {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { supabase, user: data.user };
}

export async function saveTeslaDataReport(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await authenticatedUser();
  if (!session) return { error: "データを投稿するにはログインしてください。" };

  const type = parseTeslaDataType(textValue(formData, "type"));
  const { supabase, user } = session;
  const currentModelYear = Number(todayInJapan().slice(0, 4));
  let result: { error: { code?: string; message: string } | null };

  if (type === "charging") {
    const locationName = textValue(formData, "locationName");
    const prefecture = textValue(formData, "prefecture");
    const chargerType = textValue(formData, "chargerType");
    const maxPowerKw = numberValue(formData, "maxPowerKw");
    const measuredSpeedKw = numberValue(formData, "measuredSpeedKw");
    const waitMinutes = numberValue(formData, "waitMinutes");
    const congestion = textValue(formData, "congestion");
    const rating = numberValue(formData, "rating");
    const visitedOn = textValue(formData, "visitedOn");
    const notes = textValue(formData, "notes");
    if (
      locationName.length < 2 ||
      locationName.length > 120 ||
      !isChoice(prefecture, PREFECTURES) ||
      !isChoice(
        chargerType,
        CHARGER_TYPES.map((option) => option.value),
      ) ||
      !Number.isFinite(maxPowerKw) ||
      maxPowerKw <= 0 ||
      maxPowerKw > 1000 ||
      !Number.isFinite(measuredSpeedKw) ||
      measuredSpeedKw <= 0 ||
      measuredSpeedKw > 1000 ||
      !Number.isInteger(waitMinutes) ||
      waitMinutes < 0 ||
      waitMinutes > 1440 ||
      !isChoice(
        congestion,
        CONGESTION_LEVELS.map((option) => option.value),
      ) ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      !isValidReportDate(visitedOn) ||
      notes.length > 1000
    ) {
      return { error: "充電レビューの入力内容を確認してください。" };
    }
    result = await supabase.from("charging_reviews").insert({
      author_id: user.id,
      location_name: locationName,
      prefecture,
      charger_type: chargerType,
      max_power_kw: maxPowerKw,
      measured_speed_kw: measuredSpeedKw,
      wait_minutes: waitMinutes,
      congestion,
      rating,
      visited_on: visitedOn,
      notes,
    });
  } else if (type === "ownership") {
    const model = textValue(formData, "model");
    const modelYear = numberValue(formData, "modelYear");
    const mileageKm = numberValue(formData, "mileageKm");
    const category = textValue(formData, "category");
    const amountYen = numberValue(formData, "amountYen");
    const occurredOn = textValue(formData, "occurredOn");
    const details = textValue(formData, "details");
    if (
      !isChoice(model, TESLA_MODELS) ||
      !Number.isInteger(modelYear) ||
      modelYear < 2008 ||
      modelYear > currentModelYear ||
      !Number.isInteger(mileageKm) ||
      mileageKm < 0 ||
      mileageKm > 3000000 ||
      !isChoice(
        category,
        OWNERSHIP_CATEGORIES.map((option) => option.value),
      ) ||
      !Number.isInteger(amountYen) ||
      amountYen < 0 ||
      amountYen > 100000000 ||
      !isValidReportDate(occurredOn) ||
      details.length < 2 ||
      details.length > 1000
    ) {
      return { error: "維持費・故障事例の入力内容を確認してください。" };
    }
    result = await supabase.from("ownership_costs").insert({
      author_id: user.id,
      model,
      model_year: modelYear,
      mileage_km: mileageKm,
      category,
      amount_yen: amountYen,
      occurred_on: occurredOn,
      details,
    });
  } else {
    const reportType = textValue(formData, "reportType");
    const model = textValue(formData, "model");
    const modelYear = optionalInteger(formData, "modelYear");
    const prefecture = textValue(formData, "prefecture");
    const amountYen = numberValue(formData, "amountYen");
    const provider = textValue(formData, "provider");
    const observedOn = textValue(formData, "observedOn");
    const details = textValue(formData, "details");
    if (
      !isChoice(
        reportType,
        PRICE_REPORT_TYPES.map((option) => option.value),
      ) ||
      !isChoice(model, TESLA_MODELS) ||
      (modelYear !== null &&
        (!Number.isInteger(modelYear) ||
          modelYear < 2008 ||
          modelYear > currentModelYear)) ||
      !isChoice(prefecture, PREFECTURES) ||
      !Number.isInteger(amountYen) ||
      amountYen < 0 ||
      amountYen > 100000000 ||
      provider.length < 2 ||
      provider.length > 120 ||
      !isValidReportDate(observedOn) ||
      details.length > 1000
    ) {
      return { error: "価格比較データの入力内容を確認してください。" };
    }
    result = await supabase.from("price_reports").insert({
      author_id: user.id,
      report_type: reportType,
      model,
      model_year: modelYear,
      prefecture,
      amount_yen: amountYen,
      provider,
      observed_on: observedOn,
      details,
    });
  }

  if (result.error) {
    console.error(
      `[tesla-data:${type}] Insert failed (${result.error.code ?? "unknown"}): ${result.error.message}`,
    );
    return { error: "データを保存できませんでした。もう一度お試しください。" };
  }

  revalidatePath("/tesla-data");
  redirect(`/tesla-data?type=${type}&saved=1`);
}
