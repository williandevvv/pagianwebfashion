// Opciones básicas para el visor 3D
window.addEventListener('DOMContentLoaded', () => {
  const viewer = document.getElementById('product-viewer');
  if (viewer) {
    // Aumentar la intensidad de la luz y activar la animación de rotación
    viewer.setAttribute('exposure', '1');
    viewer.setAttribute('shadow-intensity', '1');
  }
});
