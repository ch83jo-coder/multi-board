import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SideNav } from "@/components/layout/side-nav";
import { TopNavBar } from "@/components/layout/top-nav-bar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <TopNavBar />
      <div className="mx-auto flex max-w-container-max-width gap-gutter px-4 py-gutter md:px-margin-desktop">
        <SideNav />
        <main className="min-w-0 flex-1 pb-16 md:pb-0">{children}</main>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
