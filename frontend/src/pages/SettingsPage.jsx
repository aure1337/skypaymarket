import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import UserAvatar from '../components/UserAvatar'

function SettingsPage() {
  const [profile, setProfile] = useState(null)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [canChange, setCanChange] = useState(true)

  useEffect(() => { fetchProfile() }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setProfile(data)
      setUsername(data.username || '')
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

        {message && <div className={message.type === 'success' ? 'badge badge-green' : 'badge badge-red'} style={{ marginBottom: '16px', width: 'fit-content' }}>{message.text}</div>}

        <div className="glass" style={{ padding: '32px', borderRadius: '20px', marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ marginBottom: '16px' }}>
            {profile?.avatar_url ? (<img src={profile.avatar_url} alt="Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />) : (<UserAvatar userId={profile?.id} username={profile?.username} size={100} />)}
          </div>
          <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
            Change Avatar
            <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
          </label>
        </div>

        <div className="glass" style={{ padding: '32px', borderRadius: '20px', marginBottom: '24px' }}>
          <form onSubmit={handleUpdateUsername}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} disabled={!canChange} />
              {!canChange && profile?.username_changed_at && (<p style={{ color: 'var(--accent-orange)', fontSize: '0.85rem', marginTop: '8px' }}>Next change: {new Date(new Date(profile.username_changed_at).getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')}</p>)}
            </div>
            <button type="submit" className="btn btn-green" disabled={loading || !canChange} style={{ width: '100%' }}>{loading ? 'Saving...' : 'Save username'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
