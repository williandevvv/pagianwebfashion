// Sistema de autenticación mejorado
document.addEventListener("DOMContentLoaded", () => {
  console.log("🔐 Auth.js cargado");

  // Referencias a elementos del DOM
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const authButtons = document.getElementById("auth-buttons");
  const profileButton = document.getElementById("profile-button");
  const logoutBtn = document.getElementById("logout-btn");
  const googleLoginBtn = document.querySelector(".google-login-btn");
  const navbarUsername = document.getElementById("navbar-username");

  // Función para mostrar notificaciones
  const showNotification = (message, type = "success") => {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: type,
        title: type === "success" ? "¡Éxito!" : "Error",
        text: message,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } else {
      if (typeof Swal !== 'undefined') {
        Swal.fire({ icon: type, title: message });
      }
    }
  };

  // Función para actualizar UI
  const updateAuthUI = (user) => {
    try {
      if (user) {
        // Usuario autenticado
        if (authButtons) authButtons.classList.add("d-none");
        if (profileButton) {
          profileButton.classList.remove("d-none");
          if (navbarUsername) {
            const displayName = user.displayName || user.email;
            navbarUsername.textContent = displayName;
          }
        }
        const profileLink = document.getElementById('profile-link');
        if (profileLink) profileLink.style.display = 'block';
      } else {
        // Usuario no autenticado
        if (authButtons) authButtons.classList.remove("d-none");
        if (profileButton) profileButton.classList.add("d-none");
        const profileLink = document.getElementById('profile-link');
        if (profileLink) profileLink.style.display = 'none';
      }
    } catch (error) {
      console.error("❌ Error actualizando UI:", error);
    }
  };

  // Verificar si hay usuario offline
  const checkOfflineUser = () => {
    const offlineData = localStorage.getItem("offlineData");
    if (offlineData) {
      try {
        const data = JSON.parse(offlineData);
        if (data.user) {
          updateAuthUI(data.user);
          return data.user;
        }
      } catch (error) {
        console.error("Error leyendo datos offline:", error);
      }
    }
    return null;
  };

  // Escuchar cambios de autenticación de Firebase
  if (typeof firebase !== "undefined" && firebase.auth) {
    firebase.auth().onAuthStateChanged((user) => {
      console.log(
        "👤 Estado de auth cambió:",
        user ? "autenticado" : "no autenticado"
      );
      updateAuthUI(user);
    });
  } else {
    // Si Firebase no está disponible, verificar usuario offline
    setTimeout(() => {
      const offlineUser = checkOfflineUser();
      if (offlineUser) {
        console.log("👤 Usuario offline encontrado");
      }
    }, 1000);
  }

  // Manejar login con email/password
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("🔑 Intentando login...");

      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      try {
        let user;

        // Verificar si Firebase está disponible y no estamos en modo offline
        if (
          (typeof firebase !== "undefined" &&
            firebase.auth &&
            typeof isOffline === "undefined") ||
          !isOffline
        ) {
          try {
            // Intentar login con Firebase
            const userCredential = await firebase
              .auth()
              .signInWithEmailAndPassword(email, password);

            // Obtener datos adicionales del usuario
            let userData = {};
            try {
              const userDoc = await firebase
                .firestore()
                .collection("users")
                .doc(userCredential.user.uid)
                .get();
              userData = userDoc.data() || {};
            } catch (error) {
              console.warn(
                "No se pudieron obtener datos adicionales del usuario"
              );
            }

            user = {
              uid: userCredential.user.uid,
              email: userCredential.user.email,
              displayName:
                userCredential.user.displayName ||
                userData.displayName ||
                "Usuario",
              role: userData.role || "customer",
            };
          } catch (error) {
            console.log("Firebase login falló, intentando modo offline");
            // Si falla Firebase, mostrar error
            console.error("Error de autenticación:", error);
            throw error;
          }
        } else {
          // Firebase no disponible
          throw new Error("Servicio de autenticación no disponible");
        }

        showNotification("¡Bienvenido de vuelta!");
        updateAuthUI(user);

        // Cerrar modal
        const modal = document.getElementById("loginModal");
        if (modal && typeof bootstrap !== "undefined") {
          const modalInstance = bootstrap.Modal.getInstance(modal);
          if (modalInstance) modalInstance.hide();
        }

        // Redirigir según rol
        if (
          user.role === "admin" ||
          user.email === "admin@fashioncollection.com"
        ) {
          setTimeout(() => {
            window.location.href = "admin.html";
          }, 1000);
        } else {
          setTimeout(() => {
            window.location.href = "index.html";
          }, 1000);
        }
      } catch (error) {
        console.error("❌ Error en login:", error);
        let message = "Error al iniciar sesión";

        if (error.code) {
          switch (error.code) {
            case "auth/wrong-password":
              message = "Contraseña incorrecta";
              break;
            case "auth/user-not-found":
              message = "Usuario no encontrado";
              break;
            case "auth/invalid-email":
              message = "Email inválido";
              break;
            case "auth/network-request-failed":
              message = "Sin conexión a internet";
              break;
          }
        } else {
          message = error.message || message;
        }

        showNotification(message, "error");
      }
    });
  }

  // Manejar login con Google
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", async () => {
      try {
        if (typeof firebase !== "undefined" && firebase.auth) {
          const provider = new firebase.auth.GoogleAuthProvider();
          const result = await firebase.auth().signInWithPopup(provider);
          const user = result.user;

          // Buscar si ya existe en Firestore
          const userDoc = await firebase
            .firestore()
            .collection("users")
            .doc(user.uid)
            .get();

          // Si no existe, crearlo
          if (!userDoc.exists) {
            await firebase
              .firestore()
              .collection("users")
              .doc(user.uid)
              .set({
                email: user.email,
                displayName: user.displayName || "Usuario",
                role: "customer",
                createdAt: new Date(),
              });
          }

          // Mostrar bienvenida
          showNotification("¡Bienvenido con Google!");

          // Cerrar modal
          const modal = document.getElementById("loginModal");
          if (modal && typeof bootstrap !== "undefined") {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) modalInstance.hide();
          }

          // Redirigir a perfil (usuario normal)
          setTimeout(() => {
            window.location.href = "index.html";
          }, 1000);
        } else {
          showNotification("Login con Google no disponible", "error");
        }
      } catch (error) {
        console.error("❌ Error en login con Google:", error);
        showNotification("Error al iniciar sesión con Google", "error");
      }
    });
  }

  // Manejar registro
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("📝 Intentando registro...");

      const name = document.getElementById("register-name").value;
      const email = document.getElementById("register-email").value;
      const password = document.getElementById("register-password").value;
      const confirmPassword = document.getElementById("register-confirm").value;

      if (password !== confirmPassword) {
        showNotification("Las contraseñas no coinciden", "error");
        return;
      }

      try {
        if (typeof window.register === "function") {
          await window.register(email, password, name);
          showNotification("¡Registro exitoso!");
          setTimeout(() => {
            window.location.href = "index.html";
          }, 1000);

          // Cerrar modal
          const modal = document.getElementById("registerModal");
          if (modal && typeof bootstrap !== "undefined") {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) modalInstance.hide();
          }
        } else {
          showNotification("Registro no disponible en modo offline", "error");
        }
      } catch (error) {
        console.error("❌ Error en registro:", error);
        let message = "Error al registrar usuario";

        if (error.code) {
          switch (error.code) {
            case "auth/email-already-in-use":
              message = "Este email ya está registrado";
              break;
            case "auth/weak-password":
              message = "La contraseña debe tener al menos 6 caracteres";
              break;
            case "auth/invalid-email":
              message = "Email inválido";
              break;
          }
        } else {
          message = error.message || message;
        }

        showNotification(message, "error");
      }
    });
  }

  // Manejar logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        if (typeof window.logout === "function") {
          await window.logout();
        } else {
          // Fallback offline
          localStorage.removeItem("offlineData");
          showNotification("Sesión cerrada");
        }

        updateAuthUI(null);
        window.location.href = "index.html";
      } catch (error) {
        console.error("❌ Error al cerrar sesión:", error);
        showNotification("Error al cerrar sesión", "error");
      }
    });
  }

  if (typeof firebase !== "undefined") {
    window.register = async (email, password, displayName) => {
      const userCredential = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await user.updateProfile({ displayName });

      await firebase.firestore().collection("users").doc(user.uid).set({
        email: user.email,
        displayName: displayName,
        role: "customer",
        createdAt: new Date(),
      });

      return user;
    };

    window.logout = async () => {
      await firebase.auth().signOut();
    };
  }

  console.log("✅ Sistema de autenticación inicializado");
});
