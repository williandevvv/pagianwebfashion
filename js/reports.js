// Importar SheetJS
import * as XLSX from 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm';

// Datos demo para modo offline
const DEMO_DATA = {
    inventory: [
        {
            'ID': 'INV001',
            'Producto': 'Producto Demo',
            'Categoría': 'General',
            'Stock Actual': 20,
            'Stock Mínimo': 5,
            'Última Actualización': new Date().toLocaleString('es-ES'),
            'Estado': 'OK'
        }
    ],
    sales: [
        {
            'ID Pedido': 'ORD001',
            'Cliente': 'demo@demo.com',
            'Fecha': new Date().toLocaleString('es-ES'),
            'Total': 'L100',
            'Estado': 'completado',
            'Productos': 'Producto Demo (1)'
        }
    ],
    products: [
        {
            'ID': 'PROD001',
            'Nombre': 'Producto Demo',
            'Categoría': 'General',
            'Precio': 'L100',
            'Stock': 20,
            'Estado': 'Activo',
            'Descripción': '-'
        }
    ],
    users: [
        {
            'ID': 'USR001',
            'Nombre': 'Usuario Demo',
            'Email': 'demo@demo.com',
            'Rol': 'admin',
            'Estado': 'active',
            'Último Acceso': new Date().toLocaleString('es-ES')
        }
    ]
};

let salesChartInstance;
let categoryChartInstance;

