import { demoBoards, demoComments, demoPosts } from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Board, Comment, Post, Profile } from "@/lib/types";

export async function getBoards(): Promise<Board[]> {
  if (!hasSupabaseEnv()) return demoBoards;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) return demoBoards;
  return data as Board[];
}

export async function getHomePosts(): Promise<Post[]> {
  if (!hasSupabaseEnv()) return demoPosts;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "*, board:boards(slug,name,icon), author:profiles(username,avatar_url)",
    )
    .order("vote_count", { ascending: false })
    .limit(20);
  if (error) return demoPosts;
  return data as unknown as Post[];
}

export async function getBoard(slug: string): Promise<Board | null> {
  if (!hasSupabaseEnv())
    return demoBoards.find((board) => board.slug === slug) ?? null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("boards")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data as Board | null;
}

export async function getBoardPosts(
  boardId: string,
  page = 1,
): Promise<Post[]> {
  if (!hasSupabaseEnv())
    return demoPosts.filter((post) => post.board_id === boardId);
  const supabase = await createClient();
  const from = Math.max(0, page - 1) * 20;
  const { data, error } = await supabase
    .from("posts")
    .select("*, author:profiles(username,avatar_url)")
    .eq("board_id", boardId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, from + 19);
  if (error) return [];
  return data as unknown as Post[];
}

export async function getPost(postId: string): Promise<Post | null> {
  if (!hasSupabaseEnv())
    return demoPosts.find((post) => post.id === postId) ?? null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(
      "*, board:boards(slug,name,icon), author:profiles(username,avatar_url)",
    )
    .eq("id", postId)
    .maybeSingle();
  return data as unknown as Post | null;
}

export async function getComments(postId: string): Promise<Comment[]> {
  if (!hasSupabaseEnv())
    return demoComments.filter((comment) => comment.post_id === postId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, author:profiles(username,avatar_url)")
    .eq("post_id", postId)
    .order("created_at");
  if (error) return [];
  return data as unknown as Comment[];
}

export async function getViewer(): Promise<Profile | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", auth.user.id)
    .maybeSingle();
  return data as Profile | null;
}
