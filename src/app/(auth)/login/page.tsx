import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md p-7">
      <div className="mb-7 text-center">
        <h1 className="font-headline-lg text-headline-lg-mobile">
          おかえりなさい
        </h1>
        <p className="mt-2 text-body-md text-text-muted">
          Panmoaアカウントでコミュニティに参加しましょう。
        </p>
      </div>
      <AuthForm mode="login" />
      <p className="mt-6 text-center text-body-sm text-text-muted">
        アカウントをお持ちでないですか？{" "}
        <Link href="/signup" className="font-semibold text-primary">
          新規登録
        </Link>
      </p>
    </Card>
  );
}
