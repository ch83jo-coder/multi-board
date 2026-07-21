"use client";

import { useEffect, useId, useState } from "react";
import { Input } from "@/components/ui/input";

const GUEST_NAME_STORAGE_KEY = "panmoa:guest-name";

export function useGuestName(
  initialName = "名無しさん",
  restoreSavedName = true,
) {
  const [guestName, setGuestName] = useState(initialName);

  useEffect(() => {
    if (!restoreSavedName) return;
    try {
      const savedName = window.localStorage
        .getItem(GUEST_NAME_STORAGE_KEY)
        ?.trim();
      if (savedName) setGuestName(savedName.slice(0, 30));
    } catch {
      // Storage may be disabled; guest posting must still remain available.
    }
  }, [restoreSavedName]);

  const rememberGuestName = () => {
    const normalized = guestName.trim() || "名無しさん";
    try {
      window.localStorage.setItem(GUEST_NAME_STORAGE_KEY, normalized);
    } catch {
      // A storage failure must not prevent the form submission.
    }
  };

  return { guestName, setGuestName, rememberGuestName };
}

export function GuestIdentityFields({
  guestName,
  onGuestNameChange,
  nameReadOnly = false,
}: {
  guestName: string;
  onGuestNameChange: (value: string) => void;
  nameReadOnly?: boolean;
}) {
  const nameId = useId();
  const passwordId = useId();

  return (
    <div className="grid gap-3 rounded-lg border border-border-subtle bg-surface-alt p-4 sm:grid-cols-2">
      <label className="block" htmlFor={nameId}>
        <span className="mb-1.5 block font-label-md text-label-md text-text-muted">
          お名前
        </span>
        <Input
          id={nameId}
          name="guestName"
          value={guestName}
          onChange={(event) => onGuestNameChange(event.target.value)}
          readOnly={nameReadOnly}
          minLength={1}
          maxLength={30}
          required
          autoComplete="nickname"
        />
      </label>
      <label className="block" htmlFor={passwordId}>
        <span className="mb-1.5 block font-label-md text-label-md text-text-muted">
          編集・削除用パスワード
        </span>
        <Input
          id={passwordId}
          name="guestPassword"
          type="password"
          minLength={4}
          maxLength={128}
          required
          autoComplete="new-password"
          placeholder="4文字以上"
        />
      </label>
      <p className="text-label-sm text-text-muted sm:col-span-2">
        パスワードは再発行できません。編集・削除まで大切に保管してください。
      </p>
    </div>
  );
}
