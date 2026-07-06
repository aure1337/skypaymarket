import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import UserAvatar from '../components/UserAvatar'

function ChatsPage() {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchChats() }, [])

  async function fetchChats() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // Получаем все заказы где пользователь — покупатель или продавец
    const { data: orders } = await supabase.from('orders').select('*, profiles!orders_seller_id_fkey(username, id), listings(title)').or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`).order('created_at', { ascending: false })
    if (!orders) { setLoading(false); return }

    // Формируем список чатов
    const activeChats = orders.map(order => ({
      id: order.id,
      title: order.listings?.title || 'Товар',
      partnerName: user.id === order.buyer_id ? (order.profiles?.username || 'Продавец') : 'Покупатель',
      partnerId: user.id === order.buyer_id ? order.seller_id : order.buyer_id,
      status: order.status
    }))

    setChats(activeChats)
    setLoading(false)
  }

  return (
    <div style={{ padding: '120px 0 40px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ marginBottom: '32px' }}>Чаты</h1>
        {loading ? (
          <p>Загрузка...</p>
        ) : chats.length === 0 ? (
          <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '20px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>У вас пока нет чатов</p>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: '8px' }}>Оформите заказ, чтобы начать чат с продавцом</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chats.map(chat => (
              <Link to={`/chat/${chat.id}`} key={chat.id} className="glass" style={{ padding: '16px 20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <UserAvatar userId={chat.partnerId} username={chat.partnerName} size={40} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{chat.partnerName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{chat.title}</div>
                  </div>
                </div>
                <span className={chat.status === 'completed' ? 'badge badge-green' : 'badge badge-orange'} style={{ fontSize: '0.75rem' }}>
                  {chat.status === 'completed' ? 'Выполнен' : 'В процессе'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatsPage
