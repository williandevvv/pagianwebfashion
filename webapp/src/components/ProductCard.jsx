// Tarjeta de producto reutilizable
export default function ProductCard({ producto }) {
  return (
    <div className="border p-2 rounded">
      <img src={producto.imagen} alt={producto.nombre} className="mb-2" />
      <h3 className="font-semibold">{producto.nombre}</h3>
      <p className="text-sm">{producto.precio}</p>
    </div>
  )
}
