import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function CheckoutPage() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orderPlaced, setOrderPlaced] = useState(false)

  useEffect(() => {
    fetchListing()
  }, [id])

  async function fetchListing() {
    const { data, error } = await supabase
      .from('listings')
      .select('*, profiles(username)')
      .eq('id', id)
      .single()

    if (!error) setListing(data)
    setLoading(false)
  }

  const handlePlaceOrder = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Пожалуйста, войдите в систему для оформления заказа.')
      return
    }

    const { error } = await supabase.from('orders').insert([{
      buyer_id: user.id,
      seller_id: listing.user_id,
      listing_id: listing.id,
      amount: listing.price,
      status: 'pending'
    }])

    if (error) {
      console.error(error)
      alert('Ошибка при оформлении заказа.')
      return
    }

    setOrderPlaced(true)
  }

  if (loading) return <div>Загрузка...</div>
  if (!listing) return <div>Лот не найден.</div>

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <h1 style={{ marginBottom: '32px', color: '#fff' }}>Оформление заказа</h1>
        {orderPlaced ? (
          <div style={{ background: 'var(--card)', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--accent-green)', marginBottom: '16px' }}>Заказ оформлен!</h2>
            <p style={{ color: 'var(--text-muted)' }}>Демо-оплата прошла успешно. Продавец скоро свяжется с вами.</p>
          </div>
        ) : (
          <div style={{ background: 'var(--card)', padding: '24px', borderRadius: '12px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '16px' }}>{listing.title}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{listing.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Цена: <strong style={{ color: 'var(--accent-green)', fontSize: '1.5rem' }}>{listing.price} ₽</strong></span>
              <button className="btn btn-orange" onClick={handlePlaceOrder}>Оплатить (Демо)</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutPage
