"use client";

import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, action, pending] = useActionState(
    mode === "login" ? login : signup,
    {},
  );
  return (
    <form action={action} className="space-y-4">
      {mode === "signup" && (
        <label className="block" htmlFor="username">
          <span className="mb-1.5 block font-label-md text-label-md text-text-muted">
            USERNAME
          </span>
          <Input
            name="username"
            id="username"
            autoComplete="username"
            required
            minLength={2}
          />
        </label>
      )}
      <label className="block" htmlFor="email">
        <span className="mb-1.5 block font-label-md text-label-md text-text-muted">
          EMAIL
        </span>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>
      <label className="block" htmlFor="password">
        <span className="mb-1.5 block font-label-md text-label-md text-text-muted">
          PASSWORD
        </span>
        <Input
          name="password"
          id="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={6}
        />
      </label>
      {state.error && (
        <p
          role="alert"
          className="rounded bg-error-container px-3 py-2 text-body-sm text-on-error-container"
        >
          {state.error}
        </p>
      )}
      {state.success && (
        <p
          role="status"
          className="rounded bg-success-light px-3 py-2 text-body-sm text-secondary"
        >
          {state.success}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
      </Button>
    </form>
  );
}
