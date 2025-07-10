# Fashion Collection - Página Web

Este proyecto es una demostración de la tienda en línea **Fashion Collection**. Para ver el sitio sólo necesitas levantar un servidor estático.

## Uso

1. Sirve la carpeta del proyecto con un servidor estático. Un método sencillo es:

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

El panel también incluye un sistema de **Tickets de Soporte**. Si la conexión con Firebase no está disponible, los tickets y sus respuestas se guardan localmente mediante `localStorage` para que puedan consultarse más tarde.

## Limpieza de URLs

Este proyecto incluye un archivo `.htaccess` que permite acceder a las páginas sin especificar la extensión `.html`.
Al desplegar el sitio en un servidor Apache (por ejemplo en Hostinger), asegúrate de que `mod_rewrite` esté habilitado.
Con esta regla podrás visitar `/ofertas` en lugar de `/ofertas.html`.

## Módulo React

Se añadió un pequeño proyecto React en `src/react` para ejemplificar componentes
dínamicos con animaciones de **Framer Motion**.

### Comandos básicos

```bash
cd src/react
npm install       # instala dependencias
npm run dev       # modo desarrollo
npm run build     # genera versión de producción
```

El resultado de la compilación quedará en `src/react/dist/`. Puedes servir esos
archivos de la misma forma que el resto del sitio.

### Nueva galería animada de maquillaje

La página `maquillaje.html` incluye un contenedor React que muestra una pequeña
galería con efectos en tonos pastel. Está implementada con **Framer Motion** y
puedes personalizarla desde `src/react/src/components/MakeupGallery.jsx`.

### Animación en la página principal

`index.html` ahora cuenta con el contenedor `index-react-root`, el cual renderiza
el componente `HeroAnimation` para mostrar un mensaje de bienvenida con efectos
de entrada.

