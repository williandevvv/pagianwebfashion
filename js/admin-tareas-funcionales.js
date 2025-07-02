// admin-tareas-funcionales.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 admin-tareas-funcionales.js cargado');

    let tareas = [];

    // Cargar tareas existentes desde Firestore
    async function cargarTareas() {
        try {
            const snapshot = await firebase.firestore().collection('tareas').orderBy('fecha', 'desc').get();
            tareas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderizarTareas();
        } catch (error) {
            console.error('Error cargando tareas:', error);
        }
    }

    window.cargarTareas = cargarTareas;

    function renderizarTareas() {
        const tbody = document.querySelector('#tablaTareas tbody');
        if (!tbody) return;

        tbody.innerHTML = tareas.map(tarea => `
            <tr>
                <td>${tarea.tipo}</td>
                <td>${tarea.descripcion}</td>
                <td>${new Date(tarea.fecha.toDate()).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-success ejecutar-tarea" data-id="${tarea.id}">Ejecutar</button>
                    <button class="btn btn-sm btn-danger eliminar-tarea ms-1" data-id="${tarea.id}">Eliminar</button>
                </td>
            </tr>
        `).join('');
    }

    // Evento para ejecutar tarea
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.ejecutar-tarea');
        if (!btn) return;

        const tareaId = btn.dataset.id;
        const tarea = tareas.find(t => t.id === tareaId);
        if (!tarea) return;

        ejecutarTarea(tarea);
    });

    // Evento para eliminar tarea
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.eliminar-tarea');
        if (!btn) return;

        const tareaId = btn.dataset.id;
        const confirm = await Swal.fire({
            title: '¿Eliminar tarea?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc3545'
        });
        if (!confirm.isConfirmed) return;

        try {
            await firebase.firestore().collection('tareas').doc(tareaId).delete();
            Swal.fire({ icon: 'success', title: 'Tarea eliminada' });
            cargarTareas();
        } catch (error) {
            console.error('Error eliminando tarea:', error);
            Swal.fire({ icon: 'error', title: 'No se pudo eliminar la tarea' });
        }
    });

    // Función para ejecutar tareas según tipo
    async function ejecutarTarea(tarea) {
        try {
            switch (tarea.tipo) {
                case 'cambiar_precio':
                    await firebase.firestore().collection('products').doc(tarea.productoId).update({
                        price: tarea.nuevoPrecio
                    });
                    Swal.fire({ icon: 'success', title: `Precio actualizado a L.${tarea.nuevoPrecio}` });
                    break;
                case 'cambiar_stock':
                    await firebase.firestore().collection('products').doc(tarea.productoId).update({
                        stock: tarea.nuevoStock
                    });
                    Swal.fire({ icon: 'success', title: `Stock actualizado a ${tarea.nuevoStock}` });
                    break;
                case 'eliminar_producto':
                    await firebase.firestore().collection('products').doc(tarea.productoId).delete();
                    Swal.fire({ icon: 'success', title: 'Producto eliminado exitosamente' });
                    break;
                default:
                    Swal.fire({ icon: 'error', title: 'Tipo de tarea no reconocido' });
            }
        } catch (error) {
            console.error('Error ejecutando tarea:', error);
            Swal.fire({ icon: 'error', title: 'Error al ejecutar la tarea' });
        }
    }

    cargarTareas();
});
// Evento para mostrar campo según tipo de tarea
document.querySelector('#formTarea select[name="tipo"]').addEventListener('change', (e) => {
    const tipo = e.target.value;
    const campo = document.getElementById('campoValor');
    const label = document.getElementById('labelValor');

    if (tipo === 'cambiar_precio') {
        campo.classList.remove('d-none');
        label.textContent = 'Nuevo Precio';
    } else if (tipo === 'cambiar_stock') {
        campo.classList.remove('d-none');
        label.textContent = 'Nuevo Stock';
    } else {
        campo.classList.add('d-none');
    }
});

// Evento para guardar tarea en Firebase
document.getElementById('formTarea').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const tipo = form.tipo.value;
    const productoId = form.productoId.value;
    const valor = form.valor.value;

    const nuevaTarea = {
        tipo,
        productoId,
        descripcion: tipo === 'cambiar_precio' ? `Nuevo precio: L.${valor}` :
                     tipo === 'cambiar_stock' ? `Nuevo stock: ${valor}` :
                     'Eliminar producto',
        fecha: new Date()
    };

    if (tipo === 'cambiar_precio') nuevaTarea.nuevoPrecio = parseFloat(valor);
    if (tipo === 'cambiar_stock') nuevaTarea.nuevoStock = parseInt(valor);

    try {
        await firebase.firestore().collection('tareas').add(nuevaTarea);
        form.reset();
        bootstrap.Modal.getInstance(document.getElementById('modalAgregarTarea')).hide();
        Swal.fire({ icon: 'success', title: 'Tarea guardada correctamente' });
        cargarTareas(); // recargar tabla
    } catch (error) {
        console.error('Error guardando tarea:', error);
        Swal.fire({ icon: 'error', title: 'No se pudo guardar la tarea' });
    }
});
