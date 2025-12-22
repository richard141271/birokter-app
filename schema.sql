-- VIKTIG: Kjør dette scriptet i Supabase SQL Editor for å fikse ID-problemet.
-- Dette scriptet er nå oppdatert for å slette ALLE gamle policies som kan skape trøbbel.

-- 0. Slett policies som hindrer oss i å endre ID-typen
-- Vi tar hardt i her og sletter alt av mulige varianter for å være sikre.

-- Profiles
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Users can delete own profile" on profiles;
drop policy if exists "Public Access Profiles" on profiles;

-- Apiaries
drop policy if exists "Users can view own apiaries" on apiaries;
drop policy if exists "Users can update own apiaries" on apiaries;
drop policy if exists "Users can insert own apiaries" on apiaries;
drop policy if exists "Users can delete own apiaries" on apiaries;
drop policy if exists "Public Access Apiaries" on apiaries;

-- Hives
drop policy if exists "Users can view own hives" on hives;
drop policy if exists "Users can update own hives" on hives;
drop policy if exists "Users can insert own hives" on hives;
drop policy if exists "Users can delete own hives" on hives;
drop policy if exists "Public Access Hives" on hives;

-- Inspections
drop policy if exists "Users can view own inspections" on inspections;
drop policy if exists "Users can update own inspections" on inspections;
drop policy if exists "Users can insert own inspections" on inspections;
drop policy if exists "Users can delete own inspections" on inspections;
drop policy if exists "Public Access Inspections" on inspections;

-- 1. Endre ID-kolonnen til å være TEKST (slik at den støtter både BG-001 og UUID)
-- Vi må gjøre dette FØR vi setter standardverdien.

-- Apiaries
alter table apiaries alter column id type text;
alter table apiaries alter column id set default gen_random_uuid()::text;

-- Hives
alter table hives alter column id type text;
alter table hives alter column id set default gen_random_uuid()::text;

-- Inspections
alter table inspections alter column id type text;
alter table inspections alter column id set default gen_random_uuid()::text;

-- Profiles
alter table profiles alter column id type text;
alter table profiles alter column id set default gen_random_uuid()::text;

-- 2. Profil-tabell (Beekeeper)
create table if not exists profiles (
  id text primary key default gen_random_uuid()::text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  address text,
  zip text,
  email text unique, 
  phone text,
  role text,
  "orgName" text,
  "orgNr" text,
  pin text,
  "memberId" text,
  user_id uuid default auth.uid(),
  
  -- Nye felter som manglet
  municipality text,
  rokt_type text,
  company_name text,
  org_number text,
  company_account text,
  account text,
  is_nbl_member boolean,
  nbl_id text,
  lokallag text,
  is_lek_member boolean,
  is_hc_supplier boolean,
  interests jsonb
);

-- Oppdater eksisterende tabell hvis den mangler felter (Idempotent)
-- Grunnleggende felter (i tilfelle tabellen er gammel)
alter table profiles add column if not exists "memberId" text;
alter table profiles add column if not exists "orgName" text;
alter table profiles add column if not exists "orgNr" text;
alter table profiles add column if not exists pin text;
alter table profiles add column if not exists role text;
alter table profiles add column if not exists phone text;
alter table profiles add column if not exists zip text;
alter table profiles add column if not exists address text;
alter table profiles add column if not exists name text;

-- Nye felter (lagt til senere)
alter table profiles add column if not exists municipality text;

alter table profiles add column if not exists rokt_type text;
alter table profiles add column if not exists company_name text;
alter table profiles add column if not exists org_number text;
alter table profiles add column if not exists company_account text;
alter table profiles add column if not exists account text;
alter table profiles add column if not exists is_nbl_member boolean;
alter table profiles add column if not exists nbl_id text;
alter table profiles add column if not exists lokallag text;
alter table profiles add column if not exists is_lek_member boolean;
alter table profiles add column if not exists is_hc_supplier boolean;
alter table profiles add column if not exists interests jsonb;


-- Sikre unik e-post (hvis tabellen ble laget uten 'unique' først)
do $$ 
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_email_key') then
    alter table profiles add constraint profiles_email_key unique (email);
  end if;
end $$;

-- 3. Eksisterende tabeller (opprettes kun hvis de mangler)
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

-- 4. Sikre at Row Level Security er PÅ
alter table apiaries enable row level security;
alter table hives enable row level security;
alter table inspections enable row level security;
alter table profiles enable row level security;

-- 5. Opprett Policies (Sletter først hvis de finnes, så vi unngår feilmelding)
drop policy if exists "Public Access Apiaries" on apiaries;
create policy "Public Access Apiaries" on apiaries for all using (true);

drop policy if exists "Public Access Hives" on hives;
create policy "Public Access Hives" on hives for all using (true);

drop policy if exists "Public Access Inspections" on inspections;
create policy "Public Access Inspections" on inspections for all using (true);

drop policy if exists "Public Access Profiles" on profiles;
create policy "Public Access Profiles" on profiles for all using (true);
