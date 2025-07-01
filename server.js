const express = require('express');
const path = require('path');

const app = express();
const port = 8080;

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Ruta fallback para siempre entregar index.html si no encuentra una ruta
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});
