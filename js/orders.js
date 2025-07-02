// Gestión de pedidos - Fashion Collection
document.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Orders.js cargado');

    // Variables globales
    let orders = [];
    let currentUser = null;

    // Inicializar si existe un contenedor de pedidos
    const ordersContainer = document.getElementById('orders-container');
    if (ordersContainer) {
        initializeOrders();
    }

    async function initializeOrders() {
        try {
            // Verificar autenticación
            await checkAuth();
            
            // Cargar pedidos
            await loadOrders();
            
            // Configurar eventos
            setupOrderEvents();
            
            console.log('✅ Sistema de pedidos inicializado');
        } catch (error) {
            console.error('❌ Error inicializando pedidos:', error);
            handleAuthError();
        }
    }

    // Verificar autenticación
    async function checkAuth() {
        return new Promise((resolve, reject) => {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    currentUser = user;
                    resolve(user);
                } else {
                    reject(new Error('Usuario no autenticado'));
                }
            });
        });
    }

    // Cargar pedidos
    async function loadOrders() {
        try {
            if (!currentUser) throw new Error('Usuario no autenticado');

            // Intentar cargar desde Firebase
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const snapshot = await firebase.firestore()
                    .collection('orders')
                    .where('userId', '==', currentUser.uid)
                    .orderBy('createdAt', 'desc')
                    .get();

                orders = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate() || new Date()
                }));
            } else {
                // Cargar datos demo
                loadDemoOrders();
            }

            renderOrders();
            
        } catch (error) {
            console.error('❌ Error cargando pedidos:', error);
            showNotification('Error al cargar los pedidos', 'error');
            loadDemoOrders();
        }
    }

    // Cargar pedidos demo
    function loadDemoOrders() {
        orders = [
            {
                id: 'ORD001',
                userId: currentUser?.uid,
                items: [
                    {
                        id: 'prod1',
                        name: 'Collar de Perlas',
                        price: 29.99,
                        quantity: 1,
                        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300'
                    }
                ],
                subtotal: 29.99,
                shipping: 5.99,
                total: 35.98,
                status: 'delivered',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 días atrás
            },
            {
                id: 'ORD002',
                userId: currentUser?.uid,
                items: [
                    {
                        id: 'prod2',
                        name: 'Aretes de Acero',
                        price: 19.99,
                        quantity: 2,
                        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300'
                    }
                ],
                subtotal: 39.98,
                shipping: 5.99,
                total: 45.97,
                status: 'processing',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 días atrás
            }
        ];
    }

    // Renderizar pedidos
    function renderOrders() {
        const container = document.getElementById('orders-container');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                    <h3>No tienes pedidos</h3>
                    <p class="text-muted">¡Realiza tu primera compra!</p>
                    <a href="index.html" class="btn btn-primary">
                        <i class="fas fa-shopping-bag me-2"></i>Ir a comprar
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="card mb-4 order-card" data-order-id="${order.id}">
                <div class="card-header bg-light">
                    <div class="row align-items-center">
                        <div class="col">
                            <span class="text-muted">#${order.id}</span>
                            <small class="ms-2 text-muted">
                                ${new Date(order.createdAt).toLocaleDateString()}
                            </small>
                        </div>
                        <div class="col-auto">
                            ${renderOrderStatus(order.status)}
                        </div>
                    </div>
                </div>
                
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            ${order.items.map(item => `
                                <div class="d-flex mb-3">
                                    <img src="${item.image}" alt="${item.name}" 
                                         class="rounded" style="width: 64px; height: 64px; object-fit: cover;">
                                    <div class="ms-3">
                                        <h6 class="mb-1">${item.name}</h6>
                                        <p class="mb-1 text-muted">
                                            Cantidad: ${item.quantity} × $${item.price}
                                        </p>
                                        <p class="mb-0 text-primary">
                                            $${(item.quantity * item.price).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="col-md-4">
                            <div class="border-start ps-4">
                                <p class="mb-1">
                                    Subtotal: <span class="float-end">$${order.subtotal.toFixed(2)}</span>
                                </p>
                                <p class="mb-1">
                                    Envío: <span class="float-end">$${order.shipping.toFixed(2)}</span>
                                </p>
                                <hr>
                                <p class="h5 mb-0">
                                    Total: <span class="float-end">$${order.total.toFixed(2)}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card-footer bg-light">
                    <div class="row align-items-center">
                        <div class="col">
                            <button class="btn btn-sm btn-outline-primary view-details-btn" 
                                    data-order-id="${order.id}">
                                <i class="fas fa-eye me-1"></i> Ver detalles
                            </button>
                            ${order.status === 'delivered' ? `
                                <button class="btn btn-sm btn-outline-success ms-2 review-btn"
                                        data-order-id="${order.id}">
                                    <i class="fas fa-star me-1"></i> Dejar reseña
                                </button>
                            ` : ''}
                        </div>
                        <div class="col-auto">
                            ${order.status === 'processing' ? `
                                <button class="btn btn-sm btn-outline-danger cancel-btn"
                                        data-order-id="${order.id}">
                                    <i class="fas fa-times me-1"></i> Cancelar pedido
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Renderizar estado del pedido
    function renderOrderStatus(status) {
        const statusConfig = {
            'pending': {
                color: 'warning',
                icon: 'clock',
                text: 'Pendiente'
            },
            'processing': {
                color: 'info',
                icon: 'cog',
                text: 'Procesando'
            },
            'shipped': {
                color: 'primary',
                icon: 'truck',
                text: 'Enviado'
            },
            'delivered': {
                color: 'success',
                icon: 'check-circle',
                text: 'Entregado'
            },
            'cancelled': {
                color: 'danger',
                icon: 'times-circle',
                text: 'Cancelado'
            }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return `
            <span class="badge bg-${config.color}-subtle text-${config.color} px-3 py-2">
                <i class="fas fa-${config.icon} me-1"></i> ${config.text}
            </span>
        `;
    }

    // Configurar eventos
    function setupOrderEvents() {
        // Ver detalles
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-details-btn')) {
                const btn = e.target.closest('.view-details-btn');
                const orderId = btn.dataset.orderId;
                showOrderDetails(orderId);
            }
        });

        // Cancelar pedido
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cancel-btn')) {
                const btn = e.target.closest('.cancel-btn');
                const orderId = btn.dataset.orderId;
                cancelOrder(orderId);
            }
        });

        // Dejar reseña
        document.addEventListener('click', (e) => {
            if (e.target.closest('.review-btn')) {
                const btn = e.target.closest('.review-btn');
                const orderId = btn.dataset.orderId;
                showReviewModal(orderId);
            }
        });
    }

    // Mostrar detalles del pedido
    function showOrderDetails(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        Swal.fire({
            title: `Pedido #${order.id}`,
            html: `
                <div class="text-start">
                    <p class="mb-2">
                        <strong>Fecha:</strong> 
                        ${new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p class="mb-2">
                        <strong>Estado:</strong> 
                        ${renderOrderStatus(order.status)}
                    </p>
                    <hr>
                    <h6>Productos:</h6>
                    ${order.items.map(item => `
                        <div class="d-flex mb-2">
                            <img src="${item.image}" alt="${item.name}" 
                                 class="rounded" style="width: 48px; height: 48px; object-fit: cover;">
                            <div class="ms-2">
                                <p class="mb-0">${item.name}</p>
                                <small class="text-muted">
                                    ${item.quantity} × $${item.price}
                                </small>
                            </div>
                        </div>
                    `).join('')}
                    <hr>
                    <p class="mb-1">
                        Subtotal: <span class="float-end">$${order.subtotal.toFixed(2)}</span>
                    </p>
                    <p class="mb-1">
                        Envío: <span class="float-end">$${order.shipping.toFixed(2)}</span>
                    </p>
                    <p class="h6 mb-0">
                        Total: <span class="float-end">$${order.total.toFixed(2)}</span>
                    </p>
                </div>
            `,
            width: '32rem',
            showCloseButton: true,
            showConfirmButton: false
        });
    }

    // Cancelar pedido
    async function cancelOrder(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order || order.status !== 'processing') return;

        try {
            const result = await Swal.fire({
                title: '¿Cancelar pedido?',
                text: 'Esta acción no se puede deshacer',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, cancelar pedido',
                cancelButtonText: 'No, mantener pedido'
            });

            if (result.isConfirmed) {
                // Actualizar en Firebase
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    await firebase.firestore()
                        .collection('orders')
                        .doc(orderId)
                        .update({
                            status: 'cancelled',
                            cancelledAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                }

                // Actualizar localmente
                order.status = 'cancelled';
                renderOrders();
                
                showNotification('Pedido cancelado exitosamente', 'success');
            }
        } catch (error) {
            console.error('❌ Error cancelando pedido:', error);
            showNotification('Error al cancelar el pedido', 'error');
        }
    }

    // Mostrar modal de reseña
    function showReviewModal(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        Swal.fire({
            title: 'Dejar reseña',
            html: `
                <div class="text-start">
                    <div class="mb-3">
                        <label class="form-label">Calificación</label>
                        <div class="rating">
                            <i class="far fa-star" data-rating="1"></i>
                            <i class="far fa-star" data-rating="2"></i>
                            <i class="far fa-star" data-rating="3"></i>
                            <i class="far fa-star" data-rating="4"></i>
                            <i class="far fa-star" data-rating="5"></i>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Comentario</label>
                        <textarea class="form-control" id="review-comment" rows="3"></textarea>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Enviar reseña',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const rating = document.querySelectorAll('.fas.fa-star').length;
                const comment = document.getElementById('review-comment').value;
                
                if (!rating) {
                    Swal.showValidationMessage('Por favor selecciona una calificación');
                    return false;
                }
                
                return { rating, comment };
            },
            didOpen: () => {
                // Configurar interactividad de estrellas
                const stars = document.querySelectorAll('.rating i');
                stars.forEach(star => {
                    star.addEventListener('mouseover', function() {
                        const rating = this.dataset.rating;
                        stars.forEach(s => {
                            if (s.dataset.rating <= rating) {
                                s.classList.remove('far');
                                s.classList.add('fas');
                            } else {
                                s.classList.remove('fas');
                                s.classList.add('far');
                            }
                        });
                    });
                    
                    star.addEventListener('click', function() {
                        const rating = this.dataset.rating;
                        stars.forEach(s => {
                            if (s.dataset.rating <= rating) {
                                s.classList.remove('far');
                                s.classList.add('fas');
                            } else {
                                s.classList.remove('fas');
                                s.classList.add('far');
                            }
                        });
                    });
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                submitReview(orderId, result.value);
            }
        });
    }

    // Enviar reseña
    async function submitReview(orderId, review) {
        try {
            // Guardar en Firebase
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                await firebase.firestore().collection('reviews').add({
                    orderId,
                    userId: currentUser.uid,
                    rating: review.rating,
                    comment: review.comment,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            showNotification('¡Gracias por tu reseña!', 'success');
            
        } catch (error) {
            console.error('❌ Error enviando reseña:', error);
            showNotification('Error al enviar la reseña', 'error');
        }
    }

    // Manejar error de autenticación
    function handleAuthError() {
        const container = document.getElementById('orders-container');
        if (!container) return;

        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-lock fa-3x text-muted mb-3"></i>
                <h3>Acceso restringido</h3>
                <p class="text-muted">Debes iniciar sesión para ver tus pedidos</p>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#loginModal">
                    <i class="fas fa-sign-in-alt me-2"></i>Iniciar sesión
                </button>
            </div>
        `;
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
    window.ordersManager = {
        orders,
        showOrderDetails,
        cancelOrder
    };

    console.log('✅ Orders.js inicializado');
});
