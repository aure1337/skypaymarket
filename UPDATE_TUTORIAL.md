# Туториал по обновлению до V3

## 1. Обновите Supabase
Зайдите в **Supabase → SQL Editor** и выполните скрипт: `supabase/migration_v3.sql`

Важно: Это добавит поля `slug`, `avatar_url`, `username_changed_at` и таблицу `username_history`.

## 2. Создайте Storage Bucket
В Supabase зайдите в **Storage** и создайте новый bucket: **avatars**.
- В настройках bucket выставьте **public access**.

## 3. Git Push
```bash
cd skypaymarket
git add .
git commit -m "v3 update"
git push
```

## Что нового:
- **Профиль:** Новый дизайн без стекла, статистика продаж, @никнейм в URL
- **Чек-ап:** Фунпей-стиль, две колонки, выбор количества, инфо о продавце
- **Настройки:** Смена аватарки, смена никнейма (раз в 2 недели), история
- **SEO-ссылки:** `/profiles/danrogoy` вместо `/profile/uuid`
- **Фиксы CSS:** Убраны `composes:` (не работает в чистом CSS), добавлены ховеры

## Возможные проблемы:
- Если не работает смена ника (constraint unique violation) — значит slug уже занят, добавьте уникальную проверку или сгенерируйте случайный.
- Если не видит страницу Settings — проверьте, что роут `/settings` добавлен в `App.jsx`.
