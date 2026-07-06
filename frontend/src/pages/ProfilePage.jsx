import { useParams, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function ProfilePage() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
    fetchUserListings()
  }, [id])

  async function fetchProfile() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (!error) setProfile(data)
    setLoading(false)
  }

  async function fetchUserListings() {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', id)

    if (!error) setListings(data || [])
  }

  if (loading) return <div>Загрузка...</div>
  if (!profile) return <div>Профиль не найден.</div>

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <div style={{ background: 'var(--card)', padding: '32px', borderRadius: '12px', marginBottom: '32px' }}>
          <h1>{profile.username}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Рейтинг: {profile.rating} | Продаж: {profile.sales_count}</p>
        </div>

        <h2 style={{ marginBottom: '16px', color: '#fff' }}>Лоты пользователя</h2>
        {listings.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>У пользователя пока нет активных лотов.</p>
        ) : (
          <div className="listings-grid">
            {listings.map(listing => (
              <div key={listing.id} className="listing-card">
                <h3>{listing.title}</h3>
                <p className="listing-description">{listing.description}</p>
                <div className="listing-footer">
                  <span className="listing-price">{listing.price} ₽</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
