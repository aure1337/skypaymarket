import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Header from './components/Header'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import ListingModal from './components/ListingModal'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import CheckoutPage from './pages/CheckoutPage'
import ProfilePage from './pages/ProfilePage'
import OrdersPage from './pages/OrdersPage'
import ChatPage from './pages/ChatPage'

function App() {
  const [session, setSession] = useState(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isListingOpen, setIsListingOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => { await supabase.auth.signOut() }

  return (
    <BrowserRouter>
      <div className="app">
        <Header
          session={session}
          onLoginClick={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          onSellClick={() => setIsListingOpen(true)}
        />
        <main style={{ paddingTop: '64px' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/checkout/:id" element={<CheckoutPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/orders" element={session ? <OrdersPage /> : <HomePage />} />
            <Route path="/chat/:orderId" element={session ? <ChatPage /> : <HomePage />} />
          </Routes>
        </main>
        <Footer />
        {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
        {isListingOpen && session && <ListingModal onClose={() => setIsListingOpen(false)} userId={session.user.id} />}
      </div>
    </BrowserRouter>
  )
}

export default App
