import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
import type { Post } from "@/lib/types";

export function Hero({ post }: { post?: Post }) {
  const href = post ? `/boards/${post.board?.slug}/${post.id}` : "/boards/news";
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <Link
        href={href}
        className="group relative h-64 overflow-hidden rounded-lg border border-border-subtle bg-inverse-surface md:col-span-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,#0055ff_0,transparent_45%),linear-gradient(135deg,#10203f,#111827)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute bottom-0 z-10 p-6">
          <span className="mb-2 inline-block rounded-sm bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Breaking News
          </span>
          <h1 className="font-headline-lg text-headline-lg-mobile leading-tight text-white md:text-headline-lg">
            {post?.title ?? "Panmoa 2.0: A New Era for Discussion"}
          </h1>
          <p className="mt-2 line-clamp-1 text-body-sm text-white/75">
            A modern space engineered for high-density information exchange.
          </p>
        </div>
      </Link>
      <div className="flex flex-col gap-4 md:col-span-4">
        <Link
          href="/boards/humor"
          className="group relative flex-1 overflow-hidden rounded-lg bg-primary-container p-5 text-on-primary-container"
        >
          <h2 className="font-headline-md text-headline-md">
            Weekly Humour Digest
          </h2>
          <p className="mt-2 text-body-sm opacity-90">
            The conversations and jokes that defined the week.
          </p>
          <MaterialIcon
            name="sentiment_very_satisfied"
            className="absolute -bottom-2 -right-2 text-6xl opacity-20 transition-transform group-hover:rotate-6"
          />
        </Link>
        <Link
          href="/boards/game/framework-poll"
          className="flex-1 rounded-lg border border-border-subtle bg-surface-container p-5"
        >
          <h2 className="font-headline-md text-headline-md text-primary">
            Poll of the Day
          </h2>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            Which framework are you prioritizing?
          </p>
          <div className="mt-4 flex gap-2">
            <div className="h-1 flex-[2] rounded-full bg-primary" />
            <div className="h-1 flex-1 rounded-full bg-border-subtle" />
          </div>
        </Link>
      </div>
    </section>
  );
}
