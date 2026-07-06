import { Link } from 'react-router-dom'

function UserAvatar({ userId, username, size = 40, showLetter = true }) {
  const firstLetter = username ? username.charAt(0).toUpperCase() : '?'
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ]
  const colorIndex = userId ? userId.charCodeAt(0) % colors.length : 0

  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        fontSize: size > 50 ? '1.5rem' : '1rem',
        background: colors[colorIndex],
      }}
    >
      {showLetter && firstLetter}
    </div>
  )
}

export default UserAvatar
