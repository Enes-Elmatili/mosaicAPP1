const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const api = require('./routes');
const { errorHandler } = require('./middleware/errors');

const app = express();

app.use(
  helmet({
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
app.use(
  cors({
    origin: ['https://www.mosaicpropertymanagements.com'],
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());

app.use('/api', api);

app.use(errorHandler);

module.exports = app;
