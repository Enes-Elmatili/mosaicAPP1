const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const api = require('./routes');
const { errorHandler } = require('./middleware/errors');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', api);

app.use(errorHandler);

module.exports = app;
