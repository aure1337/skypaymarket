# FunPay Clone

Клон маркetplace FunPay для покупки/продажи игровых ценностей и услуг.

## Стек
- **Frontend:** React + Vite
- **Backend/DB:** Supabase (Auth, PostgreSQL, Row Level Security)
- **Hosting:** Vercel (Frontend) + Supabase

## Установка

### 1. Настройка Supabase
1. Создай проект на [supabase.com](https://supabase.com)
2. В SQL Editor выполни скрипт из `supabase/schema.sql`
3. Сохрани URL и Anon Key

### 2. Настройка проекта
```bash
cd frontend
cp .env.example .env.local
```
Заполни `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`

### 3. Запуск проекта
```bash
npm install
npm run dev
```

## Деплой

### Vercel
1. Создай проект на [vercel.com](https://vercel.com)
2. Импортируй GitHub репозиторий
3. Добавь переменные окружения (Supabase URL и Anon Key)
4. Готово!
