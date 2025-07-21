 // Aplicación principal - Fashion Collection
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 App.js cargado');

    // Variables globales
    let currentUser = null;
    let cartItems = [];
    let products = [];
    let categories = [];
    let allProducts = [];

    // Inicializar aplicación
    initializeApp();

    async function initializeApp() {
        try {
            // Cargar datos iniciales
            await loadCategories();
            loadInspirationGallery();
            
            // Configurar eventos
            setupEventListeners();
            
            // Cargar carrito desde localStorage
            loadCartFromStorage();
            
            console.log('✅ Aplicación inicializada');
        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
        }
    }

    // Cargar categorías
   async function loadCategories() {
    const categoriesContainer = document.getElementById('categories');
    if (!categoriesContainer) return;

    try {
        const categorias = [
            { id: 'bisuteria', name: 'Bisutería', image: 'img/bisuteria.png', link: 'bisuteria.html' },
            { id: 'maquillaje', name: 'Maquillaje', image: 'img/maquillaje.png', link: 'maquillaje.html' },
            { id: 'acero', name: 'Acero', image: 'img/acero.png', link: 'acero.html' },
            { id: 'acrilico', name: 'Acrílico', image: 'img/acrilico.jpeg', link: 'acrilico.html' },
            { id: 'ofertas', name: 'Ofertas', image: 'img/ofertas.jpeg', link: 'ofertas.html' },
            { id: 'novedades', name: 'Novedades', image: 'img/novedades.png', link: 'novedades.html' }
        ];

        // Contar productos reales desde Firestore
        const snapshot = await firebase.firestore().collection('products').get();
        allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Normalizar acentos para contar productos por categoría
        const normalize = str => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        categorias.forEach(cat => {
            const count = allProducts.filter(p => normalize(p.category) === normalize(cat.id)).length;
            cat.productCount = count;
        });

        categories = categorias;
        renderCategories(categorias);

    } catch (error) {
        console.error('❌ Error cargando categorías:', error);
        showNotification('Error cargando categorías', 'error');
    }
}

    // Renderizar categorías
    function renderCategories(categories) {
        const container = document.getElementById('categories');
        if (!container) return;

        container.innerHTML = categories.map(category => `
            <a href="${category.link}" class="category-card categoria-card">
                <img src="${category.image}" alt="${category.name}">
                <h3>${category.name}</h3>
                <p>${category.productCount} productos</p>
            </a>
        `).join('');
    }

    // Cargar galería de inspiración
    function loadInspirationGallery() {
        const container = document.getElementById('inspiration-gallery');
        if (!container) return;

        const images = [
            'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400',
            'https://images.unsplash.com/photo-1520975698515-8297a5b32e0c?w=400',
            'https://images.unsplash.com/photo-1555529771-35a38fb89fd2?w=400',
            'https://images.unsplash.com/photo-1562158070-44a94e776d9c?w=400'
        ];

        container.innerHTML = images.map(src => `
            <div class="col-md-6 col-lg-3">
                <img src="${src}" class="img-fluid rounded shadow-sm" alt="Inspiración">
            </div>
        `).join('');
    }

    // Renderizar estrellas de calificación
    function renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star text-warning"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star text-warning"></i>';
        }
        
        return stars;
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Búsqueda de productos
        const searchInput = document.getElementById('searchProducts');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(handleSearch, 300));
            let results = document.getElementById('search-results');
            if (!results) {
                results = document.createElement('div');
                results.id = 'search-results';
                results.className = 'list-group position-absolute w-100 mt-1 d-none';
                searchInput.parentElement.appendChild(results);
            }
        }

        // Newsletter
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', handleNewsletterSubmit);
        }

        // Agregar al carrito
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                const btn = e.target.closest('.add-to-cart-btn');
                const productId = btn.dataset.productId;
                addToCart(productId);
            }
        });

        // Carrito badge click
        const cartBadge = document.querySelector('.cart-badge');
        if (cartBadge) {
            cartBadge.parentElement.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'carrito.html';
            });
        }
    }

    // Manejar búsqueda
    function handleSearch(e) {
        const query = e.target.value.toLowerCase().trim();
        const resultsContainer = document.getElementById('search-results');

        if (!resultsContainer) return;

        if (query.length <= 2) {
            resultsContainer.classList.add('d-none');
            resultsContainer.innerHTML = '';
            return;
        }

        resultsContainer.innerHTML = '<div class="list-group-item">Buscando...</div>';
        resultsContainer.classList.remove('d-none');

        (async () => {
            try {
                let results = [];

                if (firebase && firebase.firestore) {
                    const snapshot = await firebase.firestore()
                        .collection('products')
                        .orderBy('name')
                        .startAt(query)
                        .endAt(query + '\uf8ff')
                        .limit(5)
                        .get();
                    results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                }

                if (!results.length && Array.isArray(allProducts) && allProducts.length) {
                    results = allProducts.filter(p => (p.name || '').toLowerCase().includes(query)).slice(0, 5);
                }

                if (results.length) {
                    resultsContainer.innerHTML = results.map(p => `
                        <a href="producto.html?id=${p.id}" class="list-group-item list-group-item-action d-flex align-items-center search-result-item">
                            <img src="${p.image || ''}" alt="${p.name}" style="width:40px;height:40px;object-fit:cover" class="me-2 rounded">
                            <span>${p.name}</span>
                        </a>
                    `).join('');
                } else {
                    resultsContainer.innerHTML = '<div class="list-group-item text-muted">Sin resultados</div>';
                }
            } catch (err) {
                console.error('❌ Error en búsqueda:', err);
                resultsContainer.innerHTML = '<div class="list-group-item text-danger">Error al buscar</div>';
            }
        })();
    }

    // Manejar suscripción al newsletter
    function handleNewsletterSubmit(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        
        // Simular suscripción
        showNotification('¡Gracias por suscribirte!', 'success');
        e.target.reset();
    }

    // Agregar producto al carrito
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product || !product.inStock) return;

        const existingItem = cartItems.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartItems.push({
                ...product,
                quantity: 1
            });
        }

        updateCartBadge();
        saveCartToStorage();
        showNotification(`${product.name} agregado al carrito`, 'success');
    }

    // Actualizar badge del carrito
    function updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // Guardar carrito en localStorage
    function saveCartToStorage() {
        localStorage.setItem('fashionCart', JSON.stringify(cartItems));
    }

    // Cargar carrito desde localStorage
    function loadCartFromStorage() {
        try {
            const savedCart = localStorage.getItem('fashionCart');
            if (savedCart) {
                cartItems = JSON.parse(savedCart);
                updateCartBadge();
            }
        } catch (error) {
            console.error('❌ Error cargando carrito:', error);
        }
    }

    // Función para mostrar notificaciones
    function showNotification(message, type = 'success') {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: type,
                title: type === 'success' ? '¡Éxito!' : type === 'error' ? 'Error' : 'Información',
                text: message,
                timer: 3000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } else {
            // Fallback con toast de Bootstrap
            const toastContainer = document.querySelector('.toast-container');
            const toast = document.getElementById('toast-notification');
            
            if (toast && toastContainer) {
                const toastBody = toast.querySelector('.toast-body');
                toastBody.textContent = message;
                
                // Cambiar color según tipo
                toast.className = `toast align-items-center text-white border-0 ${
                    type === 'success' ? 'bg-success' : 
                    type === 'error' ? 'bg-danger' : 
                    'bg-info'
                }`;
                
                const bsToast = new bootstrap.Toast(toast);
                bsToast.show();
            } else {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: type, title: message });
                }
            }
        }
    }

    // Función debounce para optimizar búsquedas
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Exponer funciones globalmente si es necesario
    window.fashionApp = {
        addToCart,
        cartItems,
        products,
        categories,
        showNotification
    };

    console.log('✅ App.js inicializado completamente');
});
