document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let cartItems = [
        { id: 1, name: "Collar de Plata", price: 29.99, quantity: 1, image: "assets/bisuteria.jpg" },
        { id: 2, name: "Reloj de Acero", price: 89.99, quantity: 1, image: "assets/acero.jpg" }
    ];

    // Elementos del DOM
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountElement = document.getElementById('cart-count');
    const cartTotalElement = document.getElementById('cart-total');
    const subtotalElement = document.getElementById('subtotal');
    const orderTotalElement = document.getElementById('order-total');
    const shippingElement = document.getElementById('shipping');

    // Inicializar carrito
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        
        cartItems.forEach(item => {
            total += item.price * item.quantity;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'flex flex-col sm:flex-row border-b pb-6 animate-fade-in';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="w-24 h-24 object-cover rounded-lg">
                <div class="sm:ml-4 mt-4 sm:mt-0 flex-grow">
                    <h3 class="font-bold">${item.name}</h3>
                    <div class="mt-2 flex items-center">
                        <button class="quantity-btn" data-action="decrease" data-id="${item.id}">−</button>
                        <span class="quantity mx-2 w-8 text-center">${item.quantity}</span>
                        <button class="quantity-btn" data-action="increase" data-id="${item.id}">+</button>
                    </div>
                </div>
                <div class="mt-4 sm:mt-0 text-right">
                    <span class="font-bold">$${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="remove-btn ml-4 text-red-500 hover:text-red-700" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            cartItemsContainer.appendChild(itemElement);
        });

        // Actualizar totales
        const shipping = 5.99;
        cartTotalElement.textContent = `$${total.toFixed(2)}`;
        subtotalElement.textContent = `$${total.toFixed(2)}`;
        orderTotalElement.textContent = `$${(total + shipping).toFixed(2)}`;
        cartCountElement.textContent = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Event listeners
    document.addEventListener('click', function(e) {
        // Manejar cambio de cantidad
        if (e.target.classList.contains('quantity-btn')) {
            const action = e.target.getAttribute('data-action');
            const id = parseInt(e.target.getAttribute('data-id'));
            const item = cartItems.find(item => item.id === id);
            
            if (action === 'increase') {
                item.quantity += 1;
            } else if (action === 'decrease' && item.quantity > 1) {
                item.quantity -= 1;
            }
            
            renderCart();
        }
        
        // Eliminar producto
        if (e.target.classList.contains('remove-btn') || e.target.closest('.remove-btn')) {
            const id = parseInt(e.target.getAttribute('data-id') || e.target.closest('.remove-btn').getAttribute('data-id'));
            cartItems = cartItems.filter(item => item.id !== id);
            renderCart();
        }
    });

    // Vaciar carrito
    document.getElementById('clear-cart').addEventListener('click', function() {
        if (confirm('¿Estás seguro de vaciar el carrito?')) {
            cartItems = [];
            renderCart();
        }
    });

    // Procesar pago
    document.getElementById('checkout-btn').addEventListener('click', function() {
        if (cartItems.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        alert('Redirigiendo a pasarela de pago...');
        // Aquí iría la lógica real de pago
    });

    // Inicializar
    renderCart();
});
