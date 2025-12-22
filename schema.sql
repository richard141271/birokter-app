-- VIKTIG: Kjør dette scriptet i Supabase SQL Editor for å sette opp databasen riktig.
-- Hvis du allerede har tabeller, kan det være lurt å slette dem først (DROP TABLE apiaries, hives, inspections;)

-- 1. Tabell for Bigårder (Apiaries)
create table if not exists apiaries (
  id text primary key, -- Vi bruker TEXT for ID (f.eks "L-001")
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  type text,
  address text,
  "regNr" text, -- Matches JSON: regNr
  deleted_at timestamp with time zone,
  user_id uuid default auth.uid()
);

-- 2. Tabell for Bikuber (Hives)
create table if not exists hives (
  id text primary key, -- f.eks "B-001"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  "apiaryId" text, -- Matches JSON: apiaryId
  "queenYear" text, -- Matches JSON: queenYear
  type text,
  strength text,
  status text,
  deleted_at timestamp with time zone,
  user_id uuid default auth.uid()
);

-- 3. Tabell for Inspeksjoner (Inspections)
create table if not exists inspections (
  id text primary key, -- f.eks "INSPEKSJON-001"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  "hiveId" text, -- Matches JSON: hiveId
  status text,
  temp text,
  weather text,
  note text,
  image text, -- Base64 streng
  ts bigint,
  user_id uuid default auth.uid()
);

-- 4. Slå på sikkerhet (RLS)
alter table apiaries enable row level security;
alter table hives enable row level security;
alter table inspections enable row level security;

-- 5. Lagre regler (Policies) - Åpent for alle (enkelt oppsett)
-- Drop existing policies first to avoid errors if re-running
drop policy if exists "Public Access Apiaries" on apiaries;
drop policy if exists "Public Access Hives" on hives;
drop policy if exists "Public Access Inspections" on inspections;

create policy "Public Access Apiaries" on apiaries for all using (true);
create policy "Public Access Hives" on hives for all using (true);
create policy "Public Access Inspections" on inspections for all using (true);
