-- V3: Username Slug, Avatar Upload, Username History

-- 1. Добавляем поля в profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username_changed_at TIMESTAMPTZ;

-- 2. Индекс для быстрого поиска по slug
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(slug);

-- 3. Таблица истории никнеймов
CREATE TABLE IF NOT EXISTS username_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  old_username TEXT NOT NULL,
  new_username TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS
ALTER TABLE username_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own history" ON username_history
  FOR SELECT USING (auth.uid() = user_id);

-- 5. Обновляем существующих пользователей - slug = part before @ in email
UPDATE profiles SET slug = split_part(email, '@', 1) WHERE slug IS NULL;

-- 6. Функция для проверки возраста ника (14 дней)
CREATE OR REPLACE FUNCTION can_change_username(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  last_change TIMESTAMPTZ;
BEGIN
  SELECT NULLIF(username_changed_at, 'epoch') INTO last_change
  FROM profiles WHERE id = user_uuid;
  RETURN last_change IS NULL OR last_change < NOW() - INTERVAL '14 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
