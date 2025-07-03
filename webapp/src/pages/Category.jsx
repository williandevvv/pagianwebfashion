import { useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'

// Página para mostrar productos por categoría
export default function Category() {
  const { categoria } = useParams()
  const productos = [] // Aquí se cargarían datos de Firestore

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Categoría: {categoria}</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {productos.map(p => (
          <ProductCard key={p.id} producto={p} />
        ))}
      </div>
    </div>
  )
}
