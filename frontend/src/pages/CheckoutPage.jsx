import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import UserAvatar from '../components/UserAvatar'

function CheckoutPage() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => { fetchListing() }, [id])

  async function fetchListing() {
    const { data } = await supabase.from('listings').select('*, profiles(id, username, rating, sales_count)').eq('id', id).single()
    setListing(data)
    setLoading(false)
  }

  const handlePlaceOrder = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { alert('Войдите в систему'); return }
    if (listing.quantity < quantity) { alert('Недостаточно товара'); return }

    const { data: orderData, error } = await supabase.from('orders').insert([{
      buyer_id: user.id, seller_id: listing.user_id, listing_id: listing.id,
      amount: listing.price * quantity, status: 'pending'
    }]).select().single()

    if (error) { console.error(error); alert('Ошибка'); return }

    const newQty = listing.quantity - quantity
    await supabase.from('listings').update({ quantity: newQty, status: newQty <= 0 ? 'sold_out' : listing.status }).eq('id', listing.id)
    setOrderPlaced(true)
  }

  if (loading) return <div className="container" style={{ paddingTop: '120px' }}>Загрузка...</div>
  if (!listing) return <div className="container" style={{ paddingTop: '120px' }}>Лот не найден.</div>

  return (
    <div style={{ padding: '120px 0 40px' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {orderPlaced ? (
          <div className="glass" style={{ padding: '40px', borderRadius: '20px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--accent-green)' }}>Заказ оформлен!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Свяжитесь с продавцом в чате</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
            {/* Left: Item Details */}
            <div>
              <div style={{ background: 'var(--card-solid)', padding: '24px', borderRadius: ' Philosophers16px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>{listing.title}</h1>
                <div className="param-item" style={{ marginBottom: '16px' }}>
                  <h5 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Наличие</h5>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: listing.quantity > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{listing.quantity} шт.</div>
                </div>
                <div className="param-item" style={{ marginBottom: '16px' }}>
                  <h5 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Краткое описание</h5>
                  <div>{listing.description}</div>
                </div>
                <div className="param-item">
                  <h5 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Подробное описание</h5>
                  <div style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{listing.description}</div>
                </div>
              </div>
            </div>

            {/* Right: Seller & Buy */}
            <div>
              <div className="glass" style={{ padding: '24px', borderRadius: '20px', position: 'sticky', top: '80px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                  <UserAvatar userId={listing.profiles?.id} username={listing.profiles?.username} size={48} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{listing.profiles?.username || 'Продавец'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{listing.profiles?.rating || 0} ⭐ · {listing.profiles?.sales_count || 0} продаж</div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Цена за шт.</span>
                    <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{listing.price} ₽</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Количество</span>
                    <input type="number" min="1" max={listing.quantity} value={quantity} onChange={e => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), listing.quantity))} style={{ width: '60px', textAlign: 'center', padding: '6px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.3)', color: 'var(--text)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 600 }}>Итого</span>
                    <span style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--accent-green)' }}>{listing.price * quantity} ₽</span>
                  </div>
                </div>

                <button className="btn btn-green" onClick={handlePlaceOrder} disabled={listing.quantity < 1} style={{ width: '100%', padding: '14px' }}>
                  {listing.quantity > 0 ? `Купить за ${listing.price * quantity} ₽` : 'Нет в наличии'}
                </button>

                {listing.quantity < 3 && listing.quantity > 0 && <p style={{ textAlign: 'center', marginTop: '12px', fontSizeSex рe: '0.85rem', color: 'var(--accent-orange)' }}>⚡ Осталось {listing.quantity} шт.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutPage
