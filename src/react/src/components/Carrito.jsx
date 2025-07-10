import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Interfaz simple de carrito con animaciones
export default function Carrito() {
  const [items, setItems] = useState([]);

  function agregar() {
    const id = items.length + 1;
    setItems([...items, { id, nombre: `Item ${id}` }]);
  }

  function quitar(id) {
    setItems(items.filter(it => it.id !== id));
  }

  return (
    <div className="carrito-react">
      <button onClick={agregar}>Añadir producto</button>
      <AnimatePresence>
        {items.map(it => (
          <motion.div
            key={it.id}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {it.nombre}
            <button onClick={() => quitar(it.id)}>❌</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
