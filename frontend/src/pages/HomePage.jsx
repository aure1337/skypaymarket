import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import UserAvatar from '../components/UserAvatar'

function HomePage() {
  const [categories, setCategories] = useState([])
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCategories(); fetchListings() }, [])

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*')
    setCategories(data || [])
  }

  async function fetchListings() {
    setLoading(true)
    const { data } = await supabase
      .from('listings')
      .select('*, profiles(username)')
      .eq('status', 'active')
      .gt('quantity', 0)
      .order('created_at', { ascending: false })
    setListings(data || [])
    setLoading(false)
  }

  return (
    <div className="container homepage">
      <section className="hero-section">
        <h1 className="hero-title">Маркетплейс игровых ценностей<br />и онлайн-услуг</h1>
        <p className="hero-subtitle">Безопасные сделки для геймеров и не только</p>
      </section>

      <div className="categories-grid">
        {categories.map((cat) => (
          <Link to={`/category/${cat.slug}`} key={cat.id} className="category-card glass glass-hover">
            <h3>{cat.name}</h3>
          </Link>
        ))}
      </div>

      <div className="listings-section">
        <h2 className="listings-title">Последние лоты</h2>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Загрузка...</p>
        ) : (
          <div className="listings-grid">
            {listings.map(listing => (
              <div key={listing.id} className="listing-card">
                <div className="listing-card-header">
                  <h3>{listing.title}</h-Up>className="badge badge-green">{listing.quantity > 0 ? `В наличии: ${listing.quantity}` : 'Нет в наличии'}</span></h3>
                </div>
                <p className="listing-description">{listing.description}</p>
                <div className="listing-footer">
                  <span className="listing-seller"><UserAvatar username={listing.profiles?.username} size={24} showLetter={false} />{listing.profiles?.username || 'Anonymous'}</span>
                  <span className="listing-price">{listing.price} ₽</span>
                </div>
                <Link to={`/checkout/${listing.id}`}>
                  <button className="btn btn-green" style={{ width: '100%', marginTop: '10px' }}>Купить</button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
