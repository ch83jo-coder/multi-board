import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-alt">
      <header className="h-16 border-b border-border-subtle bg-white">
        <div className="mx-auto flex h-full max-w-container-max-width items-center px-6">
          <Link
            href="/"
            className="font-headline-lg text-[28px] font-bold text-primary"
          >
            Panmoa
          </Link>
        </div>
      </header>
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
