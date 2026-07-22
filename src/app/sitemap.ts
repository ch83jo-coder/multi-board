import type { MetadataRoute } from "next";
import { demoBoards } from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/env";
import { absoluteUrl } from "@/lib/seo";
import { getAnonymousClient } from "@/lib/supabase/anon";

export const revalidate = 3600;

type SitemapPost = {
  id: string;
  updated_at: string;
  board_id: string;
};

type SitemapBoard = {
  id: string;
  slug: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl("/"),
    changeFrequency: "hourly",
    priority: 1,
  };
  const teslaData: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl("/tesla-data"),
    changeFrequency: "daily",
    priority: 0.9,
  };

  if (!hasSupabaseEnv()) {
    return [
      home,
      teslaData,
      ...demoBoards
        .filter((board) => board.is_active)
        .map((board) => ({
          url: absoluteUrl(`/boards/${encodeURIComponent(board.slug)}`),
          changeFrequency: "daily" as const,
          priority: 0.8,
        })),
    ];
  }

  const supabase = getAnonymousClient();
  const { data: boards, error: boardsError } = await supabase
    .from("boards")
    .select("id,slug")
    .eq("is_active", true)
    .order("sort_order");

  if (boardsError) {
    console.error(
      `[sitemap:boards] Supabase query failed (${boardsError.code}): ${boardsError.message}`,
    );
    return [home, teslaData];
  }

  const activeBoards = (boards ?? []) as SitemapBoard[];
  const boardById = new Map(
    activeBoards.map((board) => [board.id, board.slug] as const),
  );
  const boardEntries: MetadataRoute.Sitemap = activeBoards.map((board) => ({
    url: absoluteUrl(`/boards/${encodeURIComponent(board.slug)}`),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  if (!activeBoards.length) return [home, teslaData];

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("id,updated_at,board_id")
    .in(
      "board_id",
      activeBoards.map((board) => board.id),
    )
    .order("created_at", { ascending: false })
    .limit(1000);

  if (postsError) {
    console.error(
      `[sitemap:posts] Supabase query failed (${postsError.code}): ${postsError.message}`,
    );
    return [home, teslaData, ...boardEntries];
  }

  const postEntries: MetadataRoute.Sitemap = (posts as SitemapPost[]).flatMap(
    (post) => {
      const slug = boardById.get(post.board_id);
      if (!slug) return [];
      return [
        {
          url: absoluteUrl(
            `/boards/${encodeURIComponent(slug)}/${encodeURIComponent(post.id)}`,
          ),
          lastModified: post.updated_at,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        },
      ];
    },
  );

  return [home, teslaData, ...boardEntries, ...postEntries];
}
