# 🔧 Solución de Problemas - Fashion Collection

## 🚨 Problemas Comunes y Soluciones

### 1. "Error al iniciar sesión" / "Sin conexión a internet"

**Problema:** La página muestra errores de conexión o no puede iniciar sesión.

**Soluciones:**

#### Opción A: Verificar Conexión
1. ✅ Asegúrate de tener conexión a internet
2. ✅ Intenta abrir otra página web para confirmar
3. ✅ Si no tienes internet, el sistema funcionará en modo offline

#### Opción B: Usar Modo Demo (Sin Internet)
Si no tienes conexión a internet, puedes usar el sistema en modo demo:

1. **Abrir la consola del navegador:**
   - Presiona `F12` o `Ctrl+Shift+I`
   - Ve a la pestaña "Console"

2. **Ejecutar comando de demo:**
   ```javascript
   // Simular login exitoso
   localStorage.setItem('demoUser', JSON.stringify({
       email: 'admin@fashioncollection.com',
       role: 'admin',
       displayName: 'Administrador Demo'
   }));
   
   // Recargar página
   location.reload();
   ```

3. **Usar credenciales demo:**
   - Email: `demo@fashioncollection.com`
   - Contraseña: `demo123`

### 2. "La página se queda cargando"

**Soluciones:**

#### Opción A: Limpiar Caché
1. Presiona `Ctrl+F5` para recargar sin caché
2. O ve a Configuración → Privacidad → Borrar datos de navegación

#### Opción B: Usar Modo Incógnito
1. Presiona `Ctrl+Shift+N` (Chrome) o `Ctrl+Shift+P` (Firefox)
2. Abre el archivo `index.html` en la ventana incógnita

#### Opción C: Cambiar de Navegador
- Prueba con Chrome, Firefox o Edge
- Asegúrate de que el navegador esté actualizado

### 3. "No aparecen los productos"

**Soluciones:**

#### Crear Productos Demo:
1. Abre la consola del navegador (`F12`)
2. Ejecuta este código:

```javascript
// Crear productos demo
const demoProducts = [
    {
        id: 'demo1',
        name: 'Collar de Perlas',
        description: 'Elegante collar de perlas naturales',
        price: 25.99,
        category: 'Bisutería',
        image: 'img/bisuteria.jpg',
        stock: 10,
        featured: true
    },
    {
        id: 'demo2',
        name: 'Aretes de Acero',
        description: 'Aretes modernos de acero inoxidable',
        price: 15.50,
        category: 'Bisutería',
        image: 'img/acero.jpg',
        stock: 15,
        featured: false
    },
    {
        id: 'demo3',
        name: 'Pulsera Acrílica',
        description: 'Pulsera colorida de acrílico',
        price: 12.00,
        category: 'Accesorios',
        image: 'img/acrilico.jpeg',
        stock: 20,
        featured: true
    }
];

// Guardar en localStorage
localStorage.setItem('demoProducts', JSON.stringify(demoProducts));

// Recargar página
location.reload();
```

### 4. "No funciona el carrito"

**Soluciones:**

#### Verificar localStorage:
1. Abre la consola (`F12`)
2. Ve a la pestaña "Application" → "Local Storage"
3. Verifica que exista la entrada "cart"

#### Limpiar carrito:
```javascript
// Limpiar carrito
localStorage.removeItem('cart');
location.reload();
```

### 5. "Error 404 - Archivo no encontrado"

**Soluciones:**

#### Verificar estructura de archivos:
Asegúrate de que todos los archivos estén en la carpeta `d:/PRUEBA2/`:

```
d:/PRUEBA2/
├── index.html
├── login.html
├── admin.html
├── carrito.html
├── firebase-config.js
├── auth.js
├── app.js
├── products.js
├── cart.js
├── orders.js
├── admin.js
└── img/
    ├── bisuteria.jpg
    ├── acero.jpg
    └── ...
```

### 6. "No se pueden subir imágenes"

**Soluciones:**

#### Usar imágenes locales:
1. Coloca las imágenes en la carpeta `img/`
2. Usa rutas relativas: `img/nombre-imagen.jpg`

#### Usar URLs externas:
```javascript
// Ejemplo de URLs de imágenes
const imageUrls = [
    'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Producto+1',
    'https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=Producto+2',
    'https://via.placeholder.com/300x300/45B7D1/FFFFFF?text=Producto+3'
];
```

## 🛠️ Herramientas de Debugging

### 1. Consola del Navegador
- **Abrir:** `F12` → Pestaña "Console"
- **Ver errores:** Los errores aparecen en rojo
- **Ejecutar código:** Escribe JavaScript directamente

### 2. Verificar Estado de Firebase
```javascript
// Verificar si Firebase está cargado
console.log('Firebase:', typeof firebase !== 'undefined' ? '✅ Cargado' : '❌ No cargado');

// Verificar servicios
console.log('Auth:', typeof firebase.auth !== 'undefined' ? '✅ Disponible' : '❌ No disponible');
console.log('Firestore:', typeof firebase.firestore !== 'undefined' ? '✅ Disponible' : '❌ No disponible');
```

### 3. Verificar Datos Locales
```javascript
// Ver datos del carrito
console.log('Carrito:', JSON.parse(localStorage.getItem('cart') || '[]'));

// Ver usuario demo
console.log('Usuario demo:', JSON.parse(localStorage.getItem('demoUser') || 'null'));

// Ver productos demo
console.log('Productos demo:', JSON.parse(localStorage.getItem('demoProducts') || '[]'));
```

## 🌐 Modo Offline Completo

Si no tienes conexión a internet, puedes usar el sistema completamente offline:

### 1. Activar Modo Offline
```javascript
// Ejecutar en la consola
localStorage.setItem('offlineMode', 'true');
localStorage.setItem('demoUser', JSON.stringify({
    email: 'admin@fashioncollection.com',
    role: 'admin',
    displayName: 'Admin Offline'
}));
location.reload();
```

### 2. Funcionalidades Offline
- ✅ Navegación por la tienda
- ✅ Agregar productos al carrito
- ✅ Ver carrito y productos
- ✅ Simular compras
- ❌ No se guardan datos permanentemente
- ❌ No hay sincronización con Firebase

## 📞 Contacto y Soporte

Si ninguna solución funciona:

1. **Verifica la versión del navegador**
2. **Intenta en otro dispositivo**
3. **Revisa que todos los archivos estén presentes**
4. **Usa el modo demo para probar funcionalidades**

---

**¡El sistema está diseñado para funcionar tanto online como offline!** 🎉

Usa las soluciones de esta guía para resolver cualquier problema que encuentres.
