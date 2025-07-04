# Pagian Web Fashion

Este proyecto utiliza un pequeño servidor en Express para servir el contenido.

## Uso

1. Instale las dependencias con `npm install`.
2. Inicie el servidor ejecutando:

```bash
npm start
```

El comando inicia `js/server.js`, que expone la aplicación en [http://localhost:8080](http://localhost:8080).

Además de la página principal, el sitio cuenta con secciones de **Envíos**, **Devoluciones**, **Preguntas Frecuentes** y **Términos y Condiciones** accesibles desde el pie de página.

## Gestión de pedidos

Al realizar una compra desde el carrito, el pedido se guarda en Firebase Firestore. Cada pedido se almacena en la colección global `orders` y también dentro de `users/<UID>/orders` para que quede asociado a la cuenta del cliente.

En la página **Mi Perfil** se muestran estos pedidos en la pestaña "Pedidos" y la información se actualiza en tiempo real cuando cambia su estado.
