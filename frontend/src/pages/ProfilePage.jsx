import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import UserAvatar from '../components/UserAvatar'
import ListingModal from '../components/ListingModal'

function ProfilePage() {
  const { slug } = useParams()
  const [profile, setProfile] = useState(null)
  const [activeListings, setActiveListings] = useState([])
  const [hiddenListings, setHiddenListings] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')
  const [editingListing, setEditingListing] = useState(null)

  useEffect(() => { fetchProfile() }, [slug])

  async function fetchProfile() {
    const { data } = await supabase.from('profiles').select('*').or(`slug.eq.${slug},id.eq.${slug}`).single()
    if (!data) { setLoading(false); return }
    setProfile(data)
    fetchListings(data.id)
    fetchReviews(data.id)
    setLoading(false)
  }

  async function fetchListings(userId) {
    const { data } = await supabase.from('listings').select('*').eq('user_id', userId)
    if (data) {
      setActiveListings(data.filter(l => l.status === 'active'))
      setHiddenListings(data.filter(l => l.status !== 'active'))
    }
  }

  async function fetchReviews(userId) {
    const { data } = await supabase.from('reviews').select('*, profiles(username)').eq('seller_id', userId)
    setReviews(data || [])
  }

  if (loading) return <div className="container" style={{ paddingTop: '120px' }}>Загрузка...</div>
  if (!profile) return <div className="container" style={{ paddingTop: '120px' }}>Профиль не найден.</div>

  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating)

  return (
    <div style={{ padding: '120px 0 40px' }}>
      <div className="container">
        <div className="profile-header">
          <UserAvatar userId={profile.id} username={profile.username} size={80} />
          <div>
            <h1 style={{ marginBottom: '8px', fontSize: '2rem', fontWeight: 800 }}>{profile.slug || profile.username}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>На сайте с {new Date(profile.created_at).toLocaleDateString('ru-RU')}</p>
            <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-green)' }}>{profile.rating || 0}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Рейтинг</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-orange)' }}>{reviews.length}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Отзывов</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-green)' }}>{profile.sales_count || 0}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Продаж</div>
              </div>
            </div>
          </div>
        </div>

        <div className="tabs" style={{ marginBottom: '24px' }}>
          <button className={activeTab === 'active' ? 'tab active' : 'tab'} onClick={() => setActiveTab('active')}>Активные ({activeListings.length})</button>
          <button className={activeTab === 'hidden' ? 'tab active' : 'tab'} onClick={() => setActiveTab('hidden')}>Скрытые ({hiddenListings.length})</button>
          <button className={activeTab === 'reviews' ? 'tab active' : 'tab'} onClick={() => setActiveTab('reviews')}>Тип ({reviews.length})</button>
        </div>

        {activeTab === 'active' && (
          <div className="listings-grid">
            {activeListings.map(listing => (
              <div key={listing.id} className="listing-card">
                <h3>{listing.title}</h3>
                <p className="listing-description">{listing.description}</p>
                <div className="listing-footer">
                  <span className="listing-price">{listing.price} ₽</span>
                  <span className="badge badge-green">{listing.quantity} шт.</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'hidden' && (
          <div className="listings-grid">
            {hiddenListings.map(listing => (
              <div key={listing.id} className="listing-card">
                <h3>{listing.title}</h3>
                <p className="listing-description">{listing.description}</p>
                <div className="listing-footer">
                  <span className="listing-price">{listing.price} ₽</span>
                  <span className="badge badge-gray">Скрыто</span>
                </div>
                <button className="btn btn-green" style={{ width: '100%', marginTop: '10px' }} onClick={() => setEditingListing(listing)}>Редактировать</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && reviews.map(review => (
          <div key={review.id} className="review-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>{review.profiles?.username || 'Пользователь'}</span>
              <span className="review-stars">{renderStars(review.rating)}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>{review.text}</p>
          </div>
        ))}

        {editingListing && <ListingModal onClose={() => setEditingListing(null)} userId={profile.id} editListing={editingListing} />}
      </div>
    </div>
  )
}

export default ProfilePage
