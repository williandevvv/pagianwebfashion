# Fashion Collection - Sistema de E-commerce

## 🚀 Descripción del Proyecto

Fashion Collection es un sistema completo de e-commerce desarrollado con HTML, CSS, JavaScript y Firebase como backend. El sistema incluye funcionalidades para usuarios regulares y administradores.

## 📋 Características Principales

### Para Usuarios:
- ✅ Registro e inicio de sesión
- ✅ Navegación por categorías de productos
- ✅ Búsqueda y filtros de productos
- ✅ Carrito de compras con persistencia
- ✅ Proceso de checkout
- ✅ Gestión de perfil personal
- ✅ Historial de pedidos

### Para Administradores:
- ✅ Dashboard con métricas en tiempo real
- ✅ Gestión completa de productos (CRUD)
- ✅ Administración de pedidos y estados
- ✅ Control de inventario y stock
- ✅ Gestión de usuarios y roles
- ✅ Reportes y analytics

## 🔧 Configuración e Instalación

### Prerrequisitos:
1. **Conexión a Internet** (requerida para Firebase)
2. **Navegador web moderno** (Chrome, Firefox, Safari, Edge)
3. **Cuenta de Firebase** (gratuita)

### Pasos de Configuración:

#### 1. Configurar Firebase:
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa el existente: `fashioncollectionhn`
3. Habilita los siguientes servicios:
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Storage**
   - **Analytics** (opcional)

#### 2. Configurar Authentication:
1. En Firebase Console → Authentication → Sign-in method
2. Habilita "Email/Password"
3. Opcionalmente habilita "Google" para login social

#### 3. Configurar Firestore:
1. En Firebase Console → Firestore Database
2. Crear base de datos en modo "test" inicialmente
3. Las reglas de seguridad se configurarán automáticamente

#### 4. Configurar Storage:
1. En Firebase Console → Storage
2. Crear bucket de almacenamiento
3. Configurar reglas para subida de imágenes

## 🔐 Credenciales de Administrador

**Email:** `admin@fashioncollection.com`  
**Contraseña:** `fashionroot`

> **Nota:** El usuario administrador se crea automáticamente la primera vez que se ejecuta la aplicación.

## 📁 Estructura del Proyecto

```
fashion-collection/
├── index.html              # Página principal
├── login.html              # Sistema de autenticación
├── admin.html              # Panel de administración
├── carrito.html            # Carrito de compras
├── bisuteria.html          # Catálogo de bisutería
├── perfil.html             # Perfil de usuario
├── firebase-config.js      # Configuración de Firebase
├── auth.js                 # Gestión de autenticación
├── products.js             # Gestión de productos
├── cart.js                 # Funcionalidad del carrito
├── orders.js               # Gestión de pedidos
├── admin.js                # Funcionalidades administrativas
├── app.js                  # Aplicación principal
└── README.md               # Este archivo
```

## 🌐 Cómo Usar la Aplicación

### Para Usuarios Regulares:

1. **Acceder a la aplicación:**
   - Abrir `index.html` en el navegador
   - Navegar por los productos disponibles

2. **Crear cuenta:**
   - Hacer clic en "Registrarse"
   - Completar el formulario de registro
   - Verificar email si es necesario

3. **Iniciar sesión:**
   - Hacer clic en "Iniciar Sesión"
   - Ingresar email y contraseña
   - Acceder al perfil personalizado

4. **Comprar productos:**
   - Navegar por categorías
   - Agregar productos al carrito
   - Proceder al checkout
   - Completar información de envío

### Para Administradores:

1. **Acceder al panel de administración:**
   - Ir a `login.html`
   - Usar las credenciales de administrador
   - Serás redirigido automáticamente a `admin.html`

2. **Gestionar productos:**
   - Agregar nuevos productos
   - Editar productos existentes
   - Subir imágenes de productos
   - Controlar inventario

3. **Gestionar pedidos:**
   - Ver todos los pedidos
   - Cambiar estados de pedidos
   - Generar reportes

## 🔧 Solución de Problemas

### Error: "No se puede conectar a Firebase"
- **Causa:** Falta de conexión a internet
- **Solución:** Verificar conexión a internet y reintentar

### Error: "Usuario no encontrado"
- **Causa:** El usuario administrador no se ha creado
- **Solución:** Esperar a que la aplicación cree automáticamente el usuario admin

### Error: "Permisos insuficientes"
- **Causa:** Reglas de Firestore muy restrictivas
- **Solución:** Verificar reglas de seguridad en Firebase Console

### Error: "No se pueden cargar las imágenes"
- **Causa:** Storage no configurado correctamente
- **Solución:** Verificar configuración de Firebase Storage

## 📱 Compatibilidad

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Dispositivos móviles (responsive design)

## 🔒 Seguridad

- Autenticación segura con Firebase Auth
- Validación de datos en frontend y backend
- Reglas de seguridad en Firestore
- Protección contra inyección de código
- Gestión segura de archivos en Storage

## 📊 Funcionalidades Técnicas

### Frontend:
- **HTML5** semántico
- **CSS3** con Bootstrap 5
- **JavaScript ES6+**
- **Responsive Design**
- **PWA Ready**

### Backend:
- **Firebase Authentication**
- **Firestore Database**
- **Firebase Storage**
- **Cloud Functions** (opcional)

### Librerías Utilizadas:
- Bootstrap 5.3.0
- Font Awesome 6.4.0
- SweetAlert2
- Chart.js (para gráficos)
- DataTables (para tablas)

## 🚀 Despliegue

### Opción 1: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Opción 2: Netlify
1. Subir archivos a repositorio Git
2. Conectar repositorio con Netlify
3. Configurar build settings
4. Desplegar automáticamente

### Opción 3: Servidor Local
```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx http-server

# Con PHP
php -S localhost:8000
```

## 📞 Soporte

Si encuentras algún problema o necesitas ayuda:

1. **Verificar conexión a internet**
2. **Revisar la consola del navegador** para errores
3. **Verificar configuración de Firebase**
4. **Consultar la documentación de Firebase**

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

---

**Desarrollado con ❤️ para Fashion Collection Honduras**
