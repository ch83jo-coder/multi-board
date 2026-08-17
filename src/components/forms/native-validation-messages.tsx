"use client";

import { useEffect } from "react";

type ValidatableField =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

function isValidatableField(
  target: EventTarget | null,
): target is ValidatableField {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

function missingMessage(field: ValidatableField) {
  if (field instanceof HTMLSelectElement) return "項目を選択してください。";
  if (field instanceof HTMLInputElement) {
    if (field.type === "checkbox" || field.type === "radio") {
      return "この項目を選択してください。";
    }
    if (field.type === "file") return "ファイルを選択してください。";
  }
  return "この項目を入力してください。";
}

function japaneseMessage(field: ValidatableField) {
  const { validity } = field;
  if (validity.valueMissing) return missingMessage(field);
  if (field instanceof HTMLSelectElement) return "選択できない項目です。";

  if (validity.typeMismatch) {
    if (field instanceof HTMLInputElement && field.type === "email") {
      return "メールアドレスの形式で入力してください。";
    }
    if (field instanceof HTMLInputElement && field.type === "url") {
      return "URL の形式で入力してください。";
    }
    return "正しい形式で入力してください。";
  }
  if (validity.patternMismatch) {
    return field.title || "指定された形式で入力してください。";
  }
  if (validity.tooShort) {
    return `${field.minLength}文字以上で入力してください。（現在 ${field.value.length} 文字）`;
  }
  if (validity.tooLong) {
    return `${field.maxLength}文字以内で入力してください。`;
  }
  if (field instanceof HTMLInputElement) {
    if (validity.rangeUnderflow) {
      return `${field.min}以上の値を入力してください。`;
    }
    if (validity.rangeOverflow) {
      return `${field.max}以下の値を入力してください。`;
    }
    if (validity.badInput) {
      return field.type === "number"
        ? "数値を入力してください。"
        : "正しい値を入力してください。";
    }
  }
  return "入力内容を確認してください。";
}

/**
 * ブラウザ標準の検証メッセージは閲覧者のブラウザ言語で表示されるため、
 * ページの言語（日本語）に合わせたメッセージへ差し替える。
 * invalid はバブリングしないのでキャプチャフェーズで受け取る。
 */
export function NativeValidationMessages() {
  useEffect(() => {
    const applyMessage = (event: Event) => {
      const field = event.target;
      if (!isValidatableField(field)) return;
      field.setCustomValidity("");
      if (!field.validity.valid) {
        field.setCustomValidity(japaneseMessage(field));
      }
    };
    const clearMessage = (event: Event) => {
      const field = event.target;
      if (isValidatableField(field)) field.setCustomValidity("");
    };

    document.addEventListener("invalid", applyMessage, true);
    document.addEventListener("input", clearMessage, true);
    return () => {
      document.removeEventListener("invalid", applyMessage, true);
      document.removeEventListener("input", clearMessage, true);
    };
  }, []);

  return null;
}
