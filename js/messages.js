// Cargar mensajes de contacto en el panel de admin
document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#messagesTable tbody');
    if (!tableBody || typeof firebase === 'undefined') return;

    async function loadMessages() {
        const snapshot = await firebase.firestore()
            .collection('messages')
            .orderBy('createdAt', 'desc')
            .get();
        const rows = snapshot.docs.map(doc => {
            const m = doc.data();
            const fecha = m.createdAt?.seconds ? new Date(m.createdAt.seconds * 1000).toLocaleString() : '';
            return `<tr><td>${fecha}</td><td>${m.name}</td><td>${m.email}</td><td>${m.message}</td></tr>`;
        }).join('');
        tableBody.innerHTML = rows || '<tr><td colspan="4" class="text-center">Sin mensajes</td></tr>';
    }

    window.loadMessages = loadMessages;
});
