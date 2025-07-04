// Gestión del perfil de usuario - Fashion Collection Honduras
document.addEventListener('DOMContentLoaded', () => {
    console.log('👤 Profile.js cargado - Fashion Collection HN');

    // Referencias a elementos del DOM
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const profileName = document.getElementById('profile-name');
    const profileLastname = document.getElementById('profile-lastname');
    const profileEmail = document.getElementById('profile-email-input');
    const profilePhone = document.getElementById('profile-phone');
    const profileBirthdate = document.getElementById('profile-birthdate');
    const profileGender = document.getElementById('profile-gender');
    const profileDisplayName = document.getElementById('profile-display-name');
    const profileEmailDisplay = document.getElementById('profile-email');
    const ordersContainer = document.getElementById('orders-container');
    const addressesContainer = document.getElementById('addresses-container');
    const addressForm = document.getElementById('address-form');
    const addressLine = document.getElementById('address-line');
    const addressCity = document.getElementById('address-city');
    const addressState = document.getElementById('address-state');
    const addressZip = document.getElementById('address-zip');
    const navbarUsername = document.getElementById('navbar-username');

    let currentUser = null;
    let ordersUnsubscribe = null;

    // Inicializar perfil
    async function initializeProfile() {
        try {
            await checkAuth();
            await loadUserProfile();
            await loadUserOrders();
            await loadUserAddresses();
            setupEventListeners();
            console.log('✅ Perfil inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando perfil:', error);
            handleAuthError();
        }
    }

    // Verificar autenticación
    async function checkAuth() {
        return new Promise((resolve, reject) => {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    currentUser = user;
                    console.log('👤 Usuario autenticado:', user.email);
                    resolve(user);
                } else {
                    console.log('❌ Usuario no autenticado, redirigiendo...');
                    reject(new Error('Usuario no autenticado'));
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                }
            });
        });
    }

    // Cargar perfil del usuario
    async function loadUserProfile() {
        try {
            // Crear documento de usuario si no existe
            const userRef = firebase.firestore().collection('users').doc(currentUser.uid);
            const userDoc = await userRef.get();

            let userData = {};
            
            if (!userDoc.exists) {
                // Crear perfil inicial
                userData = {
                    email: currentUser.email,
                    name: '',
                    lastname: '',
                    phone: '',
                    birthdate: '',
                    gender: '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                await userRef.set(userData);
                console.log('✅ Perfil de usuario creado');
            } else {
                userData = userDoc.data();
            }

            // Actualizar campos del formulario
            if (profileName) profileName.value = userData.name || '';
            if (profileLastname) profileLastname.value = userData.lastname || '';
            if (profileEmail) profileEmail.value = currentUser.email;
            if (profilePhone) profilePhone.value = userData.phone || '';
            if (profileBirthdate) profileBirthdate.value = userData.birthdate || '';
            if (profileGender) profileGender.value = userData.gender || '';

            // Actualizar nombre mostrado
            const displayName = userData.name && userData.lastname 
                ? `${userData.name} ${userData.lastname}` 
                : userData.name || currentUser.email.split('@')[0];
            
            if (profileDisplayName) profileDisplayName.textContent = displayName;
            if (profileEmailDisplay) profileEmailDisplay.textContent = currentUser.email;
            if (navbarUsername) navbarUsername.textContent = displayName;

            console.log('✅ Perfil cargado correctamente');

        } catch (error) {
            console.error('❌ Error cargando perfil:', error);
            showNotification('Error al cargar el perfil', 'error');
        }
    }

    // Cargar pedidos del usuario
    async function loadUserOrders() {
        try {
            console.log('📦 Cargando pedidos para usuario:', currentUser.uid);

            // Detener listener previo si existe
            if (ordersUnsubscribe) {
                ordersUnsubscribe();
            }

            ordersUnsubscribe = firebase.firestore()
                .collection('orders')
                .where('userId', '==', currentUser.uid)
                .orderBy('createdAt', 'desc')
                .onSnapshot(snapshot => {
                    const orders = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            createdAt: data.createdAt?.toDate() || new Date()
                        };
                    });

                    console.log(`📦 ${orders.length} pedidos actualizados`);
                    renderOrders(orders);
                }, error => {
                    console.error('❌ Error recibiendo pedidos:', error);
                    renderOrders([]);
                });

        } catch (error) {
            console.error('❌ Error cargando pedidos:', error);
            renderOrders([]);
        }
    }

    // Renderizar pedidos
