// Gestión de productos - Fashion Collection
document.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Products.js cargado');

    // Variables globales
    let allProducts = [];
    let filteredProducts = [];
    let currentCategory = null;
    let currentPage = 1;
    const productsPerPage = 12;

    // Inicializar si existe un contenedor para productos
    const productsArea = document.getElementById('products-container') ||
                         document.getElementById('products-grid') ||
                         document.querySelector('.products-grid');
    if (productsArea) {
        initializeProductsPage();
    }

    async function initializeProductsPage() {
        try {
            // Obtener categoría de la URL
            const urlParams = new URLSearchParams(window.location.search);
            currentCategory = urlParams.get('category');
            
            // Cargar productos
            await loadProducts();
            
            // Configurar filtros y eventos
            setupProductFilters();
            setupProductEvents();
            
            console.log('✅ Página de productos inicializada');
        } catch (error) {
            console.error('❌ Error inicializando productos:', error);
        }
    }

    // Cargar productos desde Firebase o datos demo
    async function loadProducts() {
        try {
            // Intentar cargar desde Firebase
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                await loadProductsFromFirebase();
            } else {
                // Usar datos demo
                loadDemoProducts();
            }
            
            // Aplicar filtros iniciales
            applyFilters();
            
        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            loadDemoProducts();
        }
    }

    // Cargar productos desde Firebase
    async function loadProductsFromFirebase() {
        try {
            const db = firebase.firestore();
            let query = db.collection('products');
            
            if (currentCategory) {
                query = query.where('category', '==', currentCategory);
            }
            
            const snapshot = await query.get();
            allProducts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log(`📦 ${allProducts.length} productos cargados desde Firebase`);
            
        } catch (error) {
            console.error('❌ Error cargando desde Firebase:', error);
            throw error;
        }
    }

    // Cargar productos demo
    function loadDemoProducts() {
        const demoProducts = [
            // Bisutería
            {
                id: 'bis001',
                name: 'Collar de Perlas Clásico',
                price: 29.99,
                originalPrice: 39.99,
                category: 'bisuteria',
                subcategory: 'collares',
                image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
                images: [
                    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
                    'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400'
                ],
                description: 'Elegante collar de perlas sintéticas de alta calidad. Perfecto para ocasiones especiales.',
                rating: 4.5,
                reviews: 23,
                inStock: true,
                stock: 15,
                tags: ['elegante', 'perlas', 'clásico'],
                featured: true
            },
            {
                id: 'bis002',
                name: 'Aretes Colgantes Dorados',
                price: 19.99,
                category: 'bisuteria',
                subcategory: 'aretes',
                image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
                images: [
                    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400'
                ],
                description: 'Aretes colgantes con acabado dorado. Diseño moderno y versátil.',
                rating: 4.3,
                reviews: 18,
                inStock: true,
                stock: 8,
                tags: ['dorado', 'colgantes', 'moderno']
            },
            {
                id: 'bis003',
                name: 'Pulsera de Cadena Plateada',
                price: 24.99,
                category: 'bisuteria',
                subcategory: 'pulseras',
                image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400',
                description: 'Pulsera de cadena con acabado plateado. Ajustable y cómoda.',
                rating: 4.7,
                reviews: 31,
                inStock: true,
                stock: 12,
                tags: ['plateado', 'cadena', 'ajustable']
            },
            {
                id: 'bis004',
                name: 'Anillo de Cristal',
                price: 15.99,
                category: 'bisuteria',
                subcategory: 'anillos',
                image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
                description: 'Anillo con cristal central y detalles metálicos.',
                rating: 4.1,
                reviews: 12,
                inStock: false,
                stock: 0,
                tags: ['cristal', 'brillante', 'elegante']
            },
            // Maquillaje
            {
                id: 'maq001',
                name: 'Set de Maquillaje Profesional',
                price: 49.99,
                originalPrice: 69.99,
                category: 'maquillaje',
                subcategory: 'sets',
                image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
                description: 'Set completo de maquillaje profesional con 24 piezas.',
                rating: 4.8,
                reviews: 45,
                inStock: true,
                stock: 6,
                tags: ['profesional', 'completo', 'oferta'],
                featured: true
            },
            {
                id: 'maq002',
                name: 'Paleta de Sombras Nude',
                price: 22.99,
                category: 'maquillaje',
                subcategory: 'sombras',
                image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
                description: 'Paleta de 12 sombras en tonos nude y tierra.',
                rating: 4.6,
                reviews: 28,
                inStock: true,
                stock: 20,
                tags: ['nude', 'natural', 'versátil']
            },
            // Acero
            {
                id: 'ace001',
                name: 'Reloj de Acero Inoxidable',
                price: 89.99,
                category: 'acero',
                subcategory: 'relojes',
                image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
                description: 'Reloj elegante de acero inoxidable con movimiento de cuarzo.',
                rating: 4.9,
                reviews: 67,
                inStock: true,
                stock: 5,
                tags: ['elegante', 'resistente', 'cuarzo'],
                featured: true
            },
            {
                id: 'ace002',
                name: 'Cadena de Acero para Hombre',
                price: 34.99,
                category: 'acero',
                subcategory: 'cadenas',
                image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400',
                description: 'Cadena robusta de acero inoxidable para hombre.',
                rating: 4.4,
                reviews: 19,
                inStock: true,
                stock: 10,
                tags: ['masculino', 'robusto', 'duradero']
            },
            // Acrílico
            {
                id: 'acr001',
                name: 'Aretes Acrílicos Coloridos',
                price: 12.99,
                category: 'acrilico',
                subcategory: 'aretes',
                image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400',
                description: 'Aretes de acrílico en colores vibrantes. Ligeros y cómodos.',
                rating: 4.2,
                reviews: 15,
                inStock: true,
                stock: 25,
                tags: ['colorido', 'ligero', 'juvenil']
            },
            {
                id: 'acr002',
                name: 'Pulsera Acrílica Transparente',
                price: 18.99,
                category: 'acrilico',
                subcategory: 'pulseras',
                image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400',
                description: 'Pulsera de acrílico transparente con detalles dorados.',
                rating: 4.0,
                reviews: 8,
                inStock: true,
                stock: 18,
                tags: ['transparente', 'moderno', 'minimalista']
            }
        ];

        // Filtrar por categoría si es necesario
        if (currentCategory) {
            allProducts = demoProducts.filter(p => p.category === currentCategory);
        } else {
            allProducts = demoProducts;
        }

        console.log(`📦 ${allProducts.length} productos demo cargados`);
    }

    // Aplicar filtros
    function applyFilters() {
        filteredProducts = [...allProducts];
        
        // Aplicar filtros adicionales aquí si es necesario
        
        // Renderizar productos
        renderProducts();
        updateProductCount();
    }

    // Renderizar productos
    function renderProducts() {
        const container = document.getElementById('products-container') || 
                         document.getElementById('products-grid') ||
                         document.querySelector('.products-grid');
        
        if (!container) return;

        // Calcular productos para la página actual
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productsToShow = filteredProducts.slice(startIndex, endIndex);

        if (productsToShow.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h3>No se encontraron productos</h3>
                    <p class="text-muted">Intenta ajustar los filtros de búsqueda</p>
                </div>
            `;
            return;
        }

        container.innerHTML = productsToShow.map(product => {
            // Verificar si la oferta está activa
            const hasActiveOffer = product.offer && 
                                 product.offer.active && 
                                 new Date(product.offer.endDate) > new Date();
            
            const displayPrice = hasActiveOffer ? product.offer.offerPrice : product.price;
            const originalPrice = hasActiveOffer ? product.offer.originalPrice : product.originalPrice;
            const discount = originalPrice ? Math.round((1 - displayPrice / originalPrice) * 100) : 0;

            return `
                <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
                    <div class="card h-100 product-card" data-product-id="${product.id}">
                        <div class="position-relative">
                            <img src="${product.image}" class="card-img-top" alt="${product.name}" 
                                 style="height: 250px; object-fit: cover; cursor: pointer;"
                                 onclick="showProductModal('${product.id}')">
                            
                            ${originalPrice ? `
                                <span class="badge bg-danger position-absolute top-0 start-0 m-2">
                                    -${discount}%
                                </span>
                            ` : ''}
                            
                            ${!product.inStock ? `
                                <span class="badge bg-secondary position-absolute top-0 end-0 m-2">Agotado</span>
                            ` : product.stock <= 5 ? `
                                <span class="badge bg-warning position-absolute top-0 end-0 m-2">Últimas ${product.stock}</span>
                            ` : hasActiveOffer ? `
                                <span class="badge bg-danger position-absolute top-0 end-0 m-2">¡Oferta!</span>
                            ` : ''}
                            
                            <div class="position-absolute top-0 end-0 m-2">
                                <button class="btn btn-sm btn-light rounded-circle wishlist-btn" 
                                        data-product-id="${product.id}">
                                    <i class="far fa-heart"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="text-muted small text-capitalize">${product.category}</p>
                            
                            <div class="mb-2">
                                ${renderStars(product.rating)}
                                <small class="text-muted ms-1">(${product.reviews || 0})</small>
                            </div>
                            
                            <p class="card-text small text-muted">${product.description.substring(0, 80)}...</p>
                            
                            <div class="mt-auto">
                                <div class="d-flex align-items-center justify-content-between mb-3">
                                    <div>
                                        <span class="h5 ${hasActiveOffer ? 'text-danger' : 'text-primary'} mb-0">
                                            L.${displayPrice.toFixed(2)}
                                        </span>
                                        ${originalPrice ? `
                                            <small class="text-muted text-decoration-line-through ms-2">
                                                L.${originalPrice.toFixed(2)}
                                            </small>
                                            ${hasActiveOffer ? `
                                                <div class="small text-success">
                                                    Ahorra L.${(originalPrice - displayPrice).toFixed(2)}
                                                </div>
                                            ` : ''}
                                        ` : ''}
                                    </div>
                                </div>
                                
                                <div class="d-grid gap-2">
                                    <button class="btn btn-primary add-to-cart-btn" 
                                            data-product-id="${product.id}" 
                                            ${!product.inStock ? 'disabled' : ''}>
                                        <i class="fas fa-shopping-cart me-2"></i>
                                        ${product.inStock ? 'Agregar al Carrito' : 'Agotado'}
                                    </button>
                                    <button class="btn btn-outline-secondary btn-sm quick-view-btn" 
                                            data-product-id="${product.id}">
                                        <i class="fas fa-eye me-1"></i> Vista Rápida
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Renderizar paginación
        renderPagination();
    }

    // Renderizar estrellas
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

    // Renderizar paginación
    function renderPagination() {
        const paginationContainer = document.getElementById('pagination-container');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '<nav><ul class="pagination justify-content-center">';
        
        // Botón anterior
        paginationHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Anterior</a>
            </li>
        `;
        
        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        // Botón siguiente
        paginationHTML += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Siguiente</a>
            </li>
        `;
        
        paginationHTML += '</ul></nav>';
        paginationContainer.innerHTML = paginationHTML;
    }

    // Actualizar contador de productos
    function updateProductCount() {
        const countElement = document.getElementById('product-count');
        if (countElement) {
            countElement.textContent = `${filteredProducts.length} productos encontrados`;
        }
    }

    // Configurar filtros de productos
    function setupProductFilters() {
        // Filtro por precio
        const priceFilter = document.getElementById('price-filter');
        if (priceFilter) {
            priceFilter.addEventListener('change', applyFilters);
        }

        // Filtro por categoría
        const categoryFilters = document.querySelectorAll('.category-filter');
        categoryFilters.forEach(filter => {
            filter.addEventListener('change', applyFilters);
        });

        // Ordenamiento
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', handleSort);
        }
    }

    // Configurar eventos de productos
    function setupProductEvents() {
        // Agregar al carrito
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                const btn = e.target.closest('.add-to-cart-btn');
                const productId = btn.dataset.productId;
                addToCart(productId);
            }
        });

        // Vista rápida
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quick-view-btn')) {
                const btn = e.target.closest('.quick-view-btn');
                const productId = btn.dataset.productId;
                showProductModal(productId);
            }
        });

        // Wishlist
        document.addEventListener('click', (e) => {
            if (e.target.closest('.wishlist-btn')) {
                const btn = e.target.closest('.wishlist-btn');
                const productId = btn.dataset.productId;
                toggleWishlist(productId);
            }
        });

        // Paginación
        document.addEventListener('click', (e) => {
            if (e.target.closest('.page-link')) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page && page !== currentPage) {
                    currentPage = page;
                    renderProducts();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        });
    }

    // Manejar ordenamiento
    function handleSort(e) {
        const sortBy = e.target.value;
        
        switch (sortBy) {
            case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                // Ordenar por ID (asumiendo que IDs más altos = más nuevos)
                filteredProducts.sort((a, b) => b.id.localeCompare(a.id));
                break;
            default:
                // Orden por defecto
                break;
        }
        
        currentPage = 1;
        renderProducts();
    }

    // Agregar al carrito
    function addToCart(productId) {
        const product = allProducts.find(p => p.id === productId);
        if (!product || !product.inStock) return;

        // Usar la función global del carrito si está disponible
        if (window.fashionApp && window.fashionApp.addToCart) {
            window.fashionApp.addToCart(productId);
        } else {
            // Fallback local
            console.log('Agregando al carrito:', product.name);
            showNotification(`${product.name} agregado al carrito`, 'success');
        }
    }

    // Mostrar modal de producto
    function showProductModal(productId) {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;

        // Crear modal dinámicamente
        const modalHTML = `
            <div class="modal fade" id="productModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${product.name}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <img src="${product.image}" class="img-fluid rounded" alt="${product.name}">
                                </div>
                                <div class="col-md-6">
                                    <p class="text-muted text-capitalize">${product.category}</p>
                                    <div class="mb-3">
                                        ${renderStars(product.rating)}
                                        <small class="text-muted ms-1">(${product.reviews || 0} reseñas)</small>
                                    </div>
                                    <p>${product.description}</p>
                                    <div class="mb-3">
                                        <span class="h4 text-primary">$${product.price}</span>
                                        ${product.originalPrice ? `
                                            <small class="text-muted text-decoration-line-through ms-2">$${product.originalPrice}</small>
                                        ` : ''}
                                    </div>
                                    ${product.inStock ? `
                                        <p class="text-success"><i class="fas fa-check-circle me-1"></i> En stock (${product.stock} disponibles)</p>
                                    ` : `
                                        <p class="text-danger"><i class="fas fa-times-circle me-1"></i> Agotado</p>
                                    `}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button type="button" class="btn btn-primary add-to-cart-btn" 
                                    data-product-id="${product.id}" 
                                    ${!product.inStock ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart me-2"></i>
                                ${product.inStock ? 'Agregar al Carrito' : 'Agotado'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal existente
        const existingModal = document.getElementById('productModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Agregar nuevo modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    }

    // Toggle wishlist
    function toggleWishlist(productId) {
        const btn = document.querySelector(`[data-product-id="${productId}"].wishlist-btn`);
        const icon = btn.querySelector('i');
        
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            btn.classList.add('text-danger');
            showNotification('Agregado a favoritos', 'success');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            btn.classList.remove('text-danger');
            showNotification('Removido de favoritos', 'info');
        }
    }

    // Función para mostrar notificaciones
    function showNotification(message, type = 'success') {
        if (window.fashionApp && window.fashionApp.showNotification) {
            window.fashionApp.showNotification(message, type);
        } else if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: type,
                title: message,
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } else {
            if (typeof Swal !== 'undefined') {
                Swal.fire({ icon: type, title: message });
            }
        }
    }

    // Exponer funciones globalmente
    window.showProductModal = showProductModal;
    window.productsManager = {
        allProducts,
        filteredProducts,
        addToCart,
        showProductModal,
        toggleWishlist
    };

    console.log('✅ Products.js inicializado');
});
