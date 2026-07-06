import { useState } from 'react'
import { supabase } from '../supabaseClient'

function ListingModal({ onClose, userId, editListing }) {
  const isEditing = !!editListing
  const [title, setTitle] = useState(editListing?.title || '')
  const [description, setDescription] = useState(editListing?.description || '')
  const [price, setPrice] = useState(editListing?.price || '')
  const [quantity, setQuantity] = useState(editListing?.quantity || 1)
  const [category, setCategory] = useState(editListing?.category_id?.toString() || '1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        user_id: userId,
        category_id: parseInt(category),
        title,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        status: 'active'
      }

      let result
      if (isEditing) {
        result = await supabase.from('listings').update(payload).eq('id', editListing.id)
      } else {
        result = await supabase.from('listings').insert([payload])
      }

      if (result.error) throw result.error
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
        <h2 className="modal-title">{isEditing ? 'Редактировать лот' : 'Создать лот'}</h2>
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
            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows="3"></textarea>
          </div>
          <div className="form-group" style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label>Цена (₽)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" />
            </div>
            <div style={{ flex: 1 }}>
              <label>Количество</label>
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required min="1" />
            </div>
          </div>
          <button type="submit" className="btn btn-green" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Загрузка...' : (isEditing ? 'Обновить лот' : 'Создать лот')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ListingModal
