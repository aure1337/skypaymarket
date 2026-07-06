import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

function HomePage() {
  const [categories, setCategories] = useState([])
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    fetchCategories()
    fetchListings()
  }, [selectedCategory])

  async function fetchCategories() {
    const { data, error } = await supabase.from('categories').select('*')
    if (!error) setCategories(data)
  }

  async function fetchListings() {
    setLoading(true)
    let query = supabase.from('listings').select('*, profiles(username)').eq('status', 'active')
    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory)
    }
    const { data, error } = await query
    if (!error) setListings(data || [])
    setLoading(false)
  }

  const categoryColors = ['#3b82f6', '#22c55e', '#f59e0b']

  return (
    <div className="container homepage">
      <section className="hero-section">
        <h1 className="hero-title">Маркетплейс игровых ценностей<br />и онлайн-услуг</h1>
        <p className="hero-subtitle">Безопасные сделки для геймеров и не только</p>
      </section>

      <div className="categories-grid">
        {categories.map((cat, i) => (
          <Link
            to={`/category/${cat.slug}`}
            key={cat.id}
            className="category-card"
            onClick={() => setSelectedCategory(cat.id)}
            style={{ borderLeft: `4px solid ${categoryColors[i % 3]}` }}
          >
            <h3>{cat.name}</h3>
          </Link>
        ))}
      </div>

      <div className="listings-section">
        <h2 className="listings-title">Последние лоты</h2>
        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <div className="listings-grid">
            {listings.map(listing => (
              <div key={listing.id} className="listing-card">
                <h3>{listing.title}</h3>
                <p className="listing-description">{listing.description}</p>
                <div className="listing-footer">
                  <span className="listing-seller">{listing.profiles?.username || 'Anonymous'}</span>
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
