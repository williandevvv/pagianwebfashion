import React from 'react';
import { motion } from 'framer-motion';

export default function HeroAnimation() {
  return (
    <motion.div
      className="hero-animation"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-3xl font-bold mb-2">Explora nuestras nuevas colecciones</h2>
      <p className="text-gray-600">Descubre estilos únicos con un toque pastel.</p>
    </motion.div>
  );
}
