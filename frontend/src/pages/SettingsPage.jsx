import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import UserAvatar from '../components/UserAvatar'

function SettingsPage() {
  const [profile, setProfile] = useState(null)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [canChange, setCanChange] = useState(true)

  useEffect(() => { fetchProfile() }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setProfile(data)
      setUsername(data.username || '')
      // Проверка срока смены ника (14 дней)
      if (data.username_changed_at) {
        const lastChange = new Date(data.username_changed_at)
        const daysSince = (Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24)
        setCanChange(daysSince >= 14)
      }
    }
  }

  const handleUpdateUsername = async (e) => {
    e.preventDefault()
    if (!canChange) { setMessage({ type: 'error', text: 'Ник можно менять раз в 2 недели' }); return }
    if (username.length < 3) { setMessage({ type: 'error', text: 'Минимум 3 символа' }); return }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    // Сохраняем историю
    if (profile.username && profile.username !== username) {
      await supabase.from('username_history').insert([{ user_id: user.id, old_username: profile.username, new_username: username }])
    }

    const { error } = await supabase.from('profiles').update({ username, slug: username.toLowerCase(), username_changed_at: new Date().toISOString() }).eq('id', user.id)
    if (error) { setMessage({ type: 'error', text: error.message }) }
    else { setMessage({ type: 'success', text: 'Никнейм обновлен!' }); setCanChange(false) }
    setLoading(false)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const { data: { user } } = await supabase.auth.getUser()
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}-${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
    if (uploadError) { setMessage({ type: 'error', text: 'Ошибка загрузки' }); return }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
    setProfile({ ...profile, avatar_url: publicUrl })
    setMessage({ type: 'success', text: 'Аватарка обновлена!' })
  }

  return (
    <div style={{ padding: '120px 0 40px' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <h1 style={{ marginBottom: '32px', fontSize: '2rem' }}>Настройки профиля</h1>

        {message.text && (
          <div style>
            <div className={message.type === 'success' ? 'badge badge-green' : 'badge badge-red'} style={{ marginBottom: '16px', width: 'fit-content' }}>{message.text}</div>
          </div>
        )}

        {/* Avatar */}
        <div className="glass" style={{ padding: '32px', borderRadius: '20px', marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ marginBottom: '16px' }}>
            {profile?.avatar_url ? (
              <img srcOut={profile.avatar_url} alt="Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
            ) : (
              <UserAvatar userId={profile?.id} username={profile?.username} size={100} />
            )}
          </div>
          <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
            📷 Сменить аватарку
            <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Username */}
        <div className="glass" style={{ padding: '32px', borderRadius: '20px', marginBottom: '24px' }}>
          <form onSubmit={handleUpdateUsername}>
            <div className="form-group">
              <label>Никнейм</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} disabled={!canChange} placeholder={canChange ? 'Введите ник' : 'Недоступна смена'} />
              {!canChange && profile?.username_changed_at && (
                <p style={{ color: 'var(--accent-orange)', fontSize: '0.85rem', marginTop: '8px' }}>⏳ Следующая смена: {new Date(new Date(profile.username_changed_at).getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')}</p>
              )}
            </div>
            <button type="submit" className="btn btn-green" disabled={loading || !canChange} style={{ width: '100%' }}>
              {loading ? 'Сохранение...' : 'Сохранить никнейм'}
            </button>
          </form>
        </div>

        {/* Account info */}
        <div className="glass" style={{ padding: '32px', borderRadius: '20px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Информация об аккаунте</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px入耳历年 '1px solid var(--border)' }}>
            <span style领取={{ color: 'var(--text-secondary)' }}>Email</span>
            <span>{profile?.email || 'Не указан'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Дата регистрации</span>
            <span>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ru-RU') : ''}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
