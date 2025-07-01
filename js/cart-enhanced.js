// Sistema de carrito mejorado con SweetAlert2
class EnhancedCart {
    constructor() {
        this.cart = this.loadCart();
        this.initializeEventListeners();
        this.updateCartDisplay();
    }

    // Cargar carrito desde localStorage
    loadCart() {
        try {
            const cartData = localStorage.getItem('fashionCart');
            return cartData ? JSON.parse(cartData) : [];
        } catch (error) {
            console.error('Error cargando carrito:', error);
            return [];
        }
    }

    // Guardar carrito en localStorage
    saveCart() {
        try {
            localStorage.setItem('fashionCart', JSON.stringify(this.cart));
            this.updateCartDisplay();
        } catch (error) {
            console.error('Error guardando carrito:', error);
        }
    }

    // Agregar producto al carrito
    addToCart(product, quantity = 1) {
        try {
            const existingItem = this.cart.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity += quantity;
                this.showNotification(
                    '¡Cantidad Actualizada!',
                    `Se agregaron ${quantity} unidades más de ${product.name}`,
                    'success'
                );
            } else {
                this.cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image || product.imageUrl,
                    category: product.category,
                    quantity: quantity
                });
                this.showNotification(
                    '¡Producto Agregado!',
                    `${product.name} se agregó al carrito`,
                    'success'
                );
            }
            
            this.saveCart();
            this.animateCartIcon();
            
        } catch (error) {
            console.error('Error agregando al carrito:', error);
            this.showNotification(
                'Error',
                'No se pudo agregar el producto al carrito',
                'error'
            );
        }
    }

    // Remover producto del carrito
    removeFromCart(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            const removedItem = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            this.saveCart();
            
            this.showNotification(
                'Producto Eliminado',
                `${removedItem.name} se eliminó del carrito`,
                'info'
            );
        }
    }

    // Actualizar cantidad de producto
    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.showNotification(
                    'Cantidad Actualizada',
                    `Cantidad de ${item.name} actualizada a ${newQuantity}`,
                    'success'
                );
            }
        }
    }

    // Vaciar carrito
    clearCart() {
        Swal.fire({
            title: '¿Vaciar Carrito?',
            text: 'Se eliminarán todos los productos del carrito',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, vaciar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d'
        }).then((result) => {
            if (result.isConfirmed) {
                this.cart = [];
                this.saveCart();
                this.showNotification(
                    'Carrito Vaciado',
                    'Todos los productos han sido eliminados',
                    'success'
                );
            }
        });
    }

    // Obtener total del carrito
    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Obtener cantidad total de items
    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Mostrar notificaciones con SweetAlert2
    showNotification(title, text, icon = 'info') {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });

        Toast.fire({
            icon: icon,
            title: title,
            text: text
        });
    }

    // Animar icono del carrito
    animateCartIcon() {
        const cartIcon = document.querySelector('.cart-icon, .fa-shopping-cart');
        if (cartIcon) {
            cartIcon.classList.add('animate__animated', 'animate__bounce');
            setTimeout(() => {
                cartIcon.classList.remove('animate__animated', 'animate__bounce');
            }, 1000);
        }
    }

    // Actualizar display del carrito
    updateCartDisplay() {
        // Actualizar contador
        const cartCounters = document.querySelectorAll('.cart-counter, .cart-count');
        const totalItems = this.getTotalItems();
        
        cartCounters.forEach(counter => {
            counter.textContent = totalItems;
            counter.style.display = totalItems > 0 ? 'inline' : 'none';
        });

        // Actualizar total si existe
        const cartTotalElements = document.querySelectorAll('.cart-total');
        const total = this.getTotal();
        
        cartTotalElements.forEach(element => {
            element.textContent = `L${total.toFixed(2)}`;
        });

        // Actualizar tabla del carrito si existe
        this.updateCartTable();
    }

    // Actualizar tabla del carrito
    updateCartTable() {
        const cartTableBody = document.querySelector('#cart-table tbody');
        if (!cartTableBody) return;

        if (this.cart.length === 0) {
            cartTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                        <p class="text-muted">Tu carrito está vacío</p>
                        <a href="index.html" class="btn btn-primary">
                            <i class="fas fa-shopping-bag me-1"></i>Continuar Comprando
                        </a>
                    </td>
                </tr>
            `;
            return;
        }

        cartTableBody.innerHTML = this.cart.map(item => `
            <tr>
                <td>
                    <img src="${item.image || 'https://via.placeholder.com/50'}" 
                         alt="${item.name}" 
                         class="img-thumbnail" 
                         style="width: 50px; height: 50px; object-fit: cover;">
                </td>
                <td>
                    <strong>${item.name}</strong>
                    <br>
                    <small class="text-muted">${item.category || ''}</small>
                </td>
                <td>L${item.price.toFixed(2)}</td>
                <td>
                    <div class="input-group" style="width: 120px;">
                        <button class="btn btn-outline-secondary btn-sm" 
                                onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" 
                               class="form-control form-control-sm text-center" 
                               value="${item.quantity}" 
                               min="1"
                               onchange="cart.updateQuantity('${item.id}', parseInt(this.value))">
                        <button class="btn btn-outline-secondary btn-sm" 
                                onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </td>
                <td>L${(item.price * item.quantity).toFixed(2)}</td>
                <td>
                    <button class="btn btn-danger btn-sm" 
                            onclick="cart.removeFromCart('${item.id}')"
                            title="Eliminar producto">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Proceder al checkout
    async checkout() {
        if (this.cart.length === 0) {
            this.showNotification(
                'Carrito Vacío',
                'Agrega productos antes de proceder al checkout',
                'warning'
            );
            return;
        }

        // Verificar si el usuario está autenticado
        const user = firebase.auth().currentUser;
        if (!user) {
            const result = await Swal.fire({
                title: 'Iniciar Sesión',
                text: 'Debes iniciar sesión para continuar con la compra',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Iniciar Sesión',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#007bff'
            });

            if (result.isConfirmed) {
                window.location.href = 'login.html';
            }
            return;
        }

        // Mostrar resumen del pedido
        const total = this.getTotal();
        const itemsCount = this.getTotalItems();

        const result = await Swal.fire({
            title: 'Confirmar Pedido',
            html: `
                <div class="text-start">
                    <h6>Resumen del Pedido:</h6>
                    <p><strong>Productos:</strong> ${itemsCount} artículos</p>
                    <p><strong>Total:</strong> L${total.toFixed(2)}</p>
                    <hr>
                    <p class="text-muted">¿Confirmas tu pedido?</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirmar Pedido',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#28a745'
        });

        if (result.isConfirmed) {
            try {
                // Crear pedido en Firebase
                const order = {
                    userId: user.uid,
                    userEmail: user.email,
                    items: this.cart,
                    total: total,
                    status: 'pendiente',
                    createdAt: new Date(),
                    shippingAddress: null // Se puede agregar después
                };

                await firebase.firestore().collection('orders').add(order);

                // Limpiar carrito
                this.cart = [];
                this.saveCart();

                // Mostrar confirmación
                Swal.fire({
                    title: '¡Pedido Confirmado!',
                    html: `
                        <div class="text-center">
                            <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                            <p>Tu pedido ha sido procesado exitosamente</p>
                            <p><strong>Total:</strong> L${total.toFixed(2)}</p>
                            <p class="text-muted">Recibirás un email de confirmación pronto</p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Continuar Comprando',
                    confirmButtonColor: '#28a745'
                }).then(() => {
                    window.location.href = 'index.html';
                });

            } catch (error) {
                console.error('Error procesando pedido:', error);
                this.showNotification(
                    'Error',
                    'No se pudo procesar el pedido. Inténtalo de nuevo.',
                    'error'
                );
            }
        }
    }

    // Inicializar event listeners
    initializeEventListeners() {
        // Escuchar cambios en el localStorage para sincronizar entre pestañas
        window.addEventListener('storage', (e) => {
            if (e.key === 'fashionCart') {
                this.cart = this.loadCart();
                this.updateCartDisplay();
            }
        });

        // Event listener para botones de agregar al carrito
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                e.preventDefault();
                const button = e.target.closest('.add-to-cart-btn');
                const productId = button.dataset.productId;
                
                if (productId && window.allProducts) {
                    const product = window.allProducts.find(p => p.id === productId);
                    if (product) {
                        this.addToCart(product);
                    }
                }
            }
        });
    }

    // Método para mostrar el carrito en un modal
    showCartModal() {
        const cartHtml = `
            <div class="cart-modal-content">
                <div class="table-responsive">
                    <table class="table" id="modal-cart-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Precio</th>
                                <th>Cantidad</th>
                                <th>Subtotal</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.cart.length === 0 ? 
                                '<tr><td colspan="5" class="text-center">Carrito vacío</td></tr>' :
                                this.cart.map(item => `
                                    <tr>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <img src="${item.image || 'https://via.placeholder.com/40'}" 
                                                     alt="${item.name}" 
                                                     class="me-2 rounded" 
                                                     style="width: 40px; height: 40px; object-fit: cover;">
                                                <span>${item.name}</span>
                                            </div>
                                        </td>
                                        <td>L${item.price.toFixed(2)}</td>
                                        <td>
                                            <input type="number" 
                                                   class="form-control form-control-sm" 
                                                   style="width: 70px;" 
                                                   value="${item.quantity}" 
                                                   min="1"
                                                   onchange="cart.updateQuantity('${item.id}', parseInt(this.value))">
                                        </td>
                                        <td>L${(item.price * item.quantity).toFixed(2)}</td>
                                        <td>
                                            <button class="btn btn-danger btn-sm" 
                                                    onclick="cart.removeFromCart('${item.id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')
                            }
                        </tbody>
                    </table>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <h5>Total: L${this.getTotal().toFixed(2)}</h5>
                    <div>
                        <button class="btn btn-secondary me-2" onclick="Swal.close()">Cerrar</button>
                        <button class="btn btn-primary" onclick="cart.checkout()">
                            <i class="fas fa-credit-card me-1"></i>Proceder al Pago
                        </button>
                    </div>
                </div>
            </div>
        `;

        Swal.fire({
            title: `Carrito de Compras (${this.getTotalItems()} artículos)`,
            html: cartHtml,
            width: '800px',
            showConfirmButton: false,
            customClass: {
                popup: 'cart-modal'
            }
        });
    }
}

// Inicializar carrito global
window.cart = new EnhancedCart();

// Función global para agregar al carrito (compatibilidad)
window.addToCart = function(productId) {
    if (window.allProducts) {
        const product = window.allProducts.find(p => p.id === productId);
        if (product) {
            window.cart.addToCart(product);
        }
    }
};

// Función para mostrar carrito
window.showCart = function() {
    window.cart.showCartModal();
};

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedCart;
}
