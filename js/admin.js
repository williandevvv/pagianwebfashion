document.addEventListener("DOMContentLoaded", () => {
  console.log("👑 Admin.js cargado");

  // Verificar autenticación y rol de administrador
  checkAdminAccess();

  // Variables globales
  let products = [];
  let orders = [];
  let users = [];
  let productoEnEdicion = null;
  let currentUserRole = null;
  let currentPermissions = {};

  // Importar módulos de reportes y configuración
  import('./reports.js').then(module => {
    window.generateExcelReport = module.generateExcelReport;
  }).catch(error => {
    console.log('Reportes en modo offline');
  });

  import('./settings.js').then(module => {
    console.log('Módulo de configuración cargado');
  }).catch(error => {
    console.log('Configuración en modo offline');
  });

  // Función para verificar acceso y establecer permisos
  async function checkAdminAccess() {
    try {
      if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(async (user) => {
          if (!user) {
            redirectToLogin();
            return;
          }

          try {
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            const userData = userDoc.data() || {};

            currentUserRole = userData.role || 'customer';
            currentPermissions = userData.permissions || defaultPermissions[currentUserRole] || {};

            const username = userData.displayName || user.email;
            const nameEl = document.getElementById('admin-username');
            if (nameEl) nameEl.textContent = username;

            if (!currentPermissions.dashboard?.view) {
              showUnauthorizedMessage();
              return;
            }

            console.log(`✅ Acceso verificado para rol ${currentUserRole}`);
            applyRolePermissions();
            loadDataFromFirebase();
            loadInventoryData();
            setupAdminEvents();
          } catch (error) {
            console.error('Error verificando rol:', error);
            redirectToLogin();
          }
        });
      } else {
        const offlineData = localStorage.getItem('offlineData');
        if (offlineData) {
          try {
            const data = JSON.parse(offlineData);
            if (data.user) {
              currentUserRole = data.user.role || 'customer';
              currentPermissions = defaultPermissions[currentUserRole] || {};

              if (!currentPermissions.dashboard?.view) {
                showUnauthorizedMessage();
                return;
              }

              applyRolePermissions();
              loadDataFromFirebase();
              loadInventoryData();
              setupAdminEvents();
              console.log('✅ Acceso offline verificado');
              return;
            }
          } catch (error) {
            console.error('Error verificando datos offline:', error);
          }
        }

        redirectToLogin();
      }
    } catch (error) {
      console.error('Error en verificación de acceso:', error);
      redirectToLogin();
    }
  }

  // Redirigir a login
  function redirectToLogin() {
    Swal.fire({
      title: 'Acceso Denegado',
      text: 'Debes iniciar sesión como administrador',
      icon: 'error',
      confirmButtonColor: '#dc3545'
    }).then(() => {
      window.location.href = 'index.html';
    });
  }

  // Mostrar mensaje de no autorizado
  function showUnauthorizedMessage() {
    document.body.innerHTML = `
      <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
        <div class="text-center">
          <div class="mb-4">
            <i class="fas fa-shield-alt text-danger" style="font-size: 4rem;"></i>
          </div>
          <h2 class="text-danger mb-3">Acceso Denegado</h2>
          <p class="text-muted mb-4">No tienes permisos para acceder al panel de administración.</p>
          <a href="index.html" class="btn btn-primary">
            <i class="fas fa-home me-2"></i>Volver al Inicio
          </a>
        </div>
      </div>
    `;
  }

  // Inicializar eventos
  function setupAdminEvents() {
    const sidebarToggle = document.getElementById("sidebarToggle");
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        document.getElementById("sidebar").classList.toggle("active");
        document.getElementById("content").classList.toggle("active");
      });
    }

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-section]")) {
        e.preventDefault();
        const section = e.target.closest("[data-section]").dataset.section;
        if (section) showSection(section);
      }
    });
    const imageInput = document.querySelector('input[name="image"]');
    const preview = document.getElementById("previewImage");

    if (imageInput && preview) {
      imageInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    // Eliminar producto
    document.addEventListener("click", async (e) => {
      const btn = e.target.closest(".eliminar-producto");
      if (!btn) return;

      const id = btn.dataset.id;

      const confirmacion = await Swal.fire({
        title: "¿Eliminar producto?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc3545",
      });
      if (!confirmacion.isConfirmed) return;

      try {
        await firebase.firestore().collection("products").doc(id).delete();
        products = products.filter((p) => p.id !== id);
        renderProductsTable();
        Swal.fire("✅ Producto eliminado", "", "success");
      } catch (err) {
        Swal.fire("❌ Error al eliminar", "", "error");
        console.error(err);
      }
    });

    // Cambiar rol de usuario mostrando lista de roles
    document.addEventListener("click", async (e) => {
      const btn = e.target.closest(".cambiar-rol");
      if (!btn) return;

      const id = btn.dataset.id;
      const actual = btn.dataset.rol;

      const { value: nuevoRol } = await Swal.fire({
        title: 'Cambiar Rol',
        html: `
          <select id="rolNuevo" class="form-select">
            <option value="customer" ${actual === 'customer' ? 'selected' : ''}>Cliente</option>
            <option value="viewer" ${actual === 'viewer' ? 'selected' : ''}>Visualizador</option>
            <option value="editor" ${actual === 'editor' ? 'selected' : ''}>Editor</option>
            <option value="moderator" ${actual === 'moderator' ? 'selected' : ''}>Moderador</option>
            <option value="admin" ${actual === 'admin' ? 'selected' : ''}>Administrador</option>
          </select>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => document.getElementById('rolNuevo').value
      });

      if (!nuevoRol || nuevoRol === actual) return;

      try {
        await firebase.firestore().collection('users').doc(id).update({
          role: nuevoRol,
          permissions: defaultPermissions[nuevoRol] || {},
          updatedAt: new Date()
        });
        users = users.map(u => u.id === id ? { ...u, role: nuevoRol, permissions: defaultPermissions[nuevoRol] || {} } : u);
        renderUsersTable();
        Swal.fire({
          title: '¡Éxito!',
          text: 'Rol actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#198754'
        });
      } catch (err) {
        console.error('❌ Error al cambiar rol:', err);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cambiar el rol del usuario',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    });

    // Marcar pedido como enviado y actualizar stock
    document.addEventListener("click", async (e) => {
      const btn = e.target.closest(".marcar-enviado");
      if (!btn) return;

      const pedidoId = btn.dataset.id;
      const pedido = orders.find((o) => o.id === pedidoId);
      if (!pedido) return;

      const confirmacion = await Swal.fire({
        title: "¿Marcar como enviado?",
        text: "Esto actualizará el estado del pedido y reducirá el stock",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Sí, marcar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#198754",
      });

      if (!confirmacion.isConfirmed) return;

      try {
        const batch = firebase.firestore().batch();

        for (const item of pedido.items || []) {
          const prodRef = firebase
            .firestore()
            .collection("products")
            .doc(item.id);
          const doc = await prodRef.get();
          if (doc.exists) {
            const actual = doc.data().stock || 0;
            const nuevo = Math.max(actual - item.quantity, 0);
            batch.update(prodRef, { stock: nuevo });
          }
        }

        const pedidoRef = firebase
          .firestore()
          .collection("orders")
          .doc(pedidoId);
        batch.update(pedidoRef, { status: "enviado" });

        await batch.commit();
        await loadDataFromFirebase();

        Swal.fire(
          "✅ Pedido actualizado",
          "Stock ajustado correctamente",
          "success"
        );
      } catch (err) {
        console.error("❌ Error al marcar como enviado:", err);
        Swal.fire("❌ No se pudo actualizar el pedido", "", "error");
      }
    });

    // Editar producto
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".editar-producto");
      if (!btn) return;

      const id = btn.dataset.id;
      const producto = products.find((p) => p.id === id);
      if (!producto) return;

      productoEnEdicion = producto;

      const form = document.getElementById("addProductForm");
      form.name.value = producto.name;
      form.category.value = producto.category;
      form.price.value = producto.price;
      form.stock.value = producto.stock;
      form.description.value = producto.description || "";
      form.status.checked = producto.status;

      const modal = new bootstrap.Modal(
        document.getElementById("addProductModal")
      );
      modal.show();
    });
  }

  function showSection(sectionName) {
    document.querySelectorAll('section[id$="-section"]').forEach((section) => {
      section.classList.add("d-none");
    });

    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
      targetSection.classList.remove("d-none");
    }

    document.querySelectorAll("#sidebar a[data-section]").forEach((link) => {
      link.classList.remove("active");
    });

    document
      .querySelector(`#sidebar a[data-section="${sectionName}"]`)
      ?.classList.add("active");

    // Actualizar título de la sección
    const sectionTitles = {
      dashboard: 'Dashboard',
      products: 'Productos',
      orders: 'Pedidos',
      users: 'Usuarios',
      inventory: 'Inventario',
      reports: 'Reportes',
      messages: 'Mensajes',
      settings: 'Configuración'
    };
    
    const titleElement = document.getElementById('section-title');
    if (titleElement && sectionTitles[sectionName]) {
      titleElement.textContent = sectionTitles[sectionName];
    }

    // Cargar datos específicos de la sección
    switch (sectionName) {
      case 'inventory':
        loadInventoryData();
        break;
      case 'dashboard':
        renderDashboard();
        break;
      case 'products':
        renderProductsTable();
        break;
      case 'orders':
        renderOrdersTable();
        break;
      case 'users':
        renderUsersTable();
        break;
      case 'settings':
        loadSettingsSection();
        break;
      case 'reports':
        loadReportsSection();
        break;
      case 'messages':
        window.loadMessages && loadMessages();
        break;
    }
  }

  async function loadDataFromFirebase() {
    try {
      const productsSnapshot = await firebase
        .firestore()
        .collection("products")
        .get();
      products = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const usersSnapshot = await firebase
        .firestore()
        .collection("users")
        .get();
      users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const ordersSnapshot = await firebase
        .firestore()
        .collection("orders")
        .get();
      orders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      renderDashboard();
    } catch (error) {
      console.error("❌ Error cargando datos desde Firebase:", error);
    }
  }

function renderProductsTable() {
    const container = document.getElementById("products-table");
    if (!container) return;

    // Verificar si products está definido y tiene elementos
    if (!Array.isArray(products) || products.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">No hay productos disponibles</td>
            </tr>`;
        return;
    }

    container.innerHTML = products
        .map(
            (product) => `
                <tr>
                    <td>${product.id || ''}</td>
                    <td><img src="${
                        product.image || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGUSURBVFiF7ZY9TsNAEIXfbEIkKPAJwoEQBUJAR4GQqGgpEQfIEThFpDSIE0BHwwFoaBAnQEi0/NhjaGxFNvauHYcCKb80snd25s2bmbUNJSUl/xuSVQBrANYB1AC8AXgC0AfQ8/I8gVwE0ATQAHBLck/SjKQZSXXXbkq6I9kCsJhH/jKAQwCnJPtmdm9mI0mj+MxsZGb3APoAeiRPARy4tVORZB3ABYAOgGszGySxwwQkKwAOAOwBaJjZZWLHCbYBdM3sJqkTAGb2DOAS785bSYPHcQPAZtLASWgC6JrZbVrnAMzsHsAlvKtwkNZ5jCWS5wD2zew5S4QkqwA6AA7N7ClLhB4kWyTPzOwtj3MAMLMBgDaANsmdPHJI1gBckRxm9R0j6QvAA7ztNhckawBuzOw7r2xJPwDu4G3TmSQOkqwDuAKQa+RTZP8C6ALYSGJ8HJJ1kpcAPvPKDkn+BNAHsD7N+DiWAZyR/EoaQFKF5DGAN3h7fGZIbgE4BzAEcCJpPo2jpKTkL/ML8cVtwLLqG6YAAAAASUVORK5CYII='
                    }" style="width:40px;height:40px;object-fit:cover;" class="rounded" alt="${
                product.name || 'Producto'
            }"></td>
                    <td>${product.name || 'Sin nombre'}</td>
                    <td>${product.category || 'Sin categoría'}</td>
                    <td>L.${product.price || 0}</td>
                    <td>${product.stock || 0}</td>
                    <td>
                        <span class="badge ${
                            product.status === false ? "bg-danger" : "bg-success"
                        }">
                            ${product.status === false ? "Inactivo" : "Activo"}
                        </span>
                    </td>
                    <td>
                        ${hasPermission('products','edit') ? `<button class="btn btn-sm btn-warning editar-producto" data-id="${product.id}"><i class="fas fa-edit"></i></button>` : ''}
                        ${hasPermission('products','delete') ? `<button class="btn btn-sm btn-danger eliminar-producto" data-id="${product.id}"><i class="fas fa-trash-alt"></i></button>` : ''}
                    </td>
                </tr>
            `
        )
        .join("");
}

  // Sistema de permisos
  const defaultPermissions = {
    admin: {
      dashboard: { view: true, export: true },
      products: { view: true, create: true, edit: true, delete: true },
      orders: { view: true, edit: true, cancel: true, refund: true },
      users: { view: true, create: true, edit: true, delete: true, roles: true, permissions: true },
      inventory: { view: true, update: true, alerts: true, reports: true },
      reports: { view: true, export: true },
      settings: { view: true, edit: true, backup: true, system: true }
    },
    moderator: {
      dashboard: { view: true, export: false },
      products: { view: true, create: true, edit: true, delete: false },
      orders: { view: true, edit: true, cancel: true, refund: false },
      users: { view: true, create: false, edit: true, delete: false, roles: false, permissions: false },
      inventory: { view: true, update: true, alerts: false, reports: true },
      reports: { view: true, export: true },
      settings: { view: true, edit: false, backup: false, system: false }
    },
    editor: {
      dashboard: { view: true, export: false },
      products: { view: true, create: true, edit: true, delete: false },
      orders: { view: true, edit: true, cancel: false, refund: false },
      users: { view: false, create: false, edit: false, delete: false, roles: false, permissions: false },
      inventory: { view: true, update: true, alerts: false, reports: false },
      reports: { view: true, export: false },
      settings: { view: false, edit: false, backup: false, system: false }
    },
    viewer: {
      dashboard: { view: true, export: false },
      products: { view: true, create: false, edit: false, delete: false },
      orders: { view: true, edit: false, cancel: false, refund: false },
      users: { view: false, create: false, edit: false, delete: false, roles: false, permissions: false },
      inventory: { view: true, update: false, alerts: false, reports: false },
      reports: { view: false, export: false },
      settings: { view: false, edit: false, backup: false, system: false }
    },
    customer: {
      dashboard: { view: false, export: false },
      products: { view: false, create: false, edit: false, delete: false },
      orders: { view: false, edit: false, cancel: false, refund: false },
      users: { view: false, create: false, edit: false, delete: false, roles: false, permissions: false },
      inventory: { view: false, update: false, alerts: false, reports: false },
      reports: { view: false, export: false },
      settings: { view: false, edit: false, backup: false, system: false }
    }
  };

  function hasPermission(module, action) {
    return !!currentPermissions?.[module]?.[action];
  }

  function applyRolePermissions() {
    const modules = ['dashboard','products','orders','users','inventory','reports','settings'];
    modules.forEach(m => {
      const canView = hasPermission(m,'view');
      const navEl = document.querySelector(`#sidebar [data-section="${m}"]`);
      if (navEl) navEl.parentElement.style.display = canView ? '' : 'none';
      const section = document.getElementById(`${m}-section`);
      if (section && !canView) section.remove();
    });

    if (!hasPermission('products','create')) {
      document.querySelector('#products-section [data-bs-target="#addProductModal"]')?.classList.add('d-none');
    }
    if (!hasPermission('users','create')) {
      document.querySelector('[data-bs-target="#addUserModal"]')?.classList.add('d-none');
    }
    if (!hasPermission('users','roles')) {
      document.querySelector('[data-bs-target="#rolesPermissionsModal"]')?.classList.add('d-none');
    }
  }

function renderUsersTable() {
    const container = document.querySelector("#users-table tbody");
    if (!container) return;

    // Verificar si users está definido
    if (!Array.isArray(users)) {
        container.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">Error al cargar usuarios</td>
            </tr>`;
        return;
    }

    // Aplicar filtros
    let filteredUsers = [...users];
    
    const roleFilter = document.getElementById('filterRole')?.value;
    const statusFilter = document.getElementById('filterStatus')?.value;
    const searchTerm = document.getElementById('searchUsers')?.value?.toLowerCase();

    try {
        if (roleFilter) {
            filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
        }

        if (statusFilter) {
            filteredUsers = filteredUsers.filter(user => (user.status || 'active') === statusFilter);
        }

        if (searchTerm) {
            filteredUsers = filteredUsers.filter(user => 
                (user.displayName || '').toLowerCase().includes(searchTerm) ||
                (user.email || '').toLowerCase().includes(searchTerm)
            );
        }

        // Si no hay usuarios después de filtrar
        if (filteredUsers.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">No se encontraron usuarios</td>
                </tr>`;
            return;
        }

        container.innerHTML = filteredUsers
            .map(
                (user) => `
                    <tr>
                        <td>
                            <input type="checkbox" class="form-check-input user-checkbox" value="${user.id || ''}">
                        </td>
                        <td>
                            <img src="${user.photoURL || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGUSURBVFiF7ZY9TsNAEIXfbEIkKPAJwoEQBUJAR4GQqGgpEQfIEThFpDSIE0BHwwFoaBAnQEi0/NhjaGxFNvauHYcCKb80snd25s2bmbUNJSUl/xuSVQBrANYB1AC8AXgC0AfQ8/I8gVwE0ATQAHBLck/SjKQZSXXXbkq6I9kCsJhH/jKAQwCnJPtmdm9mI0mj+MxsZGb3APoAeiRPARy4tVORZB3ABYAOgGszGySxwwQkKwAOAOwBaJjZZWLHCbYBdM3sJqkTAGb2DOAS785bSYPHcQPAZtLASWgC6JrZbVrnAMzsHsAlvKtwkNZ5jCWS5wD2zew5S4QkqwA6AA7N7ClLhB4kWyTPzOwtj3MAMLMBgDaANsmdPHJI1gBckRxm9R0j6QvAA7ztNhckawBuzOw7r2xJPwDu4G3TmSQOkqwDuAKQa+RTZP8C6ALYSGJ8HJJ1kpcAPvPKDkn+BNAHsD7N+DiWAZyR/EoaQFKF5DGAN3h7fGZIbgE4BzAEcCJpPo2jpKTkL/ML8cVtwLLqG6YAAAAASUVORK5CYII='}" 
                                class="rounded-circle" width="32" height="32" alt="Avatar">
                        </td>
                        <td>${user.displayName || "Sin nombre"}</td>
                        <td>${user.email || "Sin email"}</td>
                        <td>
                            <span class="badge ${getRoleBadgeClass(user.role)}">
                                ${getRoleDisplayName(user.role)}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline-secondary" onclick="showUserPermissions('${user.id}')">
                                <i class="fas fa-shield-alt"></i> Ver
                            </button>
                        </td>
                        <td>
                            <span class="badge ${getStatusBadgeClass(user.status || 'active')}">
                                ${getStatusDisplayName(user.status || 'active')}
                            </span>
                        </td>
                        <td>${user.lastAccess ? new Date(user.lastAccess.seconds * 1000).toLocaleDateString() : 'Nunca'}</td>
                        <td>
                            <div class="btn-group">
                                ${hasPermission('users','edit') ? `<button class="btn btn-sm btn-outline-primary" onclick="editUser('${user.id}')" title="Editar"><i class="fas fa-edit"></i></button>` : ''}
                                ${hasPermission('users','roles') ? `<button class="btn btn-sm btn-outline-warning cambiar-rol" data-id="${user.id}" data-rol="${user.role || ''}" title="Cambiar Rol"><i class="fas fa-user-tag"></i></button>` : ''}
                                ${hasPermission('users','permissions') ? `<button class="btn btn-sm btn-outline-info" onclick="editUserPermissions('${user.id}')" title="Permisos"><i class="fas fa-key"></i></button>` : ''}
                                ${hasPermission('users','delete') ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${user.id}')" title="Eliminar"><i class="fas fa-trash"></i></button>` : ''}
                            </div>
                        </td>
                    </tr>
                `
            )
            .join("");
    } catch (error) {
        console.error('Error al renderizar tabla de usuarios:', error);
        container.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">Error al procesar usuarios</td>
            </tr>`;
    }
}

  function getRoleBadgeClass(role) {
    const classes = {
      admin: 'bg-danger',
      moderator: 'bg-primary',
      editor: 'bg-success',
      viewer: 'bg-info',
      customer: 'bg-secondary'
    };
    return classes[role] || 'bg-secondary';
  }

  function getRoleDisplayName(role) {
    const names = {
      admin: 'Administrador',
      moderator: 'Moderador',
      editor: 'Editor',
      viewer: 'Visualizador',
      customer: 'Cliente'
    };
    return names[role] || role;
  }

  function getStatusBadgeClass(status) {
    const classes = {
      active: 'bg-success',
      inactive: 'bg-secondary',
      suspended: 'bg-warning'
    };
    return classes[status] || 'bg-secondary';
  }

  function getStatusDisplayName(status) {
    const names = {
      active: 'Activo',
      inactive: 'Inactivo',
      suspended: 'Suspendido'
    };
    return names[status] || status;
  }

  // Funciones para gestión de usuarios
  window.editUser = function(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    Swal.fire({
      title: 'Editar Usuario',
      html: `
        <div class="text-start">
          <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input type="text" id="editUserName" class="form-control" value="${user.displayName || ''}">
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" id="editUserEmail" class="form-control" value="${user.email || ''}">
          </div>
          <div class="mb-3">
            <label class="form-label">Estado</label>
            <select id="editUserStatus" class="form-select">
              <option value="active" ${(user.status || 'active') === 'active' ? 'selected' : ''}>Activo</option>
              <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactivo</option>
              <option value="suspended" ${user.status === 'suspended' ? 'selected' : ''}>Suspendido</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        return {
          displayName: document.getElementById('editUserName').value,
          email: document.getElementById('editUserEmail').value,
          status: document.getElementById('editUserStatus').value
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await firebase.firestore().collection('users').doc(userId).update(result.value);
          await loadDataFromFirebase();
          Swal.fire('✅ Usuario actualizado', '', 'success');
        } catch (error) {
          console.error('Error actualizando usuario:', error);
          Swal.fire('❌ Error al actualizar usuario', '', 'error');
        }
      }
    });
  };

  window.deleteUser = function(userId) {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await firebase.firestore().collection('users').doc(userId).delete();
          await loadDataFromFirebase();
          Swal.fire('✅ Usuario eliminado', '', 'success');
        } catch (error) {
          console.error('Error eliminando usuario:', error);
          Swal.fire('❌ Error al eliminar usuario', '', 'error');
        }
      }
    });
  };

  window.showUserPermissions = function(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const userPermissions = user.permissions || defaultPermissions[user.role] || {};
    
    let permissionsHtml = '<div class="text-start">';
    Object.keys(defaultPermissions.admin).forEach(module => {
      permissionsHtml += `<h6>${module.charAt(0).toUpperCase() + module.slice(1)}</h6><ul>`;
      Object.keys(defaultPermissions.admin[module]).forEach(permission => {
        const hasPermission = userPermissions[module]?.[permission] || false;
        permissionsHtml += `<li class="${hasPermission ? 'text-success' : 'text-danger'}">
          <i class="fas fa-${hasPermission ? 'check' : 'times'}"></i> ${permission}
        </li>`;
      });
      permissionsHtml += '</ul>';
    });
    permissionsHtml += '</div>';

    Swal.fire({
      title: `Permisos de ${user.displayName || user.email}`,
      html: permissionsHtml,
      width: '600px'
    });
  };

  window.editUserPermissions = function(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('editUserId').value = userId;
    
    // Cargar permisos específicos del usuario
    const userPermissions = user.permissions || defaultPermissions[user.role] || {};
    const container = document.getElementById('userSpecificPermissions');
    
    let html = '';
    Object.keys(defaultPermissions.admin).forEach(module => {
      html += `
        <div class="card mb-3">
          <div class="card-header">
            <h6 class="mb-0">${module.charAt(0).toUpperCase() + module.slice(1)}</h6>
          </div>
          <div class="card-body">
            <div class="row">
      `;
      
      Object.keys(defaultPermissions.admin[module]).forEach(permission => {
        const isChecked = userPermissions[module]?.[permission] || false;
        html += `
          <div class="col-md-6">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" 
                     id="user_${module}_${permission}" 
                     name="${module}_${permission}" 
                     ${isChecked ? 'checked' : ''}>
              <label class="form-check-label" for="user_${module}_${permission}">
                ${permission.charAt(0).toUpperCase() + permission.slice(1)}
              </label>
            </div>
          </div>
        `;
      });
      
      html += `
            </div>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
    
    const modal = new bootstrap.Modal(document.getElementById('editUserPermissionsModal'));
    modal.show();
  };

  function renderOrdersTable() {
    const container = document.querySelector("#orders-table tbody");
    if (!container) return;

    container.innerHTML = orders
      .map((order) => {
        const total =
          order.total ||
          order.items?.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ) ||
          0;
        const fecha = order.createdAt?.seconds
          ? new Date(order.createdAt.seconds * 1000).toLocaleString()
          : "";
        const estado = order.status || order.estado || "pendiente";

        return `
                <tr>
                    <td>${order.id || "Sin ID"}</td>
                    <td>${order.userEmail || "Desconocido"}</td>
                    <td>${fecha}</td>
                    <td>${order.items?.length || 0}</td>
                    <td>L.${total.toFixed(2)}</td>
                    <td>
                        <span class="badge ${
                          estado === "enviado"
                            ? "bg-success"
                            : estado === "cancelado"
                            ? "bg-danger"
                            : "bg-warning"
                        }">${estado}</span>
                    </td>
                    <td>
                        ${
                          (estado === "pending" || estado === "pendiente") && hasPermission('orders','edit')
                            ? `<button class="btn btn-sm btn-success marcar-enviado" data-id="${order.id}">Marcar Enviado</button>`
                            : ""
                        }
                    </td>
                </tr>
            `;
      })
      .join("");
  }

  async function renderDashboard() {
    try {
      // Cargar datos actualizados
      await loadDataFromFirebase();
      
      // Calcular estadísticas del dashboard
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Pedidos de hoy
      const todayOrders = orders.filter(order => {
        if (!order.createdAt?.seconds) return false;
        const orderDate = new Date(order.createdAt.seconds * 1000);
        return orderDate >= startOfToday;
      });
      
      // Stock bajo
      const lowStockProducts = products.filter(product => 
        (product.stock || 0) <= 5 && product.status !== false
      );
      
      // Nuevos usuarios del mes
      const newUsersThisMonth = users.filter(user => {
        if (!user.createdAt?.seconds) return false;
        const userDate = new Date(user.createdAt.seconds * 1000);
        return userDate >= startOfMonth;
      });
      
      // Ventas del mes
      const monthlyOrders = orders.filter(order => {
        if (!order.createdAt?.seconds) return false;
        const orderDate = new Date(order.createdAt.seconds * 1000);
        return orderDate >= startOfMonth && (order.status === 'enviado' || order.status === 'completed');
      });
      
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => {
        return sum + (order.total || order.items?.reduce((itemSum, item) => 
          itemSum + (item.price * item.quantity), 0) || 0);
      }, 0);
      
      // Actualizar elementos del dashboard
      updateDashboardStats({
        todayOrders: todayOrders.length,
        lowStock: lowStockProducts.length,
        newUsers: newUsersThisMonth.length,
        monthlyRevenue: monthlyRevenue
      });
      
      // Renderizar tablas
      renderRecentOrdersTable();
      
      // Renderizar otras tablas
      renderProductsTable();
      renderUsersTable();
      renderOrdersTable();
      
    } catch (error) {
      console.error('Error renderizando dashboard:', error);
    }
  }
  
  function updateDashboardStats(stats) {
    // Actualizar tarjetas de estadísticas usando los IDs correctos del HTML
    const todayOrdersEl = document.getElementById('ordersToday');
    if (todayOrdersEl) todayOrdersEl.textContent = stats.todayOrders;
    
    const lowStockEl = document.getElementById('productsLowStock');
    if (lowStockEl) {
      lowStockEl.textContent = stats.lowStock;
      // Cambiar color si hay stock bajo
      const card = lowStockEl.closest('.card');
      if (card) {
        if (stats.lowStock > 0) {
          card.classList.add('border-warning');
          card.classList.remove('border-success');
        } else {
          card.classList.add('border-success');
          card.classList.remove('border-warning');
        }
      }
    }
    
    const newUsersEl = document.getElementById('newUsers');
    if (newUsersEl) newUsersEl.textContent = stats.newUsers;
    
    const monthlyRevenueEl = document.getElementById('monthlyRevenue');
    if (monthlyRevenueEl) monthlyRevenueEl.textContent = `L${stats.monthlyRevenue.toFixed(2)}`;
  }
  
  
  
  function renderRecentOrdersTable() {
    const container = document.querySelector("#recentOrdersTable tbody");
    if (!container) return;
    
    // Obtener los 5 pedidos más recientes
    const recentOrders = [...orders]
      .sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      })
      .slice(0, 5);
    
    container.innerHTML = recentOrders
      .map(order => {
        const total = order.total || order.items?.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0) || 0;
        const fecha = order.createdAt?.seconds 
          ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
          : 'Sin fecha';
        const estado = order.status || order.estado || 'pendiente';
        
        return `
          <tr>
            <td>${order.id}</td>
            <td>${order.userEmail || 'Cliente'}</td>
            <td>${fecha}</td>
            <td>L${total.toFixed(2)}</td>
            <td>
              <span class="badge ${
                estado === 'enviado' ? 'bg-success' :
                estado === 'cancelado' ? 'bg-danger' : 'bg-warning'
              }">${estado}</span>
            </td>
            <td>
              <button class="btn btn-sm btn-outline-primary" onclick="viewOrderDetails('${order.id}')">
                <i class="fas fa-eye"></i>
              </button>
            </td>
          </tr>
        `;
      })
      .join('');
  }
  
  // Función para ver detalles del pedido
  window.viewOrderDetails = function(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const total = order.total || order.items?.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0) || 0;
    const fecha = order.createdAt?.seconds 
      ? new Date(order.createdAt.seconds * 1000).toLocaleString()
      : 'Sin fecha';
    
    let itemsHtml = '<div class="table-responsive"><table class="table table-sm"><thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead><tbody>';
    
    if (order.items) {
      order.items.forEach(item => {
        const subtotal = item.price * item.quantity;
        itemsHtml += `
          <tr>
            <td>${item.name || 'Producto'}</td>
            <td>${item.quantity}</td>
            <td>L${item.price.toFixed(2)}</td>
            <td>L${subtotal.toFixed(2)}</td>
          </tr>
        `;
      });
    }
    
    itemsHtml += '</tbody></table></div>';
    
    Swal.fire({
      title: `Pedido #${order.id}`,
      html: `
        <div class="text-start">
          <p><strong>Cliente:</strong> ${order.userEmail || 'Desconocido'}</p>
          <p><strong>Fecha:</strong> ${fecha}</p>
          <p><strong>Estado:</strong> <span class="badge ${
            order.status === 'enviado' ? 'bg-success' :
            order.status === 'cancelado' ? 'bg-danger' : 'bg-warning'
          }">${order.status || 'pendiente'}</span></p>
          <p><strong>Total:</strong> L${total.toFixed(2)}</p>
          <hr>
          <h6>Productos:</h6>
          ${itemsHtml}
        </div>
      `,
      width: '800px',
      confirmButtonText: 'Cerrar'
    });
  };

  // Guardar producto (crear o editar)
  const addProductForm = document.getElementById("addProductForm");
  if (addProductForm) {
    addProductForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const form = e.target;
      const name = form.name.value.trim();
      const category = form.category.value;
      const price = parseFloat(form.price.value);
      const stock = parseInt(form.stock.value);
      const description = form.description.value.trim();
      const status = form.status.checked;
      const imageFile = form.image.files[0];

      // Validaciones básicas
      if (!name || !category || isNaN(price) || isNaN(stock)) {
        Swal.fire({
          title: 'Error de Validación',
          text: 'Por favor completa todos los campos requeridos correctamente',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
        return;
      }

      try {
        // Mostrar loading
        Swal.fire({
          title: 'Guardando Producto...',
          text: 'Por favor espera mientras se procesa la información',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        let imageUrl = productoEnEdicion?.image || "";

        // Verificar autenticación antes de subir imagen
        if (imageFile) {
          try {
            // Verificar autenticación
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
              throw new Error('Debes estar autenticado para subir imágenes');
            }

            // Validar tipo de archivo
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(imageFile.type)) {
              throw new Error('Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, GIF, WebP)');
            }

            // Validar tamaño (máximo 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (imageFile.size > maxSize) {
              throw new Error('La imagen es demasiado grande. Máximo 5MB permitido');
            }

            // Verificar que Firebase Storage esté disponible
            if (!firebase.storage) {
              throw new Error('Firebase Storage no está disponible');
            }

            // Actualizar mensaje de loading para subida de imagen
            Swal.update({
              title: 'Verificando acceso...',
              text: 'Comprobando permisos y preparando subida...'
            });

            // Verificar token de autenticación
            const token = await currentUser.getIdToken(true);
            if (!token) {
              throw new Error('Error de autenticación. Por favor, inicia sesión nuevamente.');
            }

            Swal.update({
              title: 'Subiendo Imagen...',
              text: 'Procesando archivo de imagen, por favor espera...'
            });

            const storageRef = firebase.storage().ref();
            const fileName = `productos/${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const imageRef = storageRef.child(fileName);
            
            console.log('Subiendo imagen:', fileName);
            
            // Configurar metadata optimizada
            const metadata = {
              contentType: imageFile.type,
              cacheControl: 'public,max-age=3600',
              customMetadata: {
                'uploadedBy': 'admin-panel',
                'originalName': imageFile.name
              }
            };
            
            // Intentar subida con reintentos
            let uploadSuccess = false;
            let attempts = 0;
            const maxAttempts = 3;
            
            while (!uploadSuccess && attempts < maxAttempts) {
              try {
                attempts++;
                console.log(`Intento de subida ${attempts}/${maxAttempts}`);
                
                // Subir archivo con metadata
                const snapshot = await imageRef.put(imageFile, metadata);
                console.log('Imagen subida exitosamente');
                
                // Esperar un momento antes de obtener la URL
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Obtener URL de descarga con reintentos
                let urlAttempts = 0;
                const maxUrlAttempts = 3;
                
                while (urlAttempts < maxUrlAttempts) {
                  try {
                    urlAttempts++;
                    imageUrl = await snapshot.ref.getDownloadURL();
                    console.log('URL de imagen obtenida:', imageUrl);
                    uploadSuccess = true;
                    break;
                  } catch (urlError) {
                    console.warn(`Error obteniendo URL (intento ${urlAttempts}):`, urlError);
                    if (urlAttempts < maxUrlAttempts) {
                      await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                  }
                }
                
                if (!uploadSuccess) {
                  throw new Error('No se pudo obtener la URL de descarga después de varios intentos');
                }
                
              } catch (uploadError) {
                console.warn(`Error en intento ${attempts}:`, uploadError);
                if (attempts < maxAttempts) {
                  await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                  throw uploadError;
                }
              }
            }

          } catch (imageError) {
            console.error('Error subiendo imagen:', imageError);
            
            // Determinar mensaje de error específico
            let errorMessage = 'No se pudo subir la imagen. ';
            
            if (imageError.message.includes('CORS')) {
              errorMessage += 'Error de configuración del servidor. Intenta nuevamente en unos minutos.';
            } else if (imageError.message.includes('network')) {
              errorMessage += 'Problema de conexión. Verifica tu internet e intenta nuevamente.';
            } else if (imageError.message.includes('permission')) {
              errorMessage += 'Sin permisos para subir archivos. Contacta al administrador.';
            } else {
              errorMessage += imageError.message || 'Error desconocido. Intenta con otra imagen.';
            }
            
            Swal.fire({
              title: 'Error al subir imagen',
              text: errorMessage,
              icon: 'error',
              confirmButtonColor: '#dc3545',
              footer: 'Puedes continuar sin imagen y agregarla después editando el producto'
            });
            return;
          }
        }

        const newProduct = {
          name,
          category,
          price,
          stock,
          description,
          image: imageUrl,
          status,
          updatedAt: new Date(),
        };

        // Guardar en Firestore
        if (productoEnEdicion) {
          await firebase
            .firestore()
            .collection("products")
            .doc(productoEnEdicion.id)
            .update(newProduct);
          console.log('Producto actualizado:', productoEnEdicion.id);
        } else {
          newProduct.createdAt = new Date();
          const docRef = await firebase.firestore().collection("products").add(newProduct);
          console.log('Producto creado:', docRef.id);
        }

        // Limpiar formulario y cerrar modal
        productoEnEdicion = null;
        const modal = bootstrap.Modal.getInstance(document.getElementById("addProductModal"));
        if (modal) modal.hide();
        
        form.reset();
        
        // Resetear preview de imagen
        const previewImage = document.getElementById("previewImage");
        if (previewImage) {
          previewImage.src = "https://via.placeholder.com/150";
        }

        // Recargar datos
        await loadDataFromFirebase();

        Swal.fire({
          title: '¡Éxito!',
          text: productoEnEdicion ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
          icon: 'success',
          confirmButtonColor: '#28a745'
        });

      } catch (err) {
        console.error("❌ Error al guardar producto:", err);
        Swal.fire({
          title: 'Error',
          text: err.message || 'No se pudo guardar el producto. Intenta nuevamente.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // Mejorar el preview de imagen
  const imageInput = document.querySelector('input[name="image"]');
  const preview = document.getElementById("previewImage");

  if (imageInput && preview) {
    imageInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) {
        preview.src = "https://via.placeholder.com/150";
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          title: 'Archivo no válido',
          text: 'Solo se permiten imágenes (JPG, PNG, GIF, WebP)',
          icon: 'warning',
          confirmButtonColor: '#ffc107'
        });
        imageInput.value = '';
        preview.src = "https://via.placeholder.com/150";
        return;
      }

      // Validar tamaño
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        Swal.fire({
          title: 'Archivo muy grande',
          text: 'La imagen debe ser menor a 5MB',
          icon: 'warning',
          confirmButtonColor: '#ffc107'
        });
        imageInput.value = '';
        preview.src = "https://via.placeholder.com/150";
        return;
      }

      // Mostrar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Funciones adicionales para el sistema de permisos
  
  // Gestión de roles y permisos
  window.saveRolePermissions = async function() {
    const selectedRole = document.querySelector('#rolesList .active')?.dataset.role;
    if (!selectedRole) return;

    const permissions = {};
    Object.keys(defaultPermissions.admin).forEach(module => {
      permissions[module] = {};
      Object.keys(defaultPermissions.admin[module]).forEach(permission => {
        const checkbox = document.getElementById(`${module}_${permission}`);
        permissions[module][permission] = checkbox ? checkbox.checked : false;
      });
    });

    try {
      await firebase.firestore().collection('rolePermissions').doc(selectedRole).set({
        role: selectedRole,
        permissions: permissions,
        updatedAt: new Date()
      });
      
      Swal.fire('✅ Permisos guardados', 'Los permisos del rol han sido actualizados', 'success');
    } catch (error) {
      console.error('Error guardando permisos:', error);
      Swal.fire('❌ Error al guardar permisos', '', 'error');
    }
  };

  // Cambiar rol seleccionado en el modal de permisos
  document.addEventListener('click', function(e) {
    if (e.target.closest('#rolesList button')) {
      const button = e.target.closest('button');
      const role = button.dataset.role;
      
      // Actualizar botón activo
      document.querySelectorAll('#rolesList button').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Actualizar título
      document.getElementById('selectedRoleTitle').textContent = `Permisos para: ${getRoleDisplayName(role)}`;
      
      // Cargar permisos del rol
      loadRolePermissions(role);
    }
  });

  async function loadRolePermissions(role) {
    try {
      const doc = await firebase.firestore().collection('rolePermissions').doc(role).get();
      const rolePermissions = doc.exists ? doc.data().permissions : defaultPermissions[role];
      
      // Actualizar checkboxes
      Object.keys(defaultPermissions.admin).forEach(module => {
        Object.keys(defaultPermissions.admin[module]).forEach(permission => {
          const checkbox = document.getElementById(`${module}_${permission}`);
          if (checkbox) {
            checkbox.checked = rolePermissions?.[module]?.[permission] || false;
          }
        });
      });
    } catch (error) {
      console.error('Error cargando permisos del rol:', error);
    }
  }

  // Formulario para crear nuevo usuario
  const addUserForm = document.getElementById('addUserForm');
  if (addUserForm) {
    addUserForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const userData = {
        displayName: formData.get('displayName'),
        email: formData.get('email'),
        role: formData.get('role'),
        status: formData.get('status'),
        createdAt: new Date(),
        permissions: defaultPermissions[formData.get('role')] || {}
      };

      try {
        // En un entorno real, aquí crearías el usuario en Firebase Auth
        // Por ahora solo lo agregamos a Firestore
        await firebase.firestore().collection('users').add(userData);
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
        modal.hide();
        e.target.reset();
        
        await loadDataFromFirebase();
        Swal.fire('✅ Usuario creado', 'El usuario ha sido creado exitosamente', 'success');
      } catch (error) {
        console.error('Error creando usuario:', error);
        Swal.fire('❌ Error al crear usuario', '', 'error');
      }
    });
  }

  // Formulario para permisos específicos de usuario
  const userPermissionsForm = document.getElementById('userPermissionsForm');
  if (userPermissionsForm) {
    userPermissionsForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const userId = document.getElementById('editUserId').value;
      const permissions = {};
      
      Object.keys(defaultPermissions.admin).forEach(module => {
        permissions[module] = {};
        Object.keys(defaultPermissions.admin[module]).forEach(permission => {
          const checkbox = document.querySelector(`input[name="${module}_${permission}"]`);
          permissions[module][permission] = checkbox ? checkbox.checked : false;
        });
      });

      try {
        await firebase.firestore().collection('users').doc(userId).update({
          permissions: permissions,
          updatedAt: new Date()
        });
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('editUserPermissionsModal'));
        modal.hide();
        
        await loadDataFromFirebase();
        Swal.fire('✅ Permisos actualizados', 'Los permisos específicos han sido guardados', 'success');
      } catch (error) {
        console.error('Error actualizando permisos:', error);
        Swal.fire('❌ Error al actualizar permisos', '', 'error');
      }
    });
  }

  // Funciones para acciones masivas
  window.bulkChangeRole = function() {
    const selectedUsers = getSelectedUsers();
    if (selectedUsers.length === 0) {
      Swal.fire('⚠️ Selecciona usuarios', 'Debes seleccionar al menos un usuario', 'warning');
      return;
    }

    Swal.fire({
      title: 'Cambiar Rol Masivo',
      html: `
        <div class="text-start">
          <p>Cambiar rol de ${selectedUsers.length} usuario(s) seleccionado(s)</p>
          <select id="bulkRoleSelect" class="form-select">
            <option value="customer">Cliente</option>
            <option value="viewer">Visualizador</option>
            <option value="editor">Editor</option>
            <option value="moderator">Moderador</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Cambiar Rol',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        return document.getElementById('bulkRoleSelect').value;
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const batch = firebase.firestore().batch();
          selectedUsers.forEach(userId => {
            const userRef = firebase.firestore().collection('users').doc(userId);
            batch.update(userRef, { 
              role: result.value,
              permissions: defaultPermissions[result.value] || {},
              updatedAt: new Date()
            });
          });
          
          await batch.commit();
          await loadDataFromFirebase();
          clearUserSelection();
          Swal.fire('✅ Roles actualizados', '', 'success');
        } catch (error) {
          console.error('Error en cambio masivo de rol:', error);
          Swal.fire('❌ Error al cambiar roles', '', 'error');
        }
      }
    });
  };

  window.bulkActivateUsers = async function() {
    const selectedUsers = getSelectedUsers();
    if (selectedUsers.length === 0) return;

    try {
      const batch = firebase.firestore().batch();
      selectedUsers.forEach(userId => {
        const userRef = firebase.firestore().collection('users').doc(userId);
        batch.update(userRef, { status: 'active', updatedAt: new Date() });
      });
      
      await batch.commit();
      await loadDataFromFirebase();
      clearUserSelection();
      Swal.fire('✅ Usuarios activados', '', 'success');
    } catch (error) {
      console.error('Error activando usuarios:', error);
      Swal.fire('❌ Error al activar usuarios', '', 'error');
    }
  };

  window.bulkSuspendUsers = async function() {
    const selectedUsers = getSelectedUsers();
    if (selectedUsers.length === 0) return;

    const result = await Swal.fire({
      title: '¿Suspender usuarios?',
      text: `Se suspenderán ${selectedUsers.length} usuario(s)`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, suspender',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const batch = firebase.firestore().batch();
        selectedUsers.forEach(userId => {
          const userRef = firebase.firestore().collection('users').doc(userId);
          batch.update(userRef, { status: 'suspended', updatedAt: new Date() });
        });
        
        await batch.commit();
        await loadDataFromFirebase();
        clearUserSelection();
        Swal.fire('✅ Usuarios suspendidos', '', 'success');
      } catch (error) {
        console.error('Error suspendiendo usuarios:', error);
        Swal.fire('❌ Error al suspender usuarios', '', 'error');
      }
    }
  };

  window.bulkDeleteUsers = async function() {
    const selectedUsers = getSelectedUsers();
    if (selectedUsers.length === 0) return;

    const result = await Swal.fire({
      title: '¿Eliminar usuarios?',
      text: `Se eliminarán ${selectedUsers.length} usuario(s). Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545'
    });

    if (result.isConfirmed) {
      try {
        const batch = firebase.firestore().batch();
        selectedUsers.forEach(userId => {
          const userRef = firebase.firestore().collection('users').doc(userId);
          batch.delete(userRef);
        });
        
        await batch.commit();
        await loadDataFromFirebase();
        clearUserSelection();
        Swal.fire('✅ Usuarios eliminados', '', 'success');
      } catch (error) {
        console.error('Error eliminando usuarios:', error);
        Swal.fire('❌ Error al eliminar usuarios', '', 'error');
      }
    }
  };

  function getSelectedUsers() {
    const checkboxes = document.querySelectorAll('.user-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  }

  function clearUserSelection() {
    document.querySelectorAll('.user-checkbox').forEach(cb => cb.checked = false);
    document.getElementById('selectAllUsers').checked = false;
    document.getElementById('bulkActions').style.display = 'none';
  }

  // Eventos para selección de usuarios
  document.addEventListener('change', function(e) {
    if (e.target.id === 'selectAllUsers') {
      const checkboxes = document.querySelectorAll('.user-checkbox');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
      updateBulkActions();
    } else if (e.target.classList.contains('user-checkbox')) {
      updateBulkActions();
    }
  });

  function updateBulkActions() {
    const selectedCount = document.querySelectorAll('.user-checkbox:checked').length;
    const bulkActions = document.getElementById('bulkActions');
    const selectedCountSpan = document.getElementById('selectedCount');
    
    if (selectedCount > 0) {
      bulkActions.style.display = 'block';
      selectedCountSpan.textContent = selectedCount;
    } else {
      bulkActions.style.display = 'none';
    }
  }

  // Eventos para filtros de usuarios
  document.addEventListener('change', function(e) {
    if (e.target.id === 'filterRole' || e.target.id === 'filterStatus') {
      renderUsersTable();
    }
  });

  document.addEventListener('input', function(e) {
    if (e.target.id === 'searchUsers') {
      renderUsersTable();
    }
  });

  // Sistema de Inventario
  async function loadInventoryData() {
    try {
      // Primero sincronizar productos con inventario
      await syncProductsWithInventory();
      
      // Luego cargar datos del inventario
      const snapshot = await firebase.firestore().collection('inventory').get();
      const inventory = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      renderInventoryTable(inventory);
      checkLowStock(inventory);
    } catch (error) {
      console.error('Error cargando inventario:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el inventario',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    }
  }

  // Sincronizar productos con inventario
  async function syncProductsWithInventory() {
    try {
      const productsSnapshot = await firebase.firestore().collection('products').get();
      const inventorySnapshot = await firebase.firestore().collection('inventory').get();
      
      const existingInventory = {};
      inventorySnapshot.docs.forEach(doc => {
        existingInventory[doc.id] = doc.data();
      });

      const batch = firebase.firestore().batch();
      let hasUpdates = false;

      productsSnapshot.docs.forEach(productDoc => {
        const product = productDoc.data();
        const productId = productDoc.id;
        
        if (!existingInventory[productId]) {
          // Crear nuevo registro de inventario
          const inventoryRef = firebase.firestore().collection('inventory').doc(productId);
          batch.set(inventoryRef, {
            name: product.name,
            category: product.category,
            stock: product.stock || 0,
            minStock: 5, // Stock mínimo por defecto
            price: product.price,
            lastUpdated: new Date(),
            createdAt: new Date()
          });
          hasUpdates = true;
        } else {
          // Actualizar datos básicos si han cambiado
          const existing = existingInventory[productId];
          if (existing.name !== product.name || 
              existing.category !== product.category || 
              existing.price !== product.price ||
              existing.stock !== product.stock) {
            
            const inventoryRef = firebase.firestore().collection('inventory').doc(productId);
            batch.update(inventoryRef, {
              name: product.name,
              category: product.category,
              price: product.price,
              stock: product.stock || existing.stock || 0,
              lastUpdated: new Date()
            });
            hasUpdates = true;
          }
        }
      });

      if (hasUpdates) {
        await batch.commit();
        console.log('✅ Inventario sincronizado con productos');
      }
    } catch (error) {
      console.error('Error sincronizando inventario:', error);
    }
  }

  function renderInventoryTable(inventory) {
    const container = document.querySelector("#inventory-table tbody");
    if (!container) return;

    container.innerHTML = inventory
      .map(item => `
        <tr>
          <td>${item.id}</td>
          <td>${item.name}</td>
          <td>${item.category}</td>
          <td>${item.stock}</td>
          <td>${item.minStock}</td>
          <td>
            <span class="badge ${getStockStatusClass(item.stock, item.minStock)}">
              ${getStockStatusText(item.stock, item.minStock)}
            </span>
          </td>
          <td>${item.lastUpdated ? new Date(item.lastUpdated.seconds * 1000).toLocaleDateString() : '-'}</td>
          <td>
            <div class="btn-group">
              <button class="btn btn-sm btn-outline-primary" onclick="adjustStock('${item.id}')">
                <i class="fas fa-edit"></i> Ajustar
              </button>
              <button class="btn btn-sm btn-outline-info" onclick="viewHistory('${item.id}')">
                <i class="fas fa-history"></i> Historial
              </button>
            </div>
          </td>
        </tr>
      `)
      .join("");
  }

  function getStockStatusClass(current, min) {
    if (current <= 0) return 'bg-danger';
    if (current <= min) return 'bg-warning';
    return 'bg-success';
  }

  function getStockStatusText(current, min) {
    if (current <= 0) return 'Sin Stock';
    if (current <= min) return 'Stock Bajo';
    return 'Stock OK';
  }

  window.adjustStock = function(itemId) {
    Swal.fire({
      title: 'Ajustar Stock',
      html: `
        <div class="mb-3">
          <label class="form-label">Cantidad a Agregar/Remover</label>
          <input type="number" id="stockAdjustment" class="form-control" value="0">
        </div>
        <div class="mb-3">
          <label class="form-label">Motivo</label>
          <select id="adjustmentReason" class="form-select">
            <option value="restock">Reabastecimiento</option>
            <option value="correction">Corrección de Inventario</option>
            <option value="damage">Producto Dañado</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Notas</label>
          <textarea id="adjustmentNotes" class="form-control" rows="2"></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#198754',
      preConfirm: () => {
        return {
          adjustment: parseInt(document.getElementById('stockAdjustment').value),
          reason: document.getElementById('adjustmentReason').value,
          notes: document.getElementById('adjustmentNotes').value
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const itemRef = firebase.firestore().collection('inventory').doc(itemId);
          const doc = await itemRef.get();
          
          if (!doc.exists) {
            throw new Error('Producto no encontrado');
          }

          const currentStock = doc.data().stock;
          const newStock = currentStock + result.value.adjustment;
          
          if (newStock < 0) {
            throw new Error('El stock no puede ser negativo');
          }

          await itemRef.update({
            stock: newStock,
            lastUpdated: new Date()
          });

          // Registrar movimiento en el historial
          await firebase.firestore().collection('inventory_history').add({
            itemId,
            adjustment: result.value.adjustment,
            reason: result.value.reason,
            notes: result.value.notes,
            previousStock: currentStock,
            newStock,
            timestamp: new Date(),
            userId: firebase.auth().currentUser?.uid
          });

          await loadInventoryData();
          
          Swal.fire({
            title: '¡Stock Actualizado!',
            text: `Stock actual: ${newStock}`,
            icon: 'success',
            confirmButtonColor: '#198754'
          });
        } catch (error) {
          console.error('Error ajustando stock:', error);
          Swal.fire({
            title: 'Error',
            text: error.message || 'No se pudo ajustar el stock',
            icon: 'error',
            confirmButtonColor: '#dc3545'
          });
        }
      }
    });
  };

  window.viewHistory = async function(itemId) {
    try {
      const snapshot = await firebase.firestore()
        .collection('inventory_history')
        .where('itemId', '==', itemId)
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      let historyHtml = `
        <div class="table-responsive" style="max-height: 400px;">
          <table class="table table-sm table-striped">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Ajuste</th>
                <th>Razón</th>
                <th>Stock Final</th>
              </tr>
            </thead>
            <tbody>
      `;

      history.forEach(record => {
        historyHtml += `
          <tr>
            <td>${new Date(record.timestamp.seconds * 1000).toLocaleString()}</td>
            <td class="${record.adjustment >= 0 ? 'text-success' : 'text-danger'}">
              ${record.adjustment >= 0 ? '+' : ''}${record.adjustment}
            </td>
            <td>${record.reason}</td>
            <td>${record.newStock}</td>
          </tr>
        `;
      });

      historyHtml += `
            </tbody>
          </table>
        </div>
      `;

      Swal.fire({
        title: 'Historial de Movimientos',
        html: historyHtml,
        width: '800px',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#6c757d'
      });
    } catch (error) {
      console.error('Error cargando historial:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el historial',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    }
  };

  function checkLowStock(inventory) {
    const lowStockItems = inventory.filter(item => item.stock <= item.minStock);
    
    if (lowStockItems.length > 0) {
      const itemsList = lowStockItems
        .map(item => `<li>${item.name}: ${item.stock} unidades</li>`)
        .join('');

      Swal.fire({
        title: '⚠️ Alerta de Stock',
        html: `
          <p>Los siguientes productos tienen stock bajo:</p>
          <ul class="text-start">${itemsList}</ul>
        `,
        icon: 'warning',
        confirmButtonColor: '#ffc107',
        confirmButtonText: 'Entendido'
      });
    }
  }

  // Inicialización se realiza tras validar permisos en checkAdminAccess
});
