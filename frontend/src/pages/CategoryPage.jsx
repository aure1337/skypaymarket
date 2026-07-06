import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

function CategoryPage() {
  const { slug } = useParams()
  const [listings, setListings] = useState([])

  useEffect(() => {
    fetchCategoryListings()
  }, [slug])

  async function fetchCategoryListings() {
    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (catError) {
      console.error(catError)
      return
    }

    const { data, error } = await supabase
      .from('listings')
      .select('*, profiles(username)')
      .eq('category_id', category.id)
      .eq('status', 'active')

    if (!error) setListings(data || [])
  }

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <h1 style={{ marginBottom: '32px', color: '#fff' }}>Лоты в категории</h1>
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
      </div>
    </div>
  )
}

export default CategoryPage
