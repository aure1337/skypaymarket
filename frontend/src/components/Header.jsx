import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import UserAvatar from './UserAvatar'

function Header({ session, onLoginClick, onLogout, onSellClick }) {
  const [userSlug, setUserSlug] = useState(null)

  useEffect(() => {
    if (session) { fetchUserSlug() } else { setUserSlug(null) }
  }, [session])

  async function fetchUserSlug() {
    const { data } = await supabase.from('profiles').select('slug').eq('id', session.user.id).

single()
    if (data) setUserSlug(data.slug)
  }

  return (
    <header>
      <Link to="/" className="logo">SkyPay</Link>
      <div className="search-bar">
        <input type="text" placeholder="Поиск лотов..." />
      </div>
      <div className="header-actions">
        {session ? (
          <>
            <button className="btn btn-orange" onClick={onSellClick}>Продать</button>
            <Link to="/orders" className="btn btn-ghost">Заказы</Link>
            <Link to="/chats" className="btn btn-ghost">Чаты</Link>
            <Link to="/settings" className="btn btn-ghost">Настройки</Link>
            <Link to={userSlug ? `/profile/${userSlug}` : '/profile'} className="btn btn-ghost" style={{ padding: '6px', borderRadius: '50%' }} title="Профиль">
              <UserAvatar userId={session.user.id} username={session.user.email} size={32} />
            </Link>
            <button className="btn btn-ghost" onClick={onLogout}>Выйти</button>
          </>
        ) : (
          <button className="btn btn-green" onClick={onLoginClick}>Войти</button>
        )}
      </div>
    </header>
  )
}

export default Header
