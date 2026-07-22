import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <Card className="w-full max-w-md p-7">
      <div className="mb-7 text-center">
        <h1 className="font-headline-lg text-headline-lg-mobile">
          Teslaのリアルを共有しよう
        </h1>
        <p className="mt-2 text-body-md text-text-muted">
          実測データの投稿とオーナーへの回答に参加できます。
        </p>
      </div>
      <AuthForm mode="signup" />
      <p className="mt-6 text-center text-body-sm text-text-muted">
        すでにアカウントをお持ちですか？{" "}
        <Link href="/login" className="font-semibold text-primary">
          ログイン
        </Link>
      </p>
    </Card>
  );
}
