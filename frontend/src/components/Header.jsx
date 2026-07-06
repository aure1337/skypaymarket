import { Link } from 'react-router-dom'

function Header({ session, onLoginClick, onLogout, onSellClick }) {
  return (
    <header>
      <Link to="/" className="logo">FunPay Clone</Link>
      <div className="search-bar">
        <input type="text" placeholder="Поиск лотов..." />
      </div>
      <div className="header-actions">
        {session ? (
          <>
            <button className="btn btn-orange" onClick={onSellClick}>Продать</button>
            <Link to={`/profile/${session.user.id}`} className="btn">Профиль</Link>
            <button className="btn" onClick={onLogout}>Выйти</button>
          </>
        ) : (
          <button className="btn btn-green" onClick={onLoginClick}>Войти</button>
        )}
      </div>
    </header>
  )
}

export default Header
