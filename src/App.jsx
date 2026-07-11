import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomeScreen from './pages/HomeScreen.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import SplashScreen from './components/SplashScreen.jsx'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
      </Routes>
      {showSplash && <SplashScreen onFinished={() => setShowSplash(false)} />}
    </>
  )
}
