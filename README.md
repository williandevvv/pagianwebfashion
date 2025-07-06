# Fashion Collection - Página Web

Este proyecto es una demostración de la tienda en línea **Fashion Collection**. Para ver el sitio sólo necesitas levantar un servidor estático.

## Uso

1. Instala las dependencias (opcional) con `npm install`.
2. Sirve la carpeta del proyecto. Un método sencillo es:

```bash
npx http-server
```

Esto expondrá la aplicación en [http://localhost:8080](http://localhost:8080) u otro puerto disponible.

Además de la página principal, el sitio cuenta con secciones de **Envíos**, **Devoluciones**, **Preguntas Frecuentes** y **Términos y Condiciones** accesibles desde el pie de página.
Adicionalmente, encontrarás una nueva sección de **Galería** con inspiración de looks y accesorios.

## Gestión de pedidos

Al realizar una compra desde el carrito, el pedido se guarda en Firebase Firestore. Cada pedido se almacena en la colección global `orders` y también dentro de `users/<UID>/orders` para que quede asociado a la cuenta del cliente. A partir de esta versión, el documento en Firestore utiliza como identificador el mismo código de pedido mostrado en el panel de administración (por ejemplo `FC-1001`).

En la página **Mi Perfil** se muestran estos pedidos en la pestaña "Pedidos" y la información se actualiza en tiempo real cuando cambia su estado.

## Panel de administración

Desde `admin.html` los usuarios con permisos pueden gestionar productos, usuarios e inventario. Al marcar un pedido como **enviado** desde la sección de pedidos, el sistema actualiza el estado del pedido tanto en la colección global como en la subcolección del usuario. Además se descuenta el stock de los productos involucrados y se registra el movimiento en la colección `inventory_history`.
