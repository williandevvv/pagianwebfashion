# 🔥 Guía Completa de Firebase para Fashion Collection

## 📊 Cómo Ver los Datos Guardados en Firebase

### 1. Acceder a Firebase Console

1. **Ir a Firebase Console:**
   - Visita: https://console.firebase.google.com/
   - Inicia sesión con tu cuenta de Google

2. **Seleccionar el Proyecto:**
   - Busca y selecciona el proyecto: `fashioncollectionhn`
   - Si no aparece, verifica que estés usando la cuenta correcta

### 2. Ver Datos en Firestore Database

#### 📁 Colecciones Principales:

**A. Colección `users` (Usuarios)**
```
📂 users/
├── [userId1]/
│   ├── email: "admin@fashioncollection.com"
│   ├── role: "admin"
│   ├── displayName: "Administrador"
│   ├── createdAt: [timestamp]
│   └── ...
├── [userId2]/
│   ├── email: "usuario@ejemplo.com"
│   ├── role: "user"
│   ├── displayName: "Usuario Normal"
│   └── ...
```

**B. Colección `products` (Productos)**
```
📂 products/
├── [productId1]/
│   ├── name: "Collar de Perlas"
│   ├── description: "Elegante collar..."
│   ├── category: "Bisutería"
│   ├── price: 25.99
│   ├── stock: 10
│   ├── featured: true
│   ├── image: "https://..."
│   ├── createdAt: [timestamp]
│   └── updatedAt: [timestamp]
```

**C. Colección `orders` (Pedidos)**
```
📂 orders/
├── [orderId1]/
│   ├── userId: "abc123"
│   ├── userEmail: "cliente@ejemplo.com"
│   ├── items: [array de productos]
│   ├── shippingInfo: {objeto con dirección}
│   ├── subtotal: 50.00
│   ├── shipping: 5.00
│   ├── total: 55.00
│   ├── status: "pending"
│   ├── createdAt: [timestamp]
│   └── updatedAt: [timestamp]
```

**D. Colección `newsletter` (Suscriptores)**
```
📂 newsletter/
├── [subscriptionId1]/
│   ├── email: "suscriptor@ejemplo.com"
│   └── createdAt: [timestamp]
```

### 3. Pasos para Ver los Datos:

#### 🔍 **Paso 1: Acceder a Firestore**
1. En Firebase Console, haz clic en **"Firestore Database"** en el menú lateral
2. Verás todas las colecciones disponibles

#### 🔍 **Paso 2: Explorar Colecciones**
1. Haz clic en cualquier colección (ej: `users`, `products`, `orders`)
2. Verás todos los documentos dentro de esa colección
3. Cada documento tiene un ID único

#### 🔍 **Paso 3: Ver Detalles de Documentos**
1. Haz clic en cualquier documento para ver sus campos
2. Puedes editar los valores directamente desde la consola
3. Los timestamps se muestran en formato legible

### 4. Ver Datos en Authentication

#### 👥 **Usuarios Registrados:**
1. Ve a **"Authentication"** en el menú lateral
2. Haz clic en la pestaña **"Users"**
3. Verás todos los usuarios registrados con:
   - UID (identificador único)
   - Email
   - Fecha de creación
   - Último inicio de sesión

### 5. Ver Archivos en Storage

#### 📁 **Imágenes de Productos:**
1. Ve a **"Storage"** en el menú lateral
2. Navega a la carpeta `products/`
3. Verás todas las imágenes subidas
4. Puedes descargar o eliminar archivos

### 6. Monitorear en Tiempo Real

#### 📊 **Analytics y Métricas:**
1. Ve a **"Analytics"** para ver estadísticas de uso
2. **"Performance"** para métricas de rendimiento
3. **"Crashlytics"** para errores (si está configurado)

## 🛠️ Herramientas Útiles para Desarrolladores

### 1. Firebase CLI (Línea de Comandos)
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Ver proyectos
firebase projects:list

# Exportar datos
firebase firestore:export ./backup

# Importar datos
firebase firestore:import ./backup
```

### 2. Emuladores Locales
```bash
# Iniciar emuladores
firebase emulators:start

# Solo Firestore
firebase emulators:start --only firestore

# Solo Authentication
firebase emulators:start --only auth
```

### 3. Reglas de Seguridad

#### **Firestore Rules (firestore.rules):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios pueden leer/escribir sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Productos: lectura pública, escritura solo admin
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Pedidos: solo el usuario propietario o admin
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

#### **Storage Rules (storage.rules):**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🔧 Comandos Útiles para Debugging

### 1. Consultas desde la Consola del Navegador
```javascript
// Obtener todos los productos
firebase.firestore().collection('products').get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log(doc.id, doc.data());
    });
  });

// Obtener usuario actual
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log('Usuario:', user);
    firebase.firestore().collection('users').doc(user.uid).get()
      .then(doc => console.log('Datos del usuario:', doc.data()));
  }
});

// Obtener pedidos del usuario
const userId = firebase.auth().currentUser.uid;
firebase.firestore().collection('orders')
  .where('userId', '==', userId)
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log('Pedido:', doc.id, doc.data());
    });
  });
```

### 2. Verificar Conexión
```javascript
// Verificar estado de conexión
firebase.firestore().enableNetwork()
  .then(() => console.log('Conectado a Firestore'))
  .catch(err => console.error('Error de conexión:', err));

// Escuchar cambios de conexión
firebase.firestore().onSnapshotsInSync(() => {
  console.log('Sincronizado con Firestore');
});
```

## 📈 Métricas y Análisis

### 1. Datos que se Guardan Automáticamente:
- **Usuarios registrados** y sus perfiles
- **Productos** agregados por administradores
- **Pedidos** realizados por usuarios
- **Suscripciones** al newsletter
- **Imágenes** subidas al storage

### 2. Métricas Disponibles:
- Número total de usuarios
- Productos más vendidos
- Ingresos totales
- Pedidos por estado
- Productos con bajo stock

### 3. Reportes Personalizados:
```javascript
// Ventas por mes
firebase.firestore().collection('orders')
  .where('createdAt', '>=', startOfMonth)
  .where('createdAt', '<=', endOfMonth)
  .get()
  .then(snapshot => {
    const totalSales = snapshot.docs.reduce((sum, doc) => 
      sum + doc.data().total, 0);
    console.log('Ventas del mes:', totalSales);
  });
```

## 🚨 Solución de Problemas Comunes

### 1. "Permission denied"
- Verificar reglas de seguridad en Firestore
- Asegurar que el usuario esté autenticado
- Verificar roles de usuario

### 2. "Network error"
- Verificar conexión a internet
- Verificar configuración de Firebase
- Revisar CORS si es necesario

### 3. "Quota exceeded"
- Verificar límites de uso en Firebase Console
- Optimizar consultas para reducir lecturas
- Considerar upgrade del plan

---

**¡Con esta guía podrás monitorear y gestionar todos los datos de Fashion Collection en Firebase!** 🎉
