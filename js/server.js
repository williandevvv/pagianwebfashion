const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8080;

// Directorio raíz del proyecto (un nivel arriba de esta carpeta)
const rootDir = path.join(__dirname, '..');

// Middleware para servir archivos estáticos
app.use(express.static(rootDir));

// Middleware para soportar URLs sin extensión '.html'
app.use((req, res, next) => {
  const potentialHtml = path.join(rootDir, `${req.path.replace(/\/$/, '')}.html`);
  if (fs.existsSync(potentialHtml)) {
    return res.sendFile(potentialHtml);
  }
  next();
});

// Ruta fallback para siempre entregar index.html si no encuentra una ruta
app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});
