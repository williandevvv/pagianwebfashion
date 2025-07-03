import { Link } from 'react-router-dom'

// Tarjeta de categoría
export default function CategoryCard({ categoria }) {
  return (
    <Link to={`/productos/${categoria.slug}`} className="block p-4 border rounded text-center">
      {categoria.nombre}
    </Link>
  )
}
