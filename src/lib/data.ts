import { unstable_cache } from "next/cache";
import { cache } from "react";
import {
  demoBoards,
  demoComments,
  demoNotifications,
  demoPosts,
} from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/env";
import { getAnonymousClient } from "@/lib/supabase/anonymous";
import { createClient } from "@/lib/supabase/server";
import type {
  Board,
  BoardSort,
  Comment,
  HomeSort,
  Notification,
  Post,
  Profile,
} from "@/lib/types";

export const POSTS_PER_PAGE = 20;

export function parseHomeSort(value?: string): HomeSort {
  return value === "latest" || value === "top" ? value : "trending";
}

export function parseBoardSort(value?: string): BoardSort {
  return value === "popular" ? value : "latest";
}

function logQueryError(
  query: string,
  error: { code?: string; message: string } | null,
) {
  if (!error) return;
  console.error(
    `[data:${query}] Supabase query failed (${error.code ?? "unknown"}): ${error.message}`,
  );
}

function orderComments(comments: Comment[]) {
  const replies = new Map<string, Comment[]>();
  for (const comment of comments) {
    if (!comment.parent_id) continue;
    const group = replies.get(comment.parent_id) ?? [];
    group.push(comment);
    replies.set(comment.parent_id, group);
  }
  return comments
    .filter((comment) => !comment.parent_id)
    .flatMap((comment) => [comment, ...(replies.get(comment.id) ?? [])]);
}

const getCachedActiveBoards = unstable_cache(
  async (): Promise<Board[]> => {
    const supabase = getAnonymousClient();
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) {
      logQueryError("getCachedActiveBoards", error);
      throw new Error("Active boards could not be loaded.");
    }
    return data as Board[];
  },
  ["active-boards"],
  { revalidate: 300, tags: ["boards"] },
);

export const getBoards = cache(
  async (includeInactive = false): Promise<Board[]> => {
    if (!hasSupabaseEnv())
      return includeInactive
        ? [...demoBoards]
        : demoBoards.filter((board) => board.is_active);
    if (!includeInactive) {
      try {
        return await getCachedActiveBoards();
      } catch {
        return [];
      }
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .order("sort_order");
    if (error) {
      logQueryError("getBoards", error);
      return [];
    }
    return data as Board[];
  },
);

export async function getHomePosts(
  sort: HomeSort = "trending",
  page = 1,
): Promise<Post[]> {
  if (!hasSupabaseEnv()) {
    const posts = [...demoPosts];
    const sorted =
      sort === "latest"
        ? posts.sort(
            (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
          )
        : posts.sort((a, b) => b.vote_count - a.vote_count);
    const filtered =
      sort === "trending"
        ? sorted.filter(
            (post) =>
              Date.parse(post.created_at) >=
              Date.now() - 7 * 24 * 60 * 60 * 1000,
          )
        : sorted;
    const from = Math.max(0, page - 1) * POSTS_PER_PAGE;
    return filtered.slice(from, from + POSTS_PER_PAGE);
  }
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select(
      "*, board:boards(slug,name,icon), author:profiles!posts_author_id_fkey(username,avatar_url)",
    );
  if (sort === "latest") {
    query = query.order("created_at", { ascending: false });
  } else {
    if (sort === "trending") {
      const sevenDaysAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
      query = query.gte("created_at", sevenDaysAgo);
    }
    query = query.order("vote_count", { ascending: false });
  }
  const from = Math.max(0, page - 1) * POSTS_PER_PAGE;
  const { data, error } = await query.range(from, from + POSTS_PER_PAGE - 1);
  if (error) {
    logQueryError("getHomePosts", error);
    return [];
  }
  return data as unknown as Post[];
}

export async function getHomePostCount(
  sort: HomeSort = "trending",
): Promise<number> {
  if (!hasSupabaseEnv()) {
    if (sort !== "trending") return demoPosts.length;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return demoPosts.filter(
      (post) => Date.parse(post.created_at) >= sevenDaysAgo,
    ).length;
  }
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("*", { count: "exact", head: true });
  if (sort === "trending") {
    query = query.gte(
      "created_at",
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    );
  }
  const { count, error } = await query;
  if (error) {
    logQueryError("getHomePostCount", error);
    return 0;
  }
  return count ?? 0;
}

export const getBoard = cache(async (slug: string): Promise<Board | null> => {
  if (!hasSupabaseEnv()) {
    const board = demoBoards.find((candidate) => candidate.slug === slug);
    return board?.is_active ? board : null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  // RLS exposes inactive boards only when the current viewer is an admin.
  if (error) logQueryError("getBoard", error);
  return data as Board | null;
});

export async function getBoardPosts(
  boardId: string,
  page = 1,
  sort: BoardSort = "latest",
): Promise<Post[]> {
  if (!hasSupabaseEnv()) {
    const posts = demoPosts
      .filter((post) => post.board_id === boardId)
      .slice()
      .sort(
        (a, b) =>
          Number(b.is_pinned) - Number(a.is_pinned) ||
          (sort === "popular"
            ? b.vote_count - a.vote_count
            : Date.parse(b.created_at) - Date.parse(a.created_at)),
      );
    const from = Math.max(0, page - 1) * POSTS_PER_PAGE;
    return posts.slice(from, from + POSTS_PER_PAGE);
  }
  const supabase = await createClient();
  const from = Math.max(0, page - 1) * POSTS_PER_PAGE;
  let query = supabase
    .from("posts")
    .select("*, author:profiles!posts_author_id_fkey(username,avatar_url)")
    .eq("board_id", boardId)
    .order("is_pinned", { ascending: false });
  query = query.order(sort === "popular" ? "vote_count" : "created_at", {
    ascending: false,
  });
  const { data, error } = await query.range(from, from + POSTS_PER_PAGE - 1);
  if (error) {
    logQueryError("getBoardPosts", error);
    return [];
  }
  return data as unknown as Post[];
}

export async function getBoardPostCount(boardId: string): Promise<number> {
  if (!hasSupabaseEnv())
    return demoPosts.filter((post) => post.board_id === boardId).length;
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("board_id", boardId);
  if (error) {
    logQueryError("getBoardPostCount", error);
    return 0;
  }
  return count ?? 0;
}

export async function getBoardBestPosts(boardId: string): Promise<Post[]> {
  if (!hasSupabaseEnv())
    return demoPosts
      .filter((post) => post.board_id === boardId && !post.is_pinned)
      .slice()
      .sort((a, b) => b.vote_count - a.vote_count)
      .slice(0, 3);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, author:profiles!posts_author_id_fkey(username,avatar_url)")
    .eq("board_id", boardId)
    .eq("is_pinned", false)
    .gte(
      "created_at",
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    )
    .order("vote_count", { ascending: false })
    .limit(3);
  if (error) {
    logQueryError("getBoardBestPosts", error);
    return [];
  }
  return data as unknown as Post[];
}

export const getPost = cache(async (postId: string): Promise<Post | null> => {
  if (!hasSupabaseEnv())
    return demoPosts.find((post) => post.id === postId) ?? null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "*, board:boards(slug,name,icon), author:profiles!posts_author_id_fkey(username,avatar_url)",
    )
    .eq("id", postId)
    .maybeSingle();
  if (error) logQueryError("getPost", error);
  return data as unknown as Post | null;
});

export async function getComments(postId: string): Promise<Comment[]> {
  if (!hasSupabaseEnv())
    return orderComments(
      demoComments.filter((comment) => comment.post_id === postId),
    );
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, author:profiles!comments_author_id_fkey(username,avatar_url)")
    .eq("post_id", postId)
    .order("created_at");
  if (error) {
    logQueryError("getComments", error);
    return [];
  }
  return orderComments(data as unknown as Comment[]);
}

export const getViewer = cache(async (): Promise<Profile | null> => {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError && authError.name !== "AuthSessionMissingError")
    logQueryError("getViewer.auth", authError);
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (error) logQueryError("getViewer.profile", error);
  return data as Profile | null;
});

export async function getMyPosts(userId: string): Promise<Post[]> {
  if (!hasSupabaseEnv())
    return demoPosts.filter((post) => post.author_id === userId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "*, board:boards(slug,name,icon), author:profiles!posts_author_id_fkey(username,avatar_url)",
    )
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    logQueryError("getMyPosts", error);
    return [];
  }
  return data as unknown as Post[];
}

