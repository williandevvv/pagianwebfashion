import React from 'react';
import GaleriaProductos from './components/GaleriaProductos.jsx';
import Carrito from './components/Carrito.jsx';
import MakeupGallery from './components/MakeupGallery.jsx';

export default function App({ targetId }) {
  if (targetId === 'galeria-react-root') return <GaleriaProductos />;
  if (targetId === 'cart-react-root') return <Carrito />;
  if (targetId === 'makeup-react-root') return <MakeupGallery />;

  return (
    <div>
      <h1>Fashion Collection React</h1>
      <GaleriaProductos />
      <Carrito />
      <MakeupGallery />
    </div>
  );
}