function renderOrders(orders) {
        if (!ordersContainer) return;

        if (orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                    <h3>No tienes pedidos aún</h3>
                    <p class="text-muted">¡Realiza tu primera compra en Fashion Collection!</p>
                    <a href="index.html" class="btn btn-primary">
                        <i class="fas fa-shopping-bag me-2"></i>Ir a comprar
                    </a>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = orders.map(order => `
            <div class="col-md-4">
                <div class="order-card">
                    <h5 class="mb-3">Pedido #${order.id.substring(0, 8)}</h5>
                    <p><strong>Fecha:</strong> ${formatDateHonduras(order.createdAt)}</p>
                    <p><strong>Estado:</strong> <span class="status-badge bg-${getStatusColor(order.status)} text-white">${getStatusText(order.status)}</span></p>
                    <p><strong>Total:</strong> L. ${formatCurrencyHonduras(order.total)}</p>
                    <button class="btn btn-primary view-order-details" data-order-id="${order.id}">
                        <i class="fas fa-eye me-1"></i>Ver Detalles
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Cargar direcciones del usuario
    async function loadUserAddresses() {
        try {
            const snapshot = await firebase.firestore()
                .collection('users').doc(currentUser.uid)
                .collection('addresses').orderBy('createdAt', 'desc').get();

            const addresses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderAddresses(addresses);
        } catch (error) {
            console.error('❌ Error cargando direcciones:', error);
            renderAddresses([]);
        }
    }

    // Renderizar direcciones
    function renderAddresses(addresses) {
        if (!addressesContainer) return;

        if (addresses.length === 0) {
            addressesContainer.innerHTML = `
                <div class="col-12 text-center text-muted">Sin direcciones registradas</div>
            `;
            return;
        }

        addressesContainer.innerHTML = addresses.map(addr => `
            <div class="col-md-6">
                <div class="border rounded p-3 position-relative">
                    <p class="mb-1">${addr.line}</p>
                    <p class="mb-1">${addr.city}, ${addr.state}</p>
                    ${addr.zip ? `<p class="mb-1">CP: ${addr.zip}</p>` : ''}
                    <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 delete-address" data-id="${addr.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    async function handleAddAddress(e) {
        e.preventDefault();
        try {
            const address = {
                line: addressLine.value.trim(),
                city: addressCity.value.trim(),
                state: addressState.value.trim(),
                zip: addressZip.value.trim(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await firebase.firestore()
                .collection('users').doc(currentUser.uid)
                .collection('addresses').add(address);

            addressForm.reset();
            showNotification('Dirección agregada', 'success');
            loadUserAddresses();
        } catch (error) {
            console.error('❌ Error agregando dirección:', error);
            showNotification('Error al guardar la dirección', 'error');
        }
    }

    async function handleDeleteAddress(id) {
        try {
            await firebase.firestore()
                .collection('users').doc(currentUser.uid)
                .collection('addresses').doc(id).delete();

            showNotification('Dirección eliminada', 'success');
            loadUserAddresses();
        } catch (error) {
            console.error('❌ Error eliminando dirección:', error);
            showNotification('Error al eliminar la dirección', 'error');
        }
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Formulario de perfil
        if (profileForm) {
            profileForm.addEventListener('submit', handleProfileUpdate);
        }

        // Formulario de contraseña
        if (passwordForm) {
            passwordForm.addEventListener('submit', handlePasswordChange);
        }

        // Botón eliminar cuenta
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', handleDeleteAccount);
        }

        // Event delegation para detalles de pedidos
        if (ordersContainer) {
            ordersContainer.addEventListener('click', (e) => {
                const detailsBtn = e.target.closest('.view-order-details');
                if (detailsBtn) {
                    const orderId = detailsBtn.dataset.orderId;
                    showOrderDetails(orderId);
                }
            });
        }

        // Formulario de direcciones
        if (addressForm) {
            addressForm.addEventListener('submit', handleAddAddress);
        }

        if (addressesContainer) {
            addressesContainer.addEventListener('click', (e) => {
                const delBtn = e.target.closest('.delete-address');
                if (delBtn) {
                    handleDeleteAddress(delBtn.dataset.id);
                }
            });
        }
    }

    // Manejar actualización del perfil
    async function handleProfileUpdate(e) {
        e.preventDefault();

        try {
            const userData = {
                name: profileName.value.trim(),
                lastname: profileLastname.value.trim(),
                phone: profilePhone.value.trim(),
                birthdate: profileBirthdate.value,
                gender: profileGender.value,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Validaciones
            if (!userData.name) {
                showNotification('El nombre es requerido', 'error');
                return;
            }

            if (userData.phone && !validateHonduranPhone(userData.phone)) {
                showNotification('Formato de teléfono hondureño inválido (ej: 9999-9999)', 'error');
                return;
            }

            await firebase.firestore()
                .collection('users')
                .doc(currentUser.uid)
                .update(userData);

            showNotification('¡Perfil actualizado exitosamente!', 'success');
            
            // Actualizar nombre mostrado
            const displayName = `${userData.name} ${userData.lastname}`.trim();
            if (profileDisplayName) profileDisplayName.textContent = displayName;
            if (navbarUsername) navbarUsername.textContent = displayName;

        } catch (error) {
            console.error('❌ Error actualizando perfil:', error);
            showNotification('Error al actualizar el perfil', 'error');
        }
    }

    // Manejar cambio de contraseña
    async function handlePasswordChange(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validaciones
        if (newPassword !== confirmPassword) {
            showNotification('Las contraseñas nuevas no coinciden', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showNotification('La nueva contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        try {
            // Re-autenticar usuario
            const credential = firebase.auth.EmailAuthProvider.credential(
                currentUser.email,
                currentPassword
            );
            
            await currentUser.reauthenticateWithCredential(credential);
            
            // Cambiar contraseña
            await currentUser.updatePassword(newPassword);
            
            showNotification('¡Contraseña actualizada exitosamente!', 'success');
            
            // Limpiar formulario
            passwordForm.reset();

        } catch (error) {
            console.error('❌ Error cambiando contraseña:', error);
            let message = 'Error al cambiar la contraseña';
            
            if (error.code === 'auth/wrong-password') {
                message = 'La contraseña actual es incorrecta';
            } else if (error.code === 'auth/weak-password') {
                message = 'La nueva contraseña es muy débil';
            }
            
            showNotification(message, 'error');
        }
    }

    // Manejar eliminación de cuenta
    async function handleDeleteAccount() {
        try {
            const result = await Swal.fire({
                title: '⚠️ ¿Eliminar cuenta?',
                html: `
                    <p>Esta acción es <strong>permanente</strong> y no se puede deshacer.</p>
                    <p>Se eliminarán:</p>
                    <ul class="text-start">
                        <li>Tu perfil personal</li>
                        <li>Historial de pedidos</li>
                        <li>Toda la información asociada</li>
                    </ul>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, eliminar mi cuenta',
                cancelButtonText: 'Cancelar',
                reverseButtons: true
            });

            if (result.isConfirmed) {
                // Solicitar contraseña para confirmar
                const { value: password } = await Swal.fire({
                    title: 'Confirmar eliminación',
                    input: 'password',
                    inputLabel: 'Ingresa tu contraseña para confirmar',
                    inputPlaceholder: 'Contraseña actual',
                    showCancelButton: true,
                    confirmButtonText: 'Eliminar cuenta',
                    cancelButtonText: 'Cancelar'
                });

                if (password) {
                    // Re-autenticar y eliminar
                    const credential = firebase.auth.EmailAuthProvider.credential(
                        currentUser.email,
                        password
                    );
                    
                    await currentUser.reauthenticateWithCredential(credential);
                    
                    // Eliminar datos del usuario
                    await firebase.firestore().collection('users').doc(currentUser.uid).delete();
                    
                    // Eliminar cuenta
                    await currentUser.delete();
                    
                    Swal.fire({
                        title: '¡Cuenta eliminada!',
                        text: 'Tu cuenta ha sido eliminada exitosamente.',
                        icon: 'success',
                        confirmButtonText: 'Entendido'
                    }).then(() => {
                        window.location.href = 'index.html';
                    });
                }
            }

        } catch (error) {
            console.error('❌ Error eliminando cuenta:', error);
            let message = 'Error al eliminar la cuenta';
            
            if (error.code === 'auth/wrong-password') {
                message = 'Contraseña incorrecta';
            }
            
            showNotification(message, 'error');
        }
    }

    // Mostrar detalles del pedido
    async function showOrderDetails(orderId) {
        try {
            const orderDoc = await firebase.firestore()
                .collection('orders')
                .doc(orderId)
                .get();

            if (!orderDoc.exists) {
                showNotification('Pedido no encontrado', 'error');
                return;
            }

            const order = { id: orderDoc.id, ...orderDoc.data() };

            Swal.fire({
                title: `📦 Pedido #${order.id.substring(0, 8)}`,
                html: `
                    <div class="text-start">
                        <div class="mb-3">
                            <p><strong>📅 Fecha:</strong> ${formatDateHonduras(order.createdAt.toDate())}</p>
                            <p><strong>📊 Estado:</strong> <span class="badge bg-${getStatusColor(order.status)}">${getStatusText(order.status)}</span></p>
                        </div>
                        <hr>
                        <h6>🛍️ Productos:</h6>
                        <div class="mb-3">
                            ${order.items.map(item => `
                                <div class="d-flex align-items-center mb-2 p-2 border rounded">
                                    <img src="${item.image}" alt="${item.name}" 
                                         style="width: 50px; height: 50px; object-fit: cover;" 
                                         class="me-3 rounded">
                                    <div class="flex-grow-1">
                                        <p class="mb-0 fw-bold">${item.name}</p>
                                        <small class="text-muted">
                                            Cantidad: ${item.quantity} × L. ${formatCurrencyHonduras(item.price)}
                                        </small>
                                    </div>
                                    <div class="text-end">
                                        <strong>L. ${formatCurrencyHonduras(item.quantity * item.price)}</strong>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <hr>
                        <div class="row">
                            <div class="col-6"><strong>Subtotal:</strong></div>
                            <div class="col-6 text-end">L. ${formatCurrencyHonduras(order.subtotal)}</div>
                        </div>
                        <div class="row">
                            <div class="col-6"><strong>Envío:</strong></div>
                            <div class="col-6 text-end">L. ${formatCurrencyHonduras(order.shipping)}</div>
                        </div>
                        ${order.address ? `
                        <div class="mb-3 mt-3">
                            <h6 class="mb-1">📍 Dirección de envío</h6>
                            <p class="mb-0">${order.address.line}</p>
                            <p class="mb-0">${order.address.city}, ${order.address.state}</p>
                            ${order.address.zip ? `<p class="mb-0">CP: ${order.address.zip}</p>` : ''}
                        </div>
                        <hr>` : '<hr>'}
                        <div class="row">
                            <div class="col-6"><strong>💰 Total:</strong></div>
                            <div class="col-6 text-end"><strong>L. ${formatCurrencyHonduras(order.total)}</strong></div>
                        </div>
                    </div>
                `,
                width: '600px',
                showCloseButton: true,
                showConfirmButton: false,
                customClass: {
                    popup: 'order-details-popup'
                }
            });

        } catch (error) {
            console.error('❌ Error mostrando detalles del pedido:', error);
            showNotification('Error al cargar los detalles del pedido', 'error');
        }
    }

    // Manejar error de autenticación
    function handleAuthError() {
        const container = document.getElementById('profile-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-lock fa-3x text-muted mb-3"></i>
                    <h3>Acceso Restringido</h3>
                    <p class="text-muted">Debes iniciar sesión para acceder a tu perfil</p>
                    <a href="index.html" class="btn btn-primary">
                        <i class="fas fa-home me-2"></i>Ir al Inicio
                    </a>
                </div>
            `;
        }
    }

    // Utilidades para formato hondureño
    function formatDateHonduras(date) {
        return new Date(date).toLocaleDateString('es-HN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatCurrencyHonduras(amount) {
        return new Intl.NumberFormat('es-HN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function validateHonduranPhone(phone) {
        // Formato hondureño: 9999-9999 o 99999999
        const phoneRegex = /^(\d{4}-\d{4}|\d{8})$/;
        return phoneRegex.test(phone);
    }

    // Utilidades de estado
    function getStatusColor(status) {
        const statusColors = {
            'pending': 'warning',
            'processing': 'info',
            'shipped': 'primary',
            'delivered': 'success',
            'cancelled': 'danger'
        };
        return statusColors[status] || 'secondary';
    }

    function getStatusText(status) {
        const statusTexts = {
            'pending': 'Pendiente',
            'processing': 'En Proceso',
            'shipped': 'Enviado',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado'
        };
        return statusTexts[status] || 'Desconocido';
    }

    function showNotification(message, type = 'success') {
        Swal.fire({
            icon: type,
            title: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }

    // Inicializar cuando Firebase esté listo
    if (typeof firebase !== 'undefined') {
        initializeProfile();
    } else {
        console.error('❌ Firebase no está disponible');
        handleAuthError();
    }

    console.log('✅ Profile.js inicializado - Fashion Collection Honduras');
});
