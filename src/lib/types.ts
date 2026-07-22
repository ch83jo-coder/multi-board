export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  karma: number;
  role: "member" | "admin";
};

export type HomeSort = "trending" | "latest" | "top";
export type BoardSort = "latest" | "popular";
export type TeslaDataType = "charging" | "ownership" | "price";
export type TeslaModel =
  | "Model 3"
  | "Model Y"
  | "Model S"
  | "Model X"
  | "Cybertruck"
  | "Roadster"
  | "その他";

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
  post_number: number;
  board_id: string;
  board?: Pick<Board, "slug" | "name" | "icon">;
  author_id: string | null;
  author?: Pick<Profile, "username" | "avatar_url">;
  guest_name: string | null;
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
  author_id: string | null;
  author?: Pick<Profile, "username" | "avatar_url">;
  guest_name: string | null;
  parent_id: string | null;
  content: string;
  created_at: string;
};

export type Notification = {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  actor?: Pick<Profile, "username" | "avatar_url"> | null;
  actor_name: string | null;
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

export type ChargingReview = {
  id: string;
  author_id: string;
  author?: Pick<Profile, "username" | "avatar_url">;
  location_name: string;
  prefecture: string;
  charger_type: "supercharger" | "destination" | "public" | "home" | "other";
  max_power_kw: number;
  measured_speed_kw: number;
  wait_minutes: number;
  congestion: "empty" | "comfortable" | "busy" | "full";
  rating: number;
  visited_on: string;
  notes: string;
  created_at: string;
};

export type OwnershipCost = {
  id: string;
  author_id: string;
  author?: Pick<Profile, "username" | "avatar_url">;
  model: TeslaModel;
  model_year: number;
  mileage_km: number;
  category:
    | "maintenance"
    | "repair"
    | "insurance"
    | "charging"
    | "tax"
    | "accessory"
    | "other";
  amount_yen: number;
  occurred_on: string;
  details: string;
  created_at: string;
};

export type PriceReport = {
  id: string;
  author_id: string;
  author?: Pick<Profile, "username" | "avatar_url">;
  report_type: "insurance" | "subsidy" | "used_price";
  model: TeslaModel;
  model_year: number | null;
  prefecture: string;
  amount_yen: number;
  provider: string;
  observed_on: string;
  details: string;
  created_at: string;
};

export type ActionState = { error?: string; success?: string };
