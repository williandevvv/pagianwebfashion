// Modal de imagen para productos

document.addEventListener('DOMContentLoaded', () => {
  let modal = document.querySelector('.image-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
      <button class="image-modal-close" aria-label="Cerrar">&times;</button>
      <img src="" alt="Vista ampliada" />
    `;
    document.body.appendChild(modal);
  }

  const modalImg = modal.querySelector('img');
  const closeBtn = modal.querySelector('.image-modal-close');

  document.addEventListener('click', (e) => {
    const img = e.target.closest('.product-image img');
    if (img) {
      modalImg.src = img.src;
      modal.classList.add('active');
    }
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
});
