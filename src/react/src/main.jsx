import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

const target = document.getElementById('galeria-react-root')
  || document.getElementById('cart-react-root')
  || document.getElementById('root');

ReactDOM.createRoot(target).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
