//dotenv - debe ser lo primero para que las variables de entorno estén disponibles
const env = require('dotenv');
env.config();

//archivos de ejecución
const express = require('express');
const cors = require('cors');
// Carga opcional de compresión (no rompe si no está instalada)
let compression = null;
try { compression = require('compression'); } catch {}
const app = express();

//swagger
const swaggerIU = require('swagger-ui-express')
const specs = require('./swagger/swagger.js')

//cors 
app.use(cors({ 
    origin:"*",
    methods:["GET","POST","PUT","DELETE","PATCH"],
    allowedHeaders:["Content-Type","Authorization"]
}));

//express.json
app.use(express.json());

// gzip si la librería está disponible
if (compression) {
  app.use(compression());
}

// pequeño endpoint de salud para health checks y keep-alive
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});




//ruta
const apiRouter = require('./router/index');
const usuarioRouter = require('./router/usuarioRouter');

app.use('/api', apiRouter);
app.use('/auth', usuarioRouter)


//swagger json
app.use("/api-docs", swaggerIU.serve, swaggerIU.setup(specs))




//server 
const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
    console.log('Servidor en el puerto:', PORT);
});

// Mantiene conexiones HTTP activas más tiempo (útil detrás de proxies)
try {
  server.keepAliveTimeout = 65000; // 65s
  server.headersTimeout = 66000;   // debe ser > keepAliveTimeout
} catch {}
