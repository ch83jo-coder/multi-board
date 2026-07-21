import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <Card className="w-full max-w-md p-7">
      <div className="mb-7 text-center">
        <h1 className="font-headline-lg text-headline-lg-mobile">
          커뮤니티 시작하기
        </h1>
        <p className="mt-2 text-body-md text-text-muted">
          몇 초 만에 계정을 만들 수 있습니다.
        </p>
      </div>
      <AuthForm mode="signup" />
      <p className="mt-6 text-center text-body-sm text-text-muted">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="font-semibold text-primary">
          로그인
        </Link>
      </p>
    </Card>
  );
}
