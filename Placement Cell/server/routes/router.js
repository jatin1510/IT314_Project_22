const express = require('express');
const route = express.Router();
const services = require('../service/render');
const controller = require('../controller/controller');


route.get('/', services.home)

route.get('/studentProfile', services.home)

route.get('/companyProfile', services.companyProfile)

route.get('/postJob', controller.postJob)

module.exports = route;