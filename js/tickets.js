// Gestión de tickets de soporte
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎫 Tickets.js cargado');

    let tickets = [];
    let offlineTickets = [];
    let currentUser = null;
    let currentTicket = null;

    const useFirebase = typeof firebase !== 'undefined' && firebase.firestore;

    const tableBody = document.querySelector('#ticketsTable tbody');
    const newTicketBtn = document.getElementById('newTicketBtn');
    const newTicketForm = document.getElementById('newTicketForm');
    const replyForm = document.getElementById('ticketReplyForm');
    const ticketStatus = document.getElementById('ticketStatus');

    if (useFirebase && firebase.auth) {
        firebase.auth().onAuthStateChanged(user => {
            currentUser = user;
            if (user) loadTickets();
        });
    } else {
        const offlineData = localStorage.getItem('offlineData');
        if (offlineData) {
            try {
                const data = JSON.parse(offlineData);
                currentUser = data.user || null;
            } catch (e) { console.error('Error leyendo usuario offline', e); }
        }
        loadTickets();
    }

    async function loadTickets() {
        if (!currentUser) return;
        if (useFirebase) {
            try {
                let query = firebase.firestore().collection('tickets');
                if (window.currentUserRole !== 'admin') {
                    query = query.where('usuario.uid', '==', currentUser.uid);
                }
                const snapshot = await query.orderBy('fecha', 'desc').get();
                tickets = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                renderTickets();
                // Notificación de nuevas respuestas
                tickets.forEach(t => {
                    if (t.userUnread && t.usuario?.uid === currentUser.uid) {
                        showNotification('Nuevas respuestas en "' + t.titulo + '"', 'info');
                        firebase.firestore().collection('tickets').doc(t.id).update({ userUnread: false });
                    }
                });
            } catch (err) {
                console.error('Error cargando tickets', err);
            }
        } else {
            try {
                offlineTickets = JSON.parse(localStorage.getItem('offlineTickets') || '[]');
            } catch (e) {
                offlineTickets = [];
            }
            tickets = offlineTickets.filter(t => {
                if (window.currentUserRole !== 'admin') {
                    return t.usuario?.uid === currentUser.uid;
                }
                return true;
            });
            renderTickets();
        }
    }
    window.loadTickets = loadTickets;

    function renderTickets() {
        if (!tableBody) return;
        if (tickets.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Sin tickets</td></tr>';
            return;
        }
        tableBody.innerHTML = tickets.map(t => `
            <tr data-id="${t.id}" class="ticket-row">
                <td>${t.id}</td>
                <td>${t.usuario?.nombre || t.usuario?.email}</td>
                <td>${formatDate(t.fecha)}</td>
                <td>${t.categoria}</td>
                <td><span class="badge priority-${t.prioridad?.toLowerCase()}">${t.prioridad}</span></td>
                <td><span class="badge state-${t.estado.replace(' ', '-').toLowerCase()}">${t.estado}</span></td>
            </tr>`).join('');
    }

    function formatDate(date) {
        const d = date?.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString();
    }

    newTicketBtn?.addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('newTicketModal'));
        modal.show();
    });

    newTicketForm?.addEventListener('submit', async e => {
        e.preventDefault();
        const data = new FormData(newTicketForm);
        const archivo = data.get('archivo');
        const ticket = {
            titulo: data.get('titulo'),
            descripcion: data.get('mensaje'),
            categoria: data.get('categoria'),
            prioridad: data.get('prioridad'),
            estado: 'Abierto',
            usuario: {
                uid: currentUser.uid,
                nombre: currentUser.displayName || currentUser.email,
                email: currentUser.email
            },
            fecha: new Date(),
            mensajes: [{ uid: currentUser.uid, nombre: currentUser.displayName || currentUser.email, mensaje: data.get('mensaje'), fecha: new Date() }]
        };
        if (useFirebase) {
            try {
                const docRef = await firebase.firestore().collection('tickets').add(ticket);
                if (archivo && archivo.size) {
                    const storageRef = firebase.storage().ref().child(`tickets/${docRef.id}/${archivo.name}`);
                    await storageRef.put(archivo);
                    const url = await storageRef.getDownloadURL();
                    await docRef.update({ archivo: url });
                }
                bootstrap.Modal.getInstance(document.getElementById('newTicketModal')).hide();
                newTicketForm.reset();
                showNotification('Ticket enviado', 'success');
                loadTickets();
            } catch (err) {
                console.error('Error enviando ticket', err);
                showNotification('Error al enviar ticket', 'error');
            }
        } else {
            ticket.id = 't' + Date.now();
            offlineTickets.push(ticket);
            localStorage.setItem('offlineTickets', JSON.stringify(offlineTickets));
            bootstrap.Modal.getInstance(document.getElementById('newTicketModal')).hide();
            newTicketForm.reset();
            showNotification('Ticket guardado (offline)', 'success');
            loadTickets();
        }
    });

    document.addEventListener('click', e => {
        const row = e.target.closest('.ticket-row');
        if (!row) return;
        const ticket = tickets.find(t => t.id === row.dataset.id);
        if (ticket) openTicket(ticket);
    });

    function openTicket(ticket) {
        currentTicket = ticket;
        document.getElementById('ticketModalTitle').textContent = ticket.titulo;
        const details = document.getElementById('ticketDetails');
        details.innerHTML = `
            <p><strong>Categoría:</strong> ${ticket.categoria}</p>
            <p><strong>Prioridad:</strong> ${ticket.prioridad}</p>
            <p><strong>Estado:</strong> ${ticket.estado}</p>
            <p>${ticket.descripcion}</p>
            ${ticket.archivo ? `<p><a href="${ticket.archivo}" target="_blank">Ver adjunto</a></p>` : ''}`;
        const msgs = document.getElementById('ticketMessages');
        msgs.innerHTML = (ticket.mensajes || []).map(m => `
            <div class="mb-2">
                <small class="text-muted">${formatDate(m.fecha)} - ${m.nombre}</small>
                <div>${m.mensaje}</div>
            </div>`).join('');
        if (window.currentUserRole === 'admin') {
            document.getElementById('ticketAdminControls').classList.remove('d-none');
            ticketStatus.value = ticket.estado;
        } else {
            document.getElementById('ticketAdminControls').classList.add('d-none');
        }
        const modal = new bootstrap.Modal(document.getElementById('viewTicketModal'));
        modal.show();
    }

    replyForm?.addEventListener('submit', async e => {
        e.preventDefault();
        if (!currentTicket) return;
        const text = document.getElementById('replyText').value;
        if (useFirebase) {
            const update = {
                mensajes: firebase.firestore.FieldValue.arrayUnion({
                    uid: currentUser.uid,
                    nombre: currentUser.displayName || currentUser.email,
                    mensaje: text,
                    fecha: new Date()
                })
            };
            if (window.currentUserRole === 'admin') {
                update.estado = ticketStatus.value;
                update.userUnread = true;
            }
            try {
                await firebase.firestore().collection('tickets').doc(currentTicket.id).update(update);
                bootstrap.Modal.getInstance(document.getElementById('viewTicketModal')).hide();
                showNotification('Respuesta enviada');
                loadTickets();
            } catch (err) {
                console.error('Error enviando respuesta', err);
                showNotification('Error al responder', 'error');
            }
        } else {
            const idx = offlineTickets.findIndex(t => t.id === currentTicket.id);
            if (idx !== -1) {
                const msg = {
                    uid: currentUser.uid,
                    nombre: currentUser.displayName || currentUser.email,
                    mensaje: text,
                    fecha: new Date()
                };
                offlineTickets[idx].mensajes.push(msg);
                if (window.currentUserRole === 'admin') {
                    offlineTickets[idx].estado = ticketStatus.value;
                }
                localStorage.setItem('offlineTickets', JSON.stringify(offlineTickets));
                bootstrap.Modal.getInstance(document.getElementById('viewTicketModal')).hide();
                showNotification('Respuesta enviada (offline)');
                loadTickets();
            }
        }
    });
});
