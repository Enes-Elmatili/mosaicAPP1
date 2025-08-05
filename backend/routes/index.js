const { Router } = require('express');
const roles = require('./roles');
const permissions = require('./permissions');

const api = Router();
api.use('/me', require('./me'));

api.use('/roles', roles);
api.use('/permissions', permissions);

module.exports = api;
