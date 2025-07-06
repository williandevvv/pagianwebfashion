// Galería de Inspiración - Lógica de Interacción

// Cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.querySelector('.modal-img');
    const modalImg = modal ? modal.querySelector('img') : null;
    const closeBtn = modal ? modal.querySelector('.modal-close') : null;
    const scrollTopBtn = document.getElementById('scroll-top');
    const darkModeBtn = document.querySelector('.button-darkmode');

    // Abrir imagen en modal
    document.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        if (item && modal && modalImg) {
            const src = item.querySelector('img').getAttribute('src');
            modalImg.setAttribute('src', src);
            modal.classList.add('active');
        }
    });

    // Cerrar modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Botón de scroll hacia arriba
    window.addEventListener('scroll', () => {
        if (!scrollTopBtn) return;
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Activar modo oscuro
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            darkModeBtn.classList.toggle('active');
        });
    }

    // Filtros de imágenes
    const filterButtons = document.querySelectorAll('.filters button');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.filter;
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterImages(category);
        });
    });

    function filterImages(category) {
        const items = document.querySelectorAll('.gallery-item');
        items.forEach(item => {
            const itemCat = item.dataset.category;
            if (category === 'all' || category === itemCat) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
});
