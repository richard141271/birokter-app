-- 1. Enable Row Level Security (Recommended for production, but optional for initial test)
-- We will enable it but create open policies for now to get you started easily.

-- PROFILES
create table public.profiles (
  id uuid references auth.users not null primary key,
  name text,
  address text,
  zip text,
  municipality text,
  phone text,
  email text,
  account text,
  rokt_type text,
  org_number text,
  company_name text,
  company_account text,
  is_nbl_member boolean,
  nbl_id text,
  lokallag text,
  is_lek_member boolean,
  is_hc_supplier boolean,
  interests jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- APIARIES (Bigårder)
create table public.apiaries (
  id text primary key,
  user_id uuid references auth.users not null,
  name text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.apiaries enable row level security;
create policy "Users can crud own apiaries" on apiaries for all using (auth.uid() = user_id);

-- HIVES (Bikuber)
create table public.hives (
  id text primary key,
  apiary_id text references public.apiaries(id),
  user_id uuid references auth.users not null,
  queen_year text,
  type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.hives enable row level security;
create policy "Users can crud own hives" on hives for all using (auth.uid() = user_id);

-- INSPECTIONS (Inspeksjoner)
create table public.inspections (
  id text primary key,
  hive_id text references public.hives(id),
  user_id uuid references auth.users not null,
  status text,
  temp text,
  weather text,
  note text,
  image_url text,
  ts bigint,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.inspections enable row level security;
create policy "Users can crud own inspections" on inspections for all using (auth.uid() = user_id);

-- STORAGE (For Images)
-- You must create a bucket named 'images' in the Supabase Dashboard Storage section.
-- Then run this policy to allow public access to view, but authenticated upload.
-- (Or configure via Dashboard UI).
