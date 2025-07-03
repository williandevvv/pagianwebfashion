// Comprobación de modo mantenimiento

//document.addEventListener('DOMContentLoaded', () => {
  if (typeof firebase === 'undefined' || !firebase.firestore) {
    console.log('Firebase no disponible, omitiendo verificación de mantenimiento');
    return;
  }

  const db = firebase.firestore();
  const auth = firebase.auth ? firebase.auth() : null;

  function mostrarMensaje() {
    document.body.innerHTML = `
      <div class="d-flex vh-100 justify-content-center align-items-center">
        <div class="text-center">
          <h1 class="mb-3">La página está en mantenimiento</h1>
          <p class="lead">Por favor vuelve más tarde.</p>
        </div>
      </div>`;
  }

  async function obtenerRol(usuario) {
    try {
      const doc = await db.collection('users').doc(usuario.uid).get();
      return doc.data()?.role || 'customer';
    } catch (e) {
      return 'customer';
    }
  }

  function verificarAcceso(activo) {
    if (!activo) return;

    if (auth) {
      auth.onAuthStateChanged(async user => {
        const rol = user ? await obtenerRol(user) : 'customer';
        if (rol !== 'admin') {
          mostrarMensaje();
        }
      });
    } else {
      mostrarMensaje();
    }
  }

  db.collection('settings').doc('system').get()
    .then(doc => {
      const data = doc.data() || {};
      const activo = data.general?.maintenanceMode;
      verificarAcceso(activo);
    })
    .catch(err => console.error('Error obteniendo mantenimiento', err));
});
