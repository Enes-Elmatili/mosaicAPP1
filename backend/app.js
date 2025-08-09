const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { randomUUID } = require('crypto');
const path = require('path');

const api = require('./routes');
const { errorHandler } = require('./middleware/errors');

const app = express();

// Sécurité Helmet (avec politique CORP et CSP adaptées)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'https://www.mosaicpropertymanagements.com'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        manifestSrc: ["'self'"],
      },
    },
  })
);

// CORS dynamique basé sur ALLOWED_ORIGINS
app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
        .split(',')
        .map(s => s.trim());
      if (!origin || allowed.includes(origin)) return cb(null, true);
      return cb(new Error('CORS not allowed'), false);
    },
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Cookie parser (nécessaire pour authent et sessions)
app.use(cookieParser());

// Logger simple avec request-id
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || randomUUID();
  const start = Date.now();
  res.setHeader('x-request-id', req.id);
  res.on('finish', () => {
    console.log(JSON.stringify({
      t: new Date().toISOString(),
      id: req.id,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      dur_ms: Date.now() - start,
      ip: req.ip,
    }));
  });
  next();
});

// Body parser
app.use(express.json());

// Fichiers statiques (uploads & contrats)
const uploadDir = process.env.LOCAL_UPLOAD_DIR || 'uploads';
const publicBase = process.env.PUBLIC_UPLOAD_BASE || '/uploads';
app.use(publicBase, express.static(path.join(process.cwd(), uploadDir), { maxAge: '1h' }));
app.use('/contracts', express.static(path.join(process.cwd(), 'contracts'), { maxAge: '1h' }));

// API principale
app.use('/api', api);

// Swagger UI
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const openapiSpec = YAML.load(path.join(__dirname, '../openapi.yaml'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, { explorer: true }));

// Middleware de gestion des erreurs
app.use(errorHandler);

module.exports = app;
