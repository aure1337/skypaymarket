import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import UserAvatar from '../components/UserAvatar'

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('orders')
      .select('*, profiles!orders_seller_id_fkey(username, id), listings(title)')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  return (
    <div style={{ padding: '120px 0 40px' }}>
      <div className="container">
        <h1 style={{ marginBottom: '32px' }}>Заказы</h1>
        {loading ? (
          <p>Загрузка...</p>
        ) : orders.length === 0 ? (
          <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '20px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>У вас пока нет заказов</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => (
              <div key={order.id} className="glass" style={{ padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>{order.listings?.title || 'Товар'}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {order.status === 'pending' ? '⏳ Ожидает' : '✅ Выполнен'} · {order.amount} ₽
                  </p>
                </div>
                <Link to={`/chat/${order.id}`} className="btn btn-primary">Чат</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage
