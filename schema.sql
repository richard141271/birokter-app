-- VIKTIG: Kjør dette scriptet i Supabase SQL Editor for å fikse ID-problemet.
-- Vi legger til en "default" verdi for ID, slik at det ikke kræsjer hvis ID mangler.

-- 1. Endre ID-kolonnen til å ha en standardverdi (tilfeldig ID) hvis den mangler
alter table apiaries 
  alter column id set default gen_random_uuid()::text;

alter table hives 
  alter column id set default gen_random_uuid()::text;

alter table inspections 
  alter column id set default gen_random_uuid()::text;

-- Profil-tabell (Beekeeper)
create table if not exists profiles (
  id text primary key default gen_random_uuid()::text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  address text,
  zip text,
  email text unique, -- Ensure email is unique for upsert
  phone text,
  role text,
  "orgName" text,
  "orgNr" text,
  pin text,
  "memberId" text,
  user_id uuid default auth.uid()
);

-- If table exists but email is not unique, add constraint:
do $$ 
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_email_key') then
    alter table profiles add constraint profiles_email_key unique (email);
  end if;
end $$;

alter table profiles enable row level security;
create policy "Public Access Profiles" on profiles for all using (true);

-- Eksisterende tabeller (for sikkerhets skyld)
create table if not exists apiaries (
  id text primary key default gen_random_uuid()::text, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  type text,
  address text,
  "regNr" text, 
  deleted_at timestamp with time zone,
  user_id uuid default auth.uid()
);

create table if not exists hives (
  id text primary key default gen_random_uuid()::text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  "apiaryId" text, 
  "queenYear" text,
  type text,
  strength text,
  status text,
  deleted_at timestamp with time zone,
  user_id uuid default auth.uid()
);

create table if not exists inspections (
  id text primary key default gen_random_uuid()::text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  "hiveId" text,
  status text,
  temp text,
  weather text,
  note text,
  image text,
  ts bigint,
  user_id uuid default auth.uid()
);

-- Sikre at policies er på plass
alter table apiaries enable row level security;
alter table hives enable row level security;
alter table inspections enable row level security;

create policy "Public Access Apiaries" on apiaries for all using (true);
create policy "Public Access Hives" on hives for all using (true);
create policy "Public Access Inspections" on inspections for all using (true);
