import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md p-7">
      <div className="mb-7 text-center">
        <h1 className="font-headline-lg text-headline-lg-mobile">
          다시 만나 반가워요
        </h1>
        <p className="mt-2 text-body-md text-text-muted">
          Panmoa 계정으로 토론에 참여하세요.
        </p>
      </div>
      <AuthForm mode="login" />
      <p className="mt-6 text-center text-body-sm text-text-muted">
        아직 계정이 없나요?{" "}
        <Link href="/signup" className="font-semibold text-primary">
          회원가입
        </Link>
      </p>
    </Card>
  );
}
