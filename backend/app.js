import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import path from 'path';
import api from './routes/index.js';
import { errorHandler } from './middleware/errors.js';

const app = express();

// 1) Proxy
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// 2) Sécurité
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production'
        ? undefined
        : {
            directives: {
              defaultSrc: ["'self'"],
              connectSrc: [
                "'self'",
                'http://localhost:5173',
                'http://localhost:5174',
                'http://localhost:5175',
                'http://localhost:3000',
                'ws://localhost:5173',
                'ws://localhost:5174',
                'ws://localhost:5175',
                'ws://localhost:3000',
                'https://www.mosaicpropertymanagements.com',
              ],
              scriptSrc: ["'self'", "'unsafe-inline'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'https:'],
              fontSrc: ["'self'", 'https://fonts.gstatic.com'],
              manifestSrc: ["'self'"],
            },
          },
  })
);

// 3) CORS
const rawAllowed =
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:5173,http://localhost:5174,http://localhost:5175";

const allowedList = rawAllowed.split(",").map((s) => s.trim()).filter(Boolean);

function isOriginAllowed(origin) {
  if (!origin) return true; // Postman/curl
  return allowedList.includes(origin);
}

app.use((req, res, next) => {
  res.setHeader("Vary", "Origin");
  next();
});

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || isOriginAllowed(origin)) {
        return cb(null, origin || true); // ✅ renvoie l'origine autorisée
      }
      return cb(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "x-master-key",
      "x-user-id",
      "x-user-role",
    ],
    exposedHeaders: ["x-request-id"],
    maxAge: 600,
  })
);

// 4) Parsers
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 5) Logger minimal
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || randomUUID();
  const start = Date.now();
  res.setHeader('x-request-id', req.id);
  res.on('finish', () => {
    console.log(
      JSON.stringify({
        t: new Date().toISOString(),
        id: req.id,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        dur_ms: Date.now() - start,
        ip: req.ip,
      })
    );
  });
  next();
});

// 6) Static files
const uploadDir = process.env.LOCAL_UPLOAD_DIR || 'uploads';
const publicBase = process.env.PUBLIC_UPLOAD_BASE || '/uploads';
app.use(
  publicBase,
  express.static(path.join(process.cwd(), uploadDir), { maxAge: '1h' })
);
app.use(
  '/contracts',
  express.static(path.join(process.cwd(), 'contracts'), { maxAge: '1h' })
);

// 7) Healthcheck
app.get('/health', (_req, res) => res.json({ ok: true }));

// 8) API routes
app.use('/api', api);

// 9) Swagger
if (process.env.NODE_ENV !== 'production') {
  try {
    const swaggerUi = await import('swagger-ui-express');
    const YAML = await import('yamljs');
    const openapiSpec = YAML.default.load(
      path.join(process.cwd(), 'openapi.yaml')
    );
    app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(openapiSpec, { explorer: true })
    );
  } catch {
    console.warn('[Swagger] non chargé');
  }
}

// 10) 404 + error handler
app.use((req, res) =>
  res.status(404).json({ error: 'Not Found', path: req.originalUrl })
);
app.use(errorHandler);

export default app;
