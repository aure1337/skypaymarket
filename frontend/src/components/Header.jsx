import { Link } from 'react-router-dom'
import UserAvatar from './UserAvatar'

function Header({ session, onLoginClick, onLogout, onSellClick }) {
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
            <Link to="/settings" className="btn btn-ghost">Настройки</Link>
            <Link to={`/profile/${session.user.user_metadata?.username || session.user.id}`} className="btn btn-ghost" style={{ padding: '6px', borderRadius: '50%' }} title="Профиль">
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
