import CategoryCard from '../components/CategoryCard'

// Página principal
export default function Home() {
  const categorias = [
    { slug: 'bisuteria', nombre: 'Bisutería' },
    { slug: 'acero', nombre: 'Acero' },
  ]

  return (
    <div className="p-4 grid md:grid-cols-2 gap-4">
      {categorias.map(cat => (
        <CategoryCard key={cat.slug} categoria={cat} />
      ))}
    </div>
  )
}
