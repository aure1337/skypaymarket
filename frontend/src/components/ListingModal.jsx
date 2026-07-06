import { useState } from 'react'
import { supabase } from '../supabaseClient'

function ListingModal({ onClose, userId }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from('listings').insert([{
        user_id: userId,
        category_id: parseInt(category),
        title,
        description,
        price: parseFloat(price),
        status: 'active'
      }])
      if (error) throw error
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">Создать лот</h2>
        {error && <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Категория</label>
            <select value={category} onChange={e => setCategory(e.target.value)} required>
              <option value="1">CS2</option>
              <option value="2">Dota 2</option>
              <option value="3">World of Tanks</option>
              <option value="4">Steam</option>
              <option value="5">Discord</option>
              <option value="6">Spotify</option>
              <option value="7">VK</option>
              <option value="8">Игровые ценности</option>
              <option value="9">Аккаунты</option>
              <option value="10">Услуги</option>
            </select>
          </div>
          <div className="form-group">
            <label>Описание</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required></textarea>
          </div>
          <div className="form-group">
            <label>Цена (₽)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" />
          </div>
          <button type="submit" className="btn btn-green" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Создание...' : 'Создать лот'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ListingModal
