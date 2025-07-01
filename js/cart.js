// Gestión del carrito - Fashion Collection
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛒 Cart.js cargado');

    // Variables globales
    let cartItems = [];
    let subtotal = 0;
    let shipping = 120.00;
    let total = 0;

    // Inicializar si estamos en página de carrito (soporta rutas sin extensión)
    const cartPath = window.location.pathname.replace(/\.html$/, '');
    if (cartPath.includes('carrito')) {
        initializeCart();
    }

    async function initializeCart() {
        try {
            // Cargar items del carrito
            loadCartItems();
            
            // Configurar eventos
            setupCartEvents();
            
            console.log('✅ Carrito inicializado');
        } catch (error) {
            console.error('❌ Error inicializando carrito:', error);
            showNotification('Error al cargar el carrito', 'error');
        }
    }

    // Cargar items del carrito
    function loadCartItems() {
        try {
            // Intentar cargar desde localStorage
            const savedCart = localStorage.getItem('fashionCart');
            if (savedCart) {
                cartItems = JSON.parse(savedCart);
            }
            
            // Renderizar carrito
            renderCart();
            updateCartTotals();
            
        } catch (error) {
            console.error('❌ Error cargando items del carrito:', error);
            cartItems = [];
        }
    }

    // Renderizar carrito
    function renderCart() {
        const container = document.getElementById('cart-items');
        if (!container) return;

        if (cartItems.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <h3>Tu carrito está vacío</h3>
                    <p class="text-muted">¡Agrega algunos productos!</p>
                    <a href="index.html" class="btn btn-primary">
                        <i class="fas fa-shopping-bag me-2"></i>Ir a comprar
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = cartItems.map((item, index) => `
            <div class="card mb-3 cart-item" data-item-id="${item.id}">
                <div class="row g-0">
                    <div class="col-md-2">
                        <img src="${item.image}" class="img-fluid rounded-start" alt="${item.name}"
                             style="height: 100%; object-fit: cover;">
                    </div>
                    <div class="col-md-7">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <h5 class="card-title">${item.name}</h5>
                                <button class="btn btn-link text-danger remove-item" data-index="${index}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                            <p class="text-muted small">${item.category}</p>
                            <div class="quantity-control d-flex align-items-center">
                                <button class="btn btn-outline-secondary btn-sm quantity-btn" 
                                        data-action="decrease" data-index="${index}"
                                        ${item.quantity <= 1 ? 'disabled' : ''}>
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="mx-3 quantity-value">${item.quantity}</span>
                                <button class="btn btn-outline-secondary btn-sm quantity-btn" 
                                        data-action="increase" data-index="${index}"
                                        ${item.quantity >= item.stock ? 'disabled' : ''}>
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                        <div class="col-md-3">
                        <div class="card-body text-end">
                            <p class="h5 text-primary mb-0">L. ${formatCurrencyHonduras(item.price * item.quantity)}</p>
                            ${item.originalPrice ? `
                                <small class="text-muted text-decoration-line-through">
                                    L. ${formatCurrencyHonduras(item.originalPrice * item.quantity)}
                                </small>
                            ` : ''}
                            <p class="text-success small mt-2">
                                <i class="fas fa-check-circle me-1"></i>En stock
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Actualizar badge del carrito
        updateCartBadge();
    }

    // Configurar eventos del carrito
    function setupCartEvents() {
        // Remover item
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-item')) {
                const btn = e.target.closest('.remove-item');
                const index = parseInt(btn.dataset.index);
                removeFromCart(index);
            }
        });

        // Cambiar cantidad
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quantity-btn')) {
                const btn = e.target.closest('.quantity-btn');
                const index = parseInt(btn.dataset.index);
                const action = btn.dataset.action;
                updateQuantity(index, action);
            }
        });

        // Botón de checkout
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', handleCheckout);
        }

        // Botón de vaciar carrito
        const clearCartBtn = document.getElementById('clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', clearCart);
        }

        // Código de descuento
        const discountForm = document.getElementById('discount-form');
        if (discountForm) {
            discountForm.addEventListener('submit', (e) => {
                e.preventDefault();
                applyDiscount(e.target.querySelector('input').value);
            });
        }
    }

    // Actualizar cantidad
    function updateQuantity(index, action) {
        const item = cartItems[index];
        if (!item) return;

        if (action === 'increase' && item.quantity < item.stock) {
            item.quantity++;
        } else if (action === 'decrease' && item.quantity > 1) {
            item.quantity--;
        }

        saveCartToStorage();
        renderCart();
        updateCartTotals();
    }

    // Remover del carrito
    function removeFromCart(index) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Quieres eliminar este producto del carrito?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                cartItems.splice(index, 1);
                saveCartToStorage();
                renderCart();
                updateCartTotals();
                showNotification('Producto eliminado del carrito', 'success');
            }
        });
    }

    // Vaciar carrito
    function clearCart() {
        if (cartItems.length === 0) return;

        Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Quieres vaciar todo el carrito?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, vaciar carrito',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                cartItems = [];
                saveCartToStorage();
                renderCart();
                updateCartTotals();
                showNotification('Carrito vaciado', 'success');
            }
        });
    }

    // Aplicar descuento
    function applyDiscount(code) {
        // Demo: código WELCOME10 da 10% de descuento
        if (code.toUpperCase() === 'FASHION10') {
            const discount = subtotal * 0.1;
            total = subtotal + shipping - discount;
            updateCartTotals(discount);
            showNotification('¡Descuento aplicado!', 'success');
        } else {
            showNotification('Código de descuento inválido', 'error');
        }
    }

    // Actualizar totales del carrito con formato hondureño
    function updateCartTotals(discount = 0) {
        subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        total = subtotal + shipping - discount;

        // Actualizar UI con formato hondureño
        const subtotalElement = document.getElementById('cart-subtotal');
        const shippingElement = document.getElementById('cart-shipping');
        const discountElement = document.getElementById('cart-discount');
        const totalElement = document.getElementById('cart-total');

        if (subtotalElement) subtotalElement.textContent = `L. ${formatCurrencyHonduras(subtotal)}`;
        if (shippingElement) shippingElement.textContent = `L. ${formatCurrencyHonduras(shipping)}`;
        if (discountElement) discountElement.textContent = `-L. ${formatCurrencyHonduras(discount)}`;
        if (totalElement) totalElement.textContent = `L. ${formatCurrencyHonduras(total)}`;

        // Actualizar estado del botón de checkout
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = cartItems.length === 0;
        }
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

    // Manejar checkout - Enviar por WhatsApp
    async function handleCheckout() {
        if (cartItems.length === 0) return;

        try {
            // Verificar si el usuario está autenticado
            let userEmail = 'Cliente Anónimo';
            let userId = null;
            let userName = 'Cliente';
            
            if (typeof firebase !== 'undefined' && firebase.auth) {
                const user = firebase.auth().currentUser;
                if (user) {
                    userEmail = user.email;
                    userId = user.uid;
                    
                    // Obtener datos adicionales del usuario
                    try {
                        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
                        const userData = userDoc.data();
                        if (userData && userData.name) {
                            userName = userData.lastname ? `${userData.name} ${userData.lastname}` : userData.name;
                        }
                    } catch (error) {
                        console.log('No se pudieron obtener datos adicionales del usuario');
                    }
                }
            }

            // Proceder con el checkout
            Swal.fire({
                title: 'Procesando pedido',
                text: 'Preparando tu pedido para WhatsApp...',
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                }
            });

            // Crear pedido con formato hondureño
            const orderId = 'FC-' + Date.now();
            const order = {
                id: orderId,
                userId: userId,
                userEmail: userEmail,
                userName: userName,
                items: cartItems,
                subtotal: subtotal,
                shipping: shipping,
                total: total,
                status: 'pending',
                createdAt: firebase.firestore ? firebase.firestore.FieldValue.serverTimestamp() : new Date(),
                country: 'Honduras',
                currency: 'HNL'
            };

            // Guardar en Firestore si está disponible y usuario autenticado
            let savedOrderId = null;
            try {
                if (typeof firebase !== 'undefined' && firebase.firestore && userId) {
                    const docRef = await firebase.firestore().collection('orders').add(order);
                    savedOrderId = docRef.id;
                    console.log('✅ Pedido guardado en Firebase con ID:', savedOrderId);
                } else if (!userId) {
                    console.log('⚠️ Usuario no autenticado, pedido no guardado en Firebase');
                } else {
                    console.log('⚠️ Firebase no disponible, continuando con WhatsApp');
                }
            } catch (firebaseError) {
                console.error('❌ Error guardando en Firebase:', firebaseError);
                console.log('⚠️ Continuando con WhatsApp sin guardar en Firebase');
            }

            // Cerrar loading
            Swal.close();

            // Enviar por WhatsApp
            sendOrderToWhatsApp(order, savedOrderId);

            // Limpiar carrito
            cartItems = [];
            saveCartToStorage();
            renderCart();
            updateCartTotals();

            // Mostrar confirmación
            Swal.fire({
                icon: 'success',
                title: '¡Pedido enviado por WhatsApp!',
                html: `
                    <p>Tu pedido <strong>#${orderId.substring(0, 8)}</strong> ha sido enviado.</p>
                    <p>Se abrirá WhatsApp para completar tu pedido.</p>
                    <p><strong>Total: L. ${formatCurrencyHonduras(total)}</strong></p>
                    ${userId ? '<p class="text-success"><i class="fas fa-check"></i> Pedido guardado en tu perfil</p>' : '<p class="text-info"><i class="fas fa-info"></i> Inicia sesión para guardar tus pedidos</p>'}
                `,
                confirmButtonText: 'Entendido',
                showCancelButton: true,
                cancelButtonText: 'Seguir comprando'
            }).then((result) => {
                if (!result.isConfirmed) {
                    window.location.href = 'index.html';
                }
            });

        } catch (error) {
            console.error('❌ Error en checkout:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al procesar tu pedido. Por favor intenta de nuevo.'
            });
        }
    }

    // Enviar pedido por WhatsApp
    function sendOrderToWhatsApp(order, savedOrderId = null) {
        const phoneNumber = '50494859196'; // Número de WhatsApp de Honduras
        
        // Formatear mensaje 
        let message = `🛍️ *🛍️NUEVO PEDIDO - Fashion Collection Honduras*\n\n`;
        message += `👤 Cliente: ${order.userName}\n`;
        message += `📧 Email: ${order.userEmail}\n`;
        message += `📅 Fecha: ${formatDateHonduras(new Date())}\n`;
        message += `🆔 ID Pedido: #${order.id.substring(0, 8)}\n`;
        if (savedOrderId) {
            message += `💾 ID Sistema: ${savedOrderId}\n`;
        }
        message += `\n`;
        
        message += `📦 *PRODUCTOS SOLICITADOS:*\n`;
        order.items.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            message += `${index + 1}. ${item.name}\n`;
            message += `   💰 L. ${formatCurrencyHonduras(item.price)} x ${item.quantity} = L. ${formatCurrencyHonduras(itemTotal)}\n\n`;
        });
        
        message += `📊 *RESUMEN DEL PEDIDO:*\n`;
        message += `Subtotal: L. ${formatCurrencyHonduras(order.subtotal)}\n`;
        message += `Envío: L. ${formatCurrencyHonduras(order.shipping)}\n`;
        message += `💵 *TOTAL A PAGAR: L. ${formatCurrencyHonduras(order.total)}*\n\n`;
        
        message += `🇭🇳 *INFORMACIÓN DE ENTREGA:*\n`;
        message += `📍 Por favor confirma tu dirección completa en Honduras\n`;
        message += `💳 Método de pago preferido (Efectivo/Transferencia)\n`;
        message += `📞 Número de contacto para coordinar entrega\n\n`;
        
        message += `✅ Pedido realizado desde: ${window.location.origin}\n`;
        message += `🕒 Horario de atención: Lunes a Sábado 8:00 AM - 5:30 PM`;
        
        // Codificar mensaje para URL
        const encodedMessage = encodeURIComponent(message);
        
        // Crear URL de WhatsApp
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank');
        
        console.log('📱 Pedido enviado por WhatsApp ');
    }

    // Utilidades para formato hondureño
    function formatDateHonduras(date) {
        return new Date(date).toLocaleDateString('es-HN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatCurrencyHonduras(amount) {
        return new Intl.NumberFormat('es-HN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
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
            alert(message);
        }
    }

    // Exponer funciones globalmente
    window.cartManager = {
        cartItems,
        addToCart: (product) => {
            const existingItem = cartItems.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cartItems.push({ ...product, quantity: 1 });
            }
            saveCartToStorage();
            updateCartBadge();
            showNotification(`${product.name} agregado al carrito`, 'success');
        },
        removeFromCart,
        updateQuantity,
        clearCart,
        formatCurrencyHonduras
    };

    console.log('✅ Cart.js inicializado - Fashion Collection Honduras');
});
