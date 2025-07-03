import { useState, useEffect } from 'react'

// Carrito con persistencia local
export default function Cart() {
  const [items, setItems] = useState(() => {
    const datos = localStorage.getItem('carrito')
    return datos ? JSON.parse(datos) : []
  })

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items))
  }, [items])

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Carrito</h2>
      <ul className="space-y-1">
        {items.map((i, idx) => (
          <li key={idx}>{i.nombre}</li>
        ))}
      </ul>
    </div>
  )
}
