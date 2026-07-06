import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import UserAvatar from '../components/UserAvatar'

function CategoryPage() {
  const { slug } = useParams()
  const [listings, setListings] = useState([])

  useEffect(() => { fetchCategoryListings() }, [slug])

  async function fetchCategoryListings() {
    const { data: category } = await supabase.from('categories').select('id').eq('slug', slug).single()
    if (!category) return
    const { data } = await supabase.from('listings').select('*, profiles(username)').eq('category_id', category.id).eq('status', 'active').gt('quantity', 0)
    setListings(data || [])
  }

  return (
    <div style={{ padding: '120px 0 40px' }}>
      <div className="container">
        <h1 style={{ marginBottom: '32px' }}>Лоты в категории</h1>
        <div className="listings-grid">
          {listings.map(listing => (
            <div key={listing.id} className="listing-card">
              <h3>{listing.title}</h3>
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
      </div>
    </div>
  )
}

export default CategoryPage
