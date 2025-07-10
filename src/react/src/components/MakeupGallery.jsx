import React from 'react';
import { motion } from 'framer-motion';
import './MakeupGallery.css';

export default function MakeupGallery() {
  const items = [
    { id: 1, src: '/img/maquillaje.jpg', title: 'Look Glam' },
    { id: 2, src: '/img/maquillaje.png', title: 'Estilo Pastel' },
    { id: 3, src: 'https://images.unsplash.com/photo-1526040652367-ac003a0475fe?auto=format&fit=crop&w=400&q=60', title: 'Sombras Suaves' },
    { id: 4, src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37b?auto=format&fit=crop&w=400&q=60', title: 'Brillo Rosa' }
  ];

  return (
    <div className="makeup-gallery">
      {items.map(it => (
        <motion.div
          key={it.id}
          className="makeup-item"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          <img src={it.src} alt={it.title} />
          <p>{it.title}</p>
        </motion.div>
      ))}
    </div>
  );
}
