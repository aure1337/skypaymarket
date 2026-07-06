-- FunPay Clone Schema
-- Run this in Supabase SQL Editor

-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade,
  username text unique not null,
  avatar_url text,
  rating integer default 0,
  sales_count integer default 0,
  created_at timestamptz default now(),
  primary key (id)
);

-- Categories table
create table categories (
  id serial primary key,
  name text not null,
  slug text unique not null,
  icon text,
  parent_id integer references categories(id),
  created_at timestamptz default now()
);

-- Listings table
create table listings (
  id serial primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  category_id integer references categories(id) on delete cascade not null,
  title text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  status text default 'active' check (status in ('active', 'sold', 'cancelled')),
  created_at timestamptz default now()
);

-- Orders table
create table orders (
  id serial primary key,
  buyer_id uuid references profiles(id) on delete cascade not null,
  seller_id uuid references profiles(id) on delete cascade not null,
  listing_id integer references listings(id) on delete cascade not null,
  amount numeric(10,2) not null,
  status text default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table listings enable row level security;
alter table orders enable row level security;

-- Profiles policies
create policy "Profiles are viewable by everyone" on profiles
  for select using (true);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Listings policies
create policy "Listings are viewable by everyone Fair use." on listings
  for select using (true);

create policy "Authenticated users can create listings" on listings
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update own listings" on listings
  for update using (auth.uid() = user_id);

create policy "Users can delete own listings" on listings
  for delete using (auth.uid() = user_id);

-- Orders policies
create policy "Users can view own orders" on orders
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Authenticated users can create orders" on orders
  for insert with check (auth.role() = 'authenticated');

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Insert default categories
insert into categories (name, slug, icon) values
('CS2', 'cs2', 'game'),
('Dota 2', 'dota-2', 'game'),
('World of Tanks', 'world-of-tanks', 'game'),
('Steam', 'steam', 'platform'),
('Discord', 'discord', 'platform'),
('Spotify', 'spotify', 'platform'),
('VK', 'vkontakte', 'social'),
('Игровые ценности', 'gaming-values', 'item'),
('Аккаунты', 'accounts', 'item'),
('Услуги', 'services', 'service');
