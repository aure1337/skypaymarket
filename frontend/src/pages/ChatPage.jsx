import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

function ChatPage() {
  const { orderId } = useParams()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [canReview, setCanReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' })
  const [reviewSent, setReviewSent] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => { fetchOrder(); fetchMessages(); subscribeMessages() }, [orderId])

  async function fetchOrder() {
    const { data } = await supabase.from('orders').select('*, listings(title, user_id)').eq('id', orderId).single()
    setOrder(data)
    if (data && data.status === 'completed') setCanReview(true)
    setLoading(false)
  }

  async function fetchMessages() {
    const { data } = await supabase.from('messages').select('*').eq('order_id', orderId).order('created_at')
    setMessages(data || [])
    scrollToBottom()
  }

  function subscribeMessages() {
    const channel = supabase.channel(`chat:${orderId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${orderId}` }, payload => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }

  const handleSend = async () => {
    if (!newMessage.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('messages').insert([{
      sender_id: user.id,
      receiver_id: user.id === order.buyer_id ? order.seller_id : order.buyer_id,
      order_id: parseInt(orderId),
      content: newMessage
    }])
    setNewMessage('')
  }

  const handleComplete = async () => {
    await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId)
    setCanReview(true)
    setOrder({ ...order, status: 'completed' })
  }

  const handleSendReview = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('reviews').insert([{
      order_id: orderId,
      reviewer_id: user.id,
      seller_id: order.listings.user_id,
      listing_id: order.listing_id,
      rating: reviewForm.rating,
      text: reviewForm.text
    }])
    setReviewSent(true)
  }

  if (loading) return <div className="container" style={{ paddingTop: '120px' }}>Загрузка...</div>

  return (
    <div style={{ padding: '120px 0 40px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="chat-container">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{order?.listings?.title || 'Чат'}</h3>
            {order?.status === 'pending' && (
              <button className="btn btn-green" onClick={handleComplete}>Подтвердить получение</button>
            )}
            {order?.status === 'completed' && <span className="badge badge-green">Выполнен</span>}
          </div>

          <div ref={messagesEndRef} className="chat-messages">
            {messages.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Напишите первое сообщение</p>}
            {messages.map(msg => (
              <div key={msg.id} className={`chat-message ${msg.sender_id === order?.buyer_id ? 'sent' : 'received'}`}>
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Написать сообщение..." onKeyDown={e => e.key === 'Enter' && handleSend()} />
            <button className="btn btn-primary" onClick={handleSend}>Отправить</button>
          </div>
        </div>

        {canReview && !reviewSent && (
          <div className="glass" style={{ marginTop: '24px', padding: '24px', borderRadius: '20px' }}>
            <h3 style={{ marginBottom: '16px' }}>Оставить отзыв</h3>
            <div className="form-group">
              <label>Рейтинг</label>
              <select value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}>
                {[5, 4, 3, 2, 1].map(s => (<option key={s} value={s}>{s} звезд</option>))}
              </select>
            </div>
            <div className="form-group">
              <label>Текст отзыва</label>
              <textarea value={reviewForm.text} onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })} placeholder="Опишите ваш опыт..."></textarea>
            </div>
            <button className="btn btn-green" onClick={handleSendReview} style={{ width: '100%' }}>Отправить отзыв</button>
          </div>
        )}
        {reviewSent && <p className="glass" style={{ marginTop: '16px', padding: '20px', textAlign: 'center', borderRadius: '16px', color: 'var(--accent-green)' }}>✅ Отзыв отправлен!</p>}
      </div>
    </div>
  )
}

export default ChatPage