export async function getMyCommentCount(userId: string): Promise<number> {
  if (!hasSupabaseEnv())
    return demoComments.filter((comment) => comment.author_id === userId)
      .length;
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("author_id", userId);
  if (error) {
    logQueryError("getMyCommentCount", error);
    return 0;
  }
  return count ?? 0;
}

export async function getMyVote(postId: string): Promise<1 | -1 | null> {
  if (!hasSupabaseEnv()) return null;
  const viewer = await getViewer();
  if (!viewer) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("post_votes")
    .select("value")
    .eq("post_id", postId)
    .eq("user_id", viewer.id)
    .maybeSingle();
  if (error) {
    logQueryError("getMyVote", error);
    return null;
  }
  return data?.value === 1 || data?.value === -1 ? data.value : null;
}

export async function incrementViewCount(
  postId: string,
): Promise<number | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = getAnonymousClient();
  const { data, error } = await supabase.rpc("increment_view_count", {
    target_post_id: postId,
  });
  if (error) {
    logQueryError("incrementViewCount", error);
    return null;
  }
  return typeof data === "number" ? data : null;
}

export async function searchPosts(query: string): Promise<Post[]> {
  const term = query.trim().slice(0, 100);
  if (!term) return [];
  if (!hasSupabaseEnv()) {
    const normalized = term.toLocaleLowerCase("ja-JP");
    return demoPosts.filter((post) =>
      post.title.toLocaleLowerCase("ja-JP").includes(normalized),
    );
  }
  const supabase = await createClient();
  const pattern = term.replace(/[\\%_]/g, "\\$&");
  const { data, error } = await supabase
    .from("posts")
    .select(
      "*, board:boards(slug,name,icon), author:profiles!posts_author_id_fkey(username,avatar_url)",
    )
    .ilike("title", `%${pattern}%`)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    logQueryError("searchPosts", error);
    return [];
  }
  return data as unknown as Post[];
}

export async function getNotifications(limit = 10): Promise<Notification[]> {
  if (!hasSupabaseEnv()) return demoNotifications.slice(0, limit);
  const viewer = await getViewer();
  if (!viewer) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select(
      "*, actor:profiles!notifications_actor_id_fkey(username,avatar_url), post:posts!notifications_post_id_fkey(title, board:boards(slug))",
    )
    .eq("recipient_id", viewer.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    logQueryError("getNotifications", error);
    return [];
  }
  return data as unknown as Notification[];
}

export async function getUnreadNotificationCount(): Promise<number> {
  if (!hasSupabaseEnv())
    return demoNotifications.filter((notification) => !notification.is_read)
      .length;
  const viewer = await getViewer();
  if (!viewer) return 0;
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", viewer.id)
    .eq("is_read", false);
  if (error) {
    logQueryError("getUnreadNotificationCount", error);
    return 0;
  }
  return count ?? 0;
}
