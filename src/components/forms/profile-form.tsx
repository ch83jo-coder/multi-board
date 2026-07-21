"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfileForm({ username }: { username: string }) {
  const [state, action, pending] = useActionState(updateProfile, {});
  return (
    <form
      action={action}
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <label className="flex-1" htmlFor="profile-username">
        <span className="mb-1.5 block font-label-md text-label-md text-text-muted">
          ユーザー名
        </span>
        <Input
          id="profile-username"
          name="username"
          defaultValue={username}
          minLength={2}
          maxLength={32}
          required
        />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "保存中..." : "保存"}
      </Button>
      {(state.error || state.success) && (
        <p
          role={state.error ? "alert" : "status"}
          className={`text-body-sm sm:basis-full ${state.error ? "text-error" : "text-secondary"}`}
        >
          {state.error ?? state.success}
        </p>
      )}
    </form>
  );
}