// Función para cargar la sección de reportes
export function loadReportsSection() {
    const reportsContainer = document.querySelector('#reports-section .container-fluid');
    if (reportsContainer) {
        reportsContainer.innerHTML = `
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-box me-2"></i>Reporte de Inventario</h5>
                        </div>
                        <div class="card-body">
                            <p>Genera un reporte detallado del inventario actual, incluyendo stock, categorías y estados.</p>
                            <button class="btn btn-primary" onclick="generateExcelReport('inventory')">
                                <i class="fas fa-download me-1"></i>Descargar Reporte
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-shopping-cart me-2"></i>Reporte de Ventas</h5>
                        </div>
                        <div class="card-body">
                            <p>Genera un reporte de todas las ventas, incluyendo detalles de pedidos y totales.</p>
                            <button class="btn btn-primary" onclick="generateExcelReport('sales')">
                                <i class="fas fa-download me-1"></i>Descargar Reporte
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-tshirt me-2"></i>Reporte de Productos</h5>
                        </div>
                        <div class="card-body">
                            <p>Genera un reporte completo de todos los productos, incluyendo precios y estados.</p>
                            <button class="btn btn-primary" onclick="generateExcelReport('products')">
                                <i class="fas fa-download me-1"></i>Descargar Reporte
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-users me-2"></i>Reporte de Usuarios</h5>
                        </div>
                        <div class="card-body">
                            <p>Genera un reporte de usuarios registrados y sus detalles.</p>
                            <button class="btn btn-primary" onclick="generateExcelReport('users')">
                                <i class="fas fa-download me-1"></i>Descargar Reporte
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Actualizar métricas y gráficas
export async function refreshReports() {
    const [inventory, sales, products, users] = await Promise.all([
        getInventoryData(),
        getSalesData(),
        getProductsData(),
        getUsersData()
    ]);

    // Estadísticas rápidas
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = sales.length;
    document.getElementById('totalUsers').textContent = users.length;
    const lowStock = inventory.filter(i => i['Estado'] === 'Stock Bajo').length;
    document.getElementById('lowStockCount').textContent = lowStock;

    renderSalesChart(sales);
    renderCategoryChart(products);
}

function renderSalesChart(sales) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    const totals = {};
    sales.forEach(s => {
        const fecha = s['Fecha'] || s.createdAt || new Date();
        const mes = new Date(fecha).toLocaleDateString('es-ES', { month: 'short' });
        const monto = parseFloat(String(s['Total']).replace('L', '')) || 0;
        totals[mes] = (totals[mes] || 0) + monto;
    });
    const labels = Object.keys(totals);
    const data = Object.values(totals);
    if (salesChartInstance) salesChartInstance.destroy();
    salesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Ventas',
                data,
                backgroundColor: '#6a0dad'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function renderCategoryChart(products) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    const counts = {};
    products.forEach(p => {
        counts[p['Categoría']] = (counts[p['Categoría']] || 0) + 1;
    });
    const labels = Object.keys(counts);
    const data = Object.values(counts);
    if (categoryChartInstance) categoryChartInstance.destroy();
    categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{ data, backgroundColor: ['#6a0dad', '#c06c84', '#bd8c7d', '#f4e4e1'] }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

// Función para generar reportes en Excel
export async function generateExcelReport(type) {
    try {
        let data = [];
        let fileName = '';
        let sheetName = '';

        switch (type) {
            case 'inventory':
                data = await getInventoryData();
                fileName = 'Reporte_Inventario';
                sheetName = 'Inventario';
                break;
            case 'sales':
                data = await getSalesData();
                fileName = 'Reporte_Ventas';
                sheetName = 'Ventas';
                break;
            case 'products':
                data = await getProductsData();
                fileName = 'Reporte_Productos';
                sheetName = 'Productos';
                break;
            case 'users':
                data = await getUsersData();
                fileName = 'Reporte_Usuarios';
                sheetName = 'Usuarios';
                break;
            default:
                throw new Error('Tipo de reporte no válido');
        }

        // Crear workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Agregar worksheet al workbook
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        // Guardar archivo
        XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);

        // Mostrar notificación de éxito
        Swal.fire({
            title: '¡Reporte Generado!',
            text: 'El reporte se ha descargado correctamente',
            icon: 'success',
            confirmButtonColor: '#28a745'
        });

    } catch (error) {
        console.error('Error generando reporte:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo generar el reporte',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    }
}

// Funciones auxiliares para obtener datos
async function getInventoryData() {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const snapshot = await firebase.firestore().collection('inventory').get();
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    'ID': doc.id,
                    'Producto': data.name,
                    'Categoría': data.category,
                    'Stock Actual': data.stock,
                    'Stock Mínimo': data.minStock,
                    'Última Actualización': data.lastUpdated ? new Date(data.lastUpdated.seconds * 1000).toLocaleString('es-ES') : '-',
                    'Estado': data.stock <= data.minStock ? 'Stock Bajo' : 'OK'
                };
            });
        }
    } catch (e) {
        console.error('Error cargando inventario', e);
    }
    return DEMO_DATA.inventory;
}

async function getSalesData() {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const snapshot = await firebase.firestore().collection('orders').get();
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    'ID Pedido': doc.id,
                    'Cliente': data.userEmail,
                    'Fecha': data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString('es-ES') : '-',
                    'Total': `L${data.total || 0}`,
                    'Estado': data.status,
                    'Productos': data.items?.map(item => `${item.name} (${item.quantity})`).join(', ') || '-'
                };
            });
        }
    } catch (e) {
        console.error('Error cargando ventas', e);
    }
    return DEMO_DATA.sales;
}

async function getProductsData() {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const snapshot = await firebase.firestore().collection('products').get();
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    'ID': doc.id,
                    'Nombre': data.name,
                    'Categoría': data.category,
                    'Precio': `L${data.price}`,
                    'Stock': data.stock,
                    'Estado': data.status ? 'Activo' : 'Inactivo',
                    'Descripción': data.description || '-'
                };
            });
        }
    } catch (e) {
        console.error('Error cargando productos', e);
    }
    return DEMO_DATA.products;
}

async function getUsersData() {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const snapshot = await firebase.firestore().collection('users').get();
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    'ID': doc.id,
                    'Nombre': data.displayName,
                    'Email': data.email,
                    'Rol': data.role,
                    'Estado': data.status || 'active',
                    'Último Acceso': data.lastAccess ? new Date(data.lastAccess.seconds * 1000).toLocaleString('es-ES') : '-'
                };
            });
        }
    } catch (e) {
        console.error('Error cargando usuarios', e);
    }
    return DEMO_DATA.users;
}
