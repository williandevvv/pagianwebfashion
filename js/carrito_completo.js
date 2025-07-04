document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('cartComplete') || '[]');
    let discount = 0;
    let orderNumber = parseInt(localStorage.getItem('orderNumber') || '1000');

    const cartBody = document.getElementById('cart-body');
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping-total');
    const discountEl = document.getElementById('discount');
    const totalEl = document.getElementById('total');
    const finalizeBtn = document.getElementById('finalize-btn');
    const updateBtn = document.getElementById('update-btn');
    const shippingInputs = document.querySelectorAll('input[name="shipping"]');
    const couponInput = document.getElementById('coupon');
    const couponMsg = document.getElementById('coupon-msg');

    function renderCart() {
        cartBody.innerHTML = '';
        cart.forEach((item, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${item.image}" alt="${item.name}" class="thumb"></td>
                <td>${item.name}</td>
                <td>L${item.price.toFixed(2)}</td>
                <td><input type="number" min="1" value="${item.quantity}" data-index="${idx}" class="quantity-input"></td>
                <td>L${(item.price * item.quantity).toFixed(2)}</td>
                <td class="actions"><button data-index="${idx}">Eliminar</button></td>
            `;
            cartBody.appendChild(tr);
        });
        finalizeBtn.disabled = cart.length === 0;
    }

    function getShipping() {
        const checked = document.querySelector('input[name="shipping"]:checked');
        return checked ? parseFloat(checked.value) : 0;
    }

    function calculateSubtotal() {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    function updateTotals() {
        const subtotal = calculateSubtotal();
        const shipping = getShipping();
        const total = subtotal + shipping - discount;
        subtotalEl.textContent = `L${subtotal.toFixed(2)}`;
        shippingEl.textContent = `L${shipping.toFixed(2)}`;
        discountEl.textContent = discount > 0 ? `-L${discount.toFixed(2)}` : 'L0.00';
        totalEl.textContent = `L${total.toFixed(2)}`;
        finalizeBtn.disabled = cart.length === 0;
    }

    function saveCart() {
        localStorage.setItem('cartComplete', JSON.stringify(cart));
    }

    cartBody.addEventListener('input', (e) => {
        if (e.target.classList.contains('quantity-input')) {
            const index = parseInt(e.target.dataset.index);
            const value = parseInt(e.target.value);
            if (value > 0) {
                cart[index].quantity = value;
            }
        }
    });

    cartBody.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const idx = parseInt(e.target.dataset.index);
            cart.splice(idx, 1);
            renderCart();
            updateTotals();
        }
    });

    shippingInputs.forEach(input => input.addEventListener('change', updateTotals));

    updateBtn.addEventListener('click', () => {
        saveCart();
        updateTotals();
    });

    document.getElementById('apply-coupon').addEventListener('click', () => {
        const code = couponInput.value.trim().toUpperCase();
        const role = localStorage.getItem('userRole') || 'cliente';
        const used = localStorage.getItem('couponUsed');
        if (code === 'BIENVENIDA10' && (role === 'admin' || !used)) {
            discount = calculateSubtotal() * 0.10;
            localStorage.setItem('couponUsed', 'true');
            couponMsg.textContent = 'Cupón aplicado';
        } else {
            couponMsg.textContent = 'Cupón inválido o ya usado';
            discount = 0;
        }
        updateTotals();
    });

    finalizeBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        orderNumber += 1;
        localStorage.setItem('orderNumber', orderNumber.toString());
        alert(`Gracias por tu compra. Número de pedido: #${orderNumber}`);
        cart = [];
        discount = 0;
        localStorage.removeItem('couponUsed');
        saveCart();
        renderCart();
        updateTotals();
    });

    renderCart();
    updateTotals();
});
