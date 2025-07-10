import React from 'react';
import { motion } from 'framer-motion';

// Galería de productos con animación de entrada
export default function GaleriaProductos() {
  const productos = [
    { id: 1, nombre: 'Producto 1', imagen: '/img/demo1.jpg' },
    { id: 2, nombre: 'Producto 2', imagen: '/img/demo2.jpg' },
    { id: 3, nombre: 'Producto 3', imagen: '/img/demo3.jpg' }
  ];

  return (
    <div className="galeria-react">
      {productos.map(item => (
        <motion.div
          key={item.id}
          className="item-react"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <img src={item.imagen} alt={item.nombre} />
          <p>{item.nombre}</p>
        </motion.div>
      ))}
    </div>
  );
}
