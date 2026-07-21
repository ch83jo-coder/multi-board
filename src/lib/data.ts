import { cache } from "react";
import {
  demoBoards,
  demoComments,
  demoNotifications,
  demoPosts,
} from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/env";
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

export async function getBoards(): Promise<Board[]> {
  if (!hasSupabaseEnv()) return demoBoards;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) {
    logQueryError("getBoards", error);
    return [];
  }
  return data as Board[];
}

export async function getHomePosts(
  sort: HomeSort = "trending",
): Promise<Post[]> {
  if (!hasSupabaseEnv()) {
    const posts = [...demoPosts];
    if (sort === "latest")
      return posts.sort(
        (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
      );
    const ranked = posts.sort((a, b) => b.vote_count - a.vote_count);
    if (sort === "top") return ranked;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return ranked.filter((post) => Date.parse(post.created_at) >= sevenDaysAgo);
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
  const { data, error } = await query.limit(20);
  if (error) {
    logQueryError("getHomePosts", error);
    return [];
  }
  return data as unknown as Post[];
}

export async function getBoard(slug: string): Promise<Board | null> {
  if (!hasSupabaseEnv())
    return demoBoards.find((board) => board.slug === slug) ?? null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) logQueryError("getBoard", error);
  return data as Board | null;
}

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
    const from = Math.max(0, page - 1) * 20;
    return posts.slice(from, from + 20);
  }
  const supabase = await createClient();
  const from = Math.max(0, page - 1) * 20;
  let query = supabase
    .from("posts")
    .select("*, author:profiles!posts_author_id_fkey(username,avatar_url)")
    .eq("board_id", boardId)
    .order("is_pinned", { ascending: false });
  query = query.order(sort === "popular" ? "vote_count" : "created_at", {
    ascending: false,
  });
  const { data, error } = await query.range(from, from + 19);
  if (error) {
    logQueryError("getBoardPosts", error);
    return [];
  }
  return data as unknown as Post[];
}

export async function getPost(postId: string): Promise<Post | null> {
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
}

export async function getComments(postId: string): Promise<Comment[]> {
  if (!hasSupabaseEnv())
    return demoComments.filter((comment) => comment.post_id === postId);
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
  return data as unknown as Comment[];
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
