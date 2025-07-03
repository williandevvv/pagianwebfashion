import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Perfil from './pages/Perfil'
import AdminPanel from './pages/AdminPanel'
import Category from './pages/Category'

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/productos/:categoria" element={<Category />} />
      </Routes>
      <Footer />
    </Router>
  )
}
