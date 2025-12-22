-- VIKTIG: Kjør dette scriptet i Supabase SQL Editor for å fikse problemene.
-- Dette scriptet gjør 'user_id' valgfri (nullable) slik at appen fungerer uten Supabase Auth-login.
-- Det sikrer også at ID-er er tekst (for å støtte appens ID-format).

-- 1. Fjern "not null" kravet på user_id (hvis det finnes)
alter table apiaries alter column user_id drop not null;
alter table hives alter column user_id drop not null;
alter table inspections alter column user_id drop not null;
alter table profiles alter column user_id drop not null;

-- 2. Slett gamle policies som kan skape problemer
drop policy if exists "Public Access Apiaries" on apiaries;
drop policy if exists "Public Access Hives" on hives;
drop policy if exists "Public Access Inspections" on inspections;
drop policy if exists "Public Access Profiles" on profiles;

-- 3. Slett foreign keys som lenker til auth.users (fordi vi endrer ID til tekst)
alter table profiles drop constraint if exists "profiles_id_fkey";
alter table profiles drop constraint if exists "profiles_user_id_fkey";

-- 4. Endre ID-kolonnen til å være TEKST (hvis den ikke allerede er det)
-- Vi bruker en DO block for å håndtere eventuelle feil hvis kolonnen allerede er tekst
do $$ 
begin
    -- Apiaries
    begin
        alter table apiaries alter column id type text;
        alter table apiaries alter column id set default gen_random_uuid()::text;
    exception when others then null; end;

    -- Hives
    begin
        alter table hives alter column id type text;
        alter table hives alter column id set default gen_random_uuid()::text;
    exception when others then null; end;

    -- Inspections
    begin
        alter table inspections alter column id type text;
        alter table inspections alter column id set default gen_random_uuid()::text;
    exception when others then null; end;

    -- Profiles
    begin
        alter table profiles alter column id type text;
        alter table profiles alter column id set default gen_random_uuid()::text;
    exception when others then null; end;
end $$;

-- 5. Sørg for at tabellene har alle nødvendige felter
-- Profiles
alter table profiles add column if not exists "memberId" text;
alter table profiles add column if not exists interests jsonb;
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
alter table profiles add column if not exists pin text;
alter table profiles add column if not exists name text;
alter table profiles add column if not exists email text;

-- 6. Opprett åpne Policies (Tillat alt for alle, siden vi bruker lokal PIN-sikring)
create policy "Public Access Apiaries" on apiaries for all using (true);
create policy "Public Access Hives" on hives for all using (true);
create policy "Public Access Inspections" on inspections for all using (true);
create policy "Public Access Profiles" on profiles for all using (true);

-- 7. Aktiver RLS
alter table apiaries enable row level security;
alter table hives enable row level security;
alter table inspections enable row level security;
alter table profiles enable row level security;
