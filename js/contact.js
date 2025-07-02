// Manejo de formulario de contacto
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cs-form-1750');
    if (!form || typeof firebase === 'undefined') return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: form.querySelector('#name-1750').value,
            email: form.querySelector('#email-1750').value,
            phone: form.querySelector('#phone-1750').value,
            message: form.querySelector('#message-1750').value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        try {
            await firebase.firestore().collection('messages').add(data);
            Swal.fire({ icon: 'success', title: 'Mensaje enviado correctamente' });
            form.reset();
        } catch (err) {
            console.error('Error enviando mensaje', err);
            Swal.fire({ icon: 'error', title: 'No se pudo enviar el mensaje' });
        }
    });
});
