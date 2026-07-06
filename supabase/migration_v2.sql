-- Миграция V2: Остатки, Отзывы, Чат

-- 1. Добавляем количество в listings
alter table listings add column if not exists quantity integer default 1;

-- 2. Таблица отзывов (reviews)
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Таблица сообщений (чат)
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS для новых таблиц
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews

  FOR SELECT USING (true);

CREATE POLICY "Buyers can insert reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Messages policies
CREATE POLICY "Users can view messages they are part of" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Authenticated users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
