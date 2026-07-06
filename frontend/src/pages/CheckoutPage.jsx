import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function CheckoutPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [quantity] = useState(1)

  useEffect(() => { fetchListing() }, [id])

  async function fetchListing() {
    const { data } = await supabase.from('listings').select('*, profiles(username)').eq('id', id).single()
    setListing(data)
    setLoading(false)
  }

  const handlePlaceOrder = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { alert('Пожалуйста, войдите в систему для оформления заказа.'); return }

    if (listing.quantity < 1) { alert('Товар закончился.'); return }

    // Создаем заказ
    const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
      buyer_id: user.id, seller_id: listing.user_id, listing_id: listing.id,
      amount: listing.price, status: 'pending'
    }]).select().single()

    if (orderError) { console.error(orderError); alert('Ошибка при оформлении заказа.'); return }

    // Списываем количество
    const newQuantity = listing.quantity - 1
    const newStatus = newQuantity <= 0 ? 'sold_out' : listing.status
    await supabase.from('listings').update({ quantity: newQuantity, status: newStatus }).eq('id', listing.id)

    setOrderPlaced(true)
    setTimeout(() => navigate(`/chat/${orderData.id}`), 1500)
  }

  if (loading) return <div className="container" style={{ paddingTop: '120px' }}>Загрузка...</div>
  if (!listing) return <div className="container" style={{ paddingTop: '120px' }}>Лот не найден.</div>

  return (
    <div style={{ padding: '120px 0 40px' }}>
      <div className="container">
        {orderPlaced ? (
          <div className="glass" style={{ padding: '40px', borderRadius: '20px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--accent-green)', marginBottom: '16px' }}>Заказ оформлен!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Переход к чату с продавцом...</p>
          </div>
        ) : (
          <div className="glass" style={{ padding: '40px', borderRadius: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '16px' }}>{listing.title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{listing.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Цена за штуку</span>
                <strong style={{ color: 'var(--accent-green)', fontSize: '1.5rem' }}>{listing.price} ₽</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>В наличии</span>
                <strong style={{ fontSize: '1.2rem', color: listing.quantity > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{listing.quantity} шт.</strong>
              </div>
            </div>
            <button className="btn btn-orange" onClick={handlePlaceOrder} disabled={listing.quantity < 1} style={{ width: '100%' }}>
              {listing.quantity > 0 ? 'Оплатить (Демо)' : 'Нет в наличии'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutPage
