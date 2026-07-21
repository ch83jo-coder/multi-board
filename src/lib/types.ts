export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  karma: number;
  role: "member" | "admin";
};

export type HomeSort = "trending" | "latest" | "top";
export type BoardSort = "latest" | "popular";

export type Board = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  post_count?: number;
};

export type Post = {
  id: string;
  board_id: string;
  board?: Pick<Board, "slug" | "name" | "icon">;
  author_id: string;
  author?: Pick<Profile, "username" | "avatar_url">;
  title: string;
  content: string;
  thumbnail_url: string | null;
  view_count: number;
  comment_count: number;
  vote_count: number;
  is_pinned: boolean;
  is_notice: boolean;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  author?: Pick<Profile, "username" | "avatar_url">;
  parent_id: string | null;
  content: string;
  created_at: string;
};

export type Notification = {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  actor?: Pick<Profile, "username" | "avatar_url"> | null;
  type: "comment" | "vote";
  post_id: string;
  post?: {
    title: string;
    board?: Pick<Board, "slug"> | null;
  } | null;
  comment_id: string | null;
  is_read: boolean;
  created_at: string;
};

export type ActionState = { error?: string; success?: string };
