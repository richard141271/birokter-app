-- Enable Row Level Security (RLS) is recommended, but for simplicity in this prototype, 
-- we will start with public access. You should enable RLS later.

-- 1. Create Apiaries (Lokasjoner/Bigårder) table
create table if not exists apiaries (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null, -- Name is currently the identifier in the app
  type text, -- 'bigard', 'lager', etc.
  icon text, -- e.g. 'home', 'archive'
  coordinates jsonb, -- {lat: ..., lng: ...}
  deleted_at timestamp with time zone, -- Soft delete
  user_id uuid default auth.uid() -- Link to user if logged in
);

-- 2. Create Hives (Bikuber) table
create table if not exists hives (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  location text, -- Currently links to apiary name
  strength text,
  status text,
  deleted_at timestamp with time zone,
  user_id uuid default auth.uid()
);

-- 3. Create Inspections (Inspeksjoner) table
create table if not exists inspections (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  hive_id text, -- ID or Name of the hive
  date date,
  notes text,
  registrations jsonb, -- Detailed inspection data
  user_id uuid default auth.uid()
);

-- 4. Enable RLS (Row Level Security) - Optional for now but good practice
alter table apiaries enable row level security;
alter table hives enable row level security;
alter table inspections enable row level security;

-- 5. Create Policies (Allow everything for now if you have the key)
-- Note: In a real app, you would restrict this to the authenticated user.
create policy "Enable read access for all users" on apiaries for select using (true);
create policy "Enable insert access for all users" on apiaries for insert with check (true);
create policy "Enable update access for all users" on apiaries for update using (true);
create policy "Enable delete access for all users" on apiaries for delete using (true);

create policy "Enable read access for all users" on hives for select using (true);
create policy "Enable insert access for all users" on hives for insert with check (true);
create policy "Enable update access for all users" on hives for update using (true);
create policy "Enable delete access for all users" on hives for delete using (true);

create policy "Enable read access for all users" on inspections for select using (true);
create policy "Enable insert access for all users" on inspections for insert with check (true);
create policy "Enable update access for all users" on inspections for update using (true);
create policy "Enable delete access for all users" on inspections for delete using (true);
