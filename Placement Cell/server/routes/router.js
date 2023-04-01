const express = require('express');
const route = express.Router();
const services = require('../service/render');
const controller = require('../controller/controller');

route.get('/', services.home)

route.get('/studentProfile', services.home)

module.exports = route;