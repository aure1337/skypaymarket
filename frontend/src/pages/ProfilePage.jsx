import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import UserAvatar from '../components/UserAvatar'
import ListingModal from '../components/ListingModal'

function ProfilePage() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [activeListings, setActiveListings] = useState([])
  const [hiddenListings, setHiddenListings] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')
  const [editingListing, setEditingListing] = useState(null)

  useEffect(() => { fetchProfile(); fetchListings(); fetchReviews() }, [id])

  async function fetchProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
    setProfile(data)
    setLoading(false)
  }

  async function fetchListings() {
    const { data } = await supabase.from('listings').select('*').eq('user_id', id)
    if (data) {
      setActiveListings(data.filter(l => l.status === 'active'))
      setHiddenListings(data.filter(l => l.status !== 'active'))
    }
  }

  async function fetchReviews() {
    const { data } = await supabase.from('reviews').select('*, profiles(username)').eq('seller_id', id)
    setReviews(data || [])
  }

  if (loading) return <div className="container" style={{ paddingTop: '120px' }}>Загрузка...</div>
  if (!profile) return <div className="container" style={{ paddingTop: '120px' }}>Профиль не найден.</div>

  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating)

  return (
    <div style={{ padding: '120px 0 40px' }}>
      <div className="container">
        <div className="profile-header glass">
          <UserAvatar userId={profile.id} username={profile.username} size={64} />
          <div>
            <h1 style={{ marginBottom: '8px' }}>{profile.username}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Рейтинг: {profile.rating || 0} ⭐ | Продаж: {profile.sales_count || 0}</p>
          </div>
        </div>

        <div className="tabs">
          <button className={activeTab === 'active' ? 'tab active' : 'tab'} onClick={() => setActiveTab('active')}>Активные лоты ({activeListings.length})</button>
          <button className={activeTab === 'hidden' ? 'tab active' : 'tab'} onClick={() => setActiveTab('hidden')}>Скрытые лоты ({hiddenListings.length})</button>
          <button className={activeTab === 'reviews' ? 'tab active' : 'tab'} onClick={() => setActiveTab('reviews')}>Отзывы ({reviews.length})</button>
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
                </div></div>
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

        {editingListing && <ListingModal onClose={() => setEditingListing(null)} userId={id} editListing={editingListing} />}
      </div>
    </div>
  )
}

export default ProfilePage
