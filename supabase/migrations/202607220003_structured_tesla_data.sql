create table public.charging_reviews (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  location_name text not null check (char_length(btrim(location_name)) between 2 and 120),
  prefecture text not null check (char_length(btrim(prefecture)) between 2 and 4),
  charger_type text not null check (
    charger_type in ('supercharger', 'destination', 'public', 'home', 'other')
  ),
  max_power_kw numeric(6, 1) not null check (max_power_kw > 0 and max_power_kw <= 1000),
  measured_speed_kw numeric(6, 1) not null check (
    measured_speed_kw > 0 and measured_speed_kw <= 1000
  ),
  wait_minutes integer not null default 0 check (wait_minutes between 0 and 1440),
  congestion text not null check (
    congestion in ('empty', 'comfortable', 'busy', 'full')
  ),
  rating smallint not null check (rating between 1 and 5),
  visited_on date not null check (
    visited_on <= (now() at time zone 'Asia/Tokyo')::date
  ),
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now()
);

create table public.ownership_costs (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  model text not null check (
    model in ('Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', 'Roadster', 'その他')
  ),
  model_year smallint not null check (
    model_year between 2008 and extract(year from (now() at time zone 'Asia/Tokyo'))::integer
  ),
  mileage_km integer not null check (mileage_km between 0 and 3000000),
  category text not null check (
    category in ('maintenance', 'repair', 'insurance', 'charging', 'tax', 'accessory', 'other')
  ),
  amount_yen integer not null check (amount_yen between 0 and 100000000),
  occurred_on date not null check (
    occurred_on <= (now() at time zone 'Asia/Tokyo')::date
  ),
  details text not null check (char_length(btrim(details)) between 2 and 1000),
  created_at timestamptz not null default now()
);

create table public.price_reports (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  report_type text not null check (
    report_type in ('insurance', 'subsidy', 'used_price')
  ),
  model text not null check (
    model in ('Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', 'Roadster', 'その他')
  ),
  model_year smallint check (
    model_year between 2008 and extract(year from (now() at time zone 'Asia/Tokyo'))::integer
  ),
  prefecture text not null check (char_length(btrim(prefecture)) between 2 and 4),
  amount_yen integer not null check (amount_yen between 0 and 100000000),
  provider text not null check (char_length(btrim(provider)) between 2 and 120),
  observed_on date not null check (
    observed_on <= (now() at time zone 'Asia/Tokyo')::date
  ),
  details text not null default '' check (char_length(details) <= 1000),
  created_at timestamptz not null default now()
);

create index charging_reviews_region_idx
  on public.charging_reviews(prefecture, created_at desc);
create index charging_reviews_location_idx
  on public.charging_reviews(location_name, created_at desc);
create index ownership_costs_model_idx
  on public.ownership_costs(model, model_year, created_at desc);
create index ownership_costs_category_idx
  on public.ownership_costs(category, created_at desc);
create index price_reports_compare_idx
  on public.price_reports(report_type, model, prefecture, created_at desc);

alter table public.charging_reviews enable row level security;
alter table public.ownership_costs enable row level security;
alter table public.price_reports enable row level security;

create policy "Charging reviews are publicly readable"
  on public.charging_reviews for select using (true);
create policy "Members create charging reviews"
  on public.charging_reviews for insert to authenticated
  with check (author_id = auth.uid());
create policy "Authors update charging reviews"
  on public.charging_reviews for update to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());
create policy "Authors delete charging reviews"
  on public.charging_reviews for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

create policy "Ownership costs are publicly readable"
  on public.ownership_costs for select using (true);
create policy "Members create ownership costs"
  on public.ownership_costs for insert to authenticated
  with check (author_id = auth.uid());
create policy "Authors update ownership costs"
  on public.ownership_costs for update to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());
create policy "Authors delete ownership costs"
  on public.ownership_costs for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

create policy "Price reports are publicly readable"
  on public.price_reports for select using (true);
create policy "Members create price reports"
  on public.price_reports for insert to authenticated
  with check (author_id = auth.uid());
create policy "Authors update price reports"
  on public.price_reports for update to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());
create policy "Authors delete price reports"
  on public.price_reports for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

revoke insert, update, delete on public.charging_reviews from anon;
revoke insert, update, delete on public.ownership_costs from anon;
revoke insert, update, delete on public.price_reports from anon;

grant select on public.charging_reviews to anon, authenticated;
grant select on public.ownership_costs to anon, authenticated;
grant select on public.price_reports to anon, authenticated;
grant insert, delete on public.charging_reviews to authenticated;
grant insert, delete on public.ownership_costs to authenticated;
grant insert, delete on public.price_reports to authenticated;

revoke update on public.charging_reviews from authenticated;
grant update (
  location_name,
  prefecture,
  charger_type,
  max_power_kw,
  measured_speed_kw,
  wait_minutes,
  congestion,
  rating,
  visited_on,
  notes
) on public.charging_reviews to authenticated;

revoke update on public.ownership_costs from authenticated;
grant update (
  model,
  model_year,
  mileage_km,
  category,
  amount_yen,
  occurred_on,
  details
) on public.ownership_costs to authenticated;

revoke update on public.price_reports from authenticated;
grant update (
  report_type,
  model,
  model_year,
  prefecture,
  amount_yen,
  provider,
  observed_on,
  details
) on public.price_reports to authenticated;
