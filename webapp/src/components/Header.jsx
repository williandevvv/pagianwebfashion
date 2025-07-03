import { Link } from 'react-router-dom'

// Encabezado principal
export default function Header() {
  return (
    <header className="bg-pink-200 p-4 flex justify-between">
      <Link to="/" className="font-bold">Fashion Collection</Link>
      <nav className="space-x-4">
        <Link to="/productos/bisuteria">Bisutería</Link>
        <Link to="/login">Login</Link>
        <Link to="/admin">Admin</Link>
      </nav>
    </header>
  )
}
