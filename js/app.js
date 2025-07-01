 // Aplicación principal - Fashion Collection
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 App.js cargado');

    // Variables globales
    let currentUser = null;
    let cartItems = [];
    let products = [];
    let categories = [];

    // Inicializar aplicación
    initializeApp();

    async function initializeApp() {
        try {
            // Cargar datos iniciales
            await loadCategories();
            await loadFeaturedProducts();
            
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
            { id: 'bisuteria', name: 'Bisutería', image: 'img/bisuteria.jpg', link: 'bisuteria.html' },
            { id: 'maquillaje', name: 'Maquillaje', image: 'img/maquillaje.jpg', link: 'maquillaje.html' },
            { id: 'acero', name: 'Acero', image: 'img/acero.jpg', link: 'acero.html' },
            { id: 'acrilico', name: 'Acrílico', image: 'img/acrilico.jpeg', link: 'acrilico' },
            { id: 'ofertas', name: 'Ofertas', image: 'img/ofertas.jpeg', link: 'ofertas.html' },
            { id: 'novedades', name: 'Novedades', image: 'img/ofertas.jpeg', link: 'novedades.html' }
        ];

        // Contar productos reales desde Firestore
        const snapshot = await firebase.firestore().collection('products').get();
        const allProducts = snapshot.docs.map(doc => doc.data());

        // Contar cuántos productos hay por categoría
        categorias.forEach(cat => {
            const count = allProducts.filter(p => (p.category || '').toLowerCase() === cat.id).length;
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
            <div class="col-md-6 col-lg-4">
                <a href="${category.link}" class="category-card d-block" style="background-image: url(${category.image})">
                    <div class="category-overlay">
                        <h3 class="h4 fw-bold mb-2">${category.name}</h3>
                        <p class="mb-0">${category.productCount} productos</p>
                    </div>
                </a>
            </div>
        `).join('');
    }

    // Cargar productos destacados
    async function loadFeaturedProducts() {
        const container = document.getElementById('featured-products');
        if (!container) return;

        try {
            // Datos demo de productos destacados
            const featuredProducts = [
                {
                    id: 'prod1',
                    name: 'Collar de Perlas Elegante',
                    price: 29.99,
                    originalPrice: 39.99,
                    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300',
                    category: 'Bisutería',
                    rating: 4.5,
                    inStock: true
                },
                {
                    id: 'prod2',
                    name: 'Aretes de Acero Inoxidable',
                    price: 19.99,
                    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300',
                    category: 'Acero',
                    rating: 4.8,
                    inStock: true
                },
                {
                    id: 'prod3',
                    name: 'Set de Maquillaje Profesional',
                    price: 49.99,
                    originalPrice: 69.99,
                    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300',
                    category: 'Maquillaje',
                    rating: 4.7,
                    inStock: true
                },
                {
                    id: 'prod4',
                    name: 'Pulsera Acrílica Colorida',
                    price: 15.99,
                    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=300',
                    category: 'Acrílico',
                    rating: 4.3,
                    inStock: false
                }
            ];

            products = featuredProducts;
            renderFeaturedProducts(featuredProducts);
            
        } catch (error) {
            console.error('❌ Error cargando productos destacados:', error);
        }
    }

    // Renderizar productos destacados
    function renderFeaturedProducts(products) {
        const container = document.getElementById('featured-products');
        if (!container) return;

        container.innerHTML = products.map(product => `
            <div class="col-md-6 col-lg-3">
                <div class="card h-100 product-card">
                    <div class="position-relative">
                        <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
                        ${product.originalPrice ? `<span class="badge bg-danger position-absolute top-0 start-0 m-2">Oferta</span>` : ''}
                        ${!product.inStock ? `<span class="badge bg-secondary position-absolute top-0 end-0 m-2">Agotado</span>` : ''}
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="text-muted small">${product.category}</p>
                        <div class="mb-2">
                            ${renderStars(product.rating)}
                            <small class="text-muted">(${product.rating})</small>
                        </div>
                        <div class="mt-auto">
                            <div class="d-flex align-items-center justify-content-between mb-3">
                                <div>
                                    <span class="h5 text-primary mb-0">$${product.price}</span>
                                    ${product.originalPrice ? `<small class="text-muted text-decoration-line-through ms-2">$${product.originalPrice}</small>` : ''}
                                </div>
                            </div>
                            <button class="btn btn-primary w-100 add-to-cart-btn" 
                                    data-product-id="${product.id}" 
                                    ${!product.inStock ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart me-2"></i>
                                ${product.inStock ? 'Agregar al Carrito' : 'Agotado'}
                            </button>
                        </div>
                    </div>
                </div>
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
        if (query.length > 2) {
            // Simular búsqueda
            console.log('🔍 Buscando:', query);
            showNotification(`Buscando "${query}"...`, 'info');
        }
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
                alert(message);
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
