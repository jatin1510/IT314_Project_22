const express = require('express');
const route = express.Router();
const services = require('../service/render');
const controller = require('../controller/controller');

/**
  * @description Root Route
  * @method GET /
  */
route.get('/', services.home);

/**
  * @description Register Routes
  * @method POST /
  */
route.post('/registerStudent', controller.registerStudent);
route.post('/registerCompany', controller.registerCompany);
route.post('/registerAdmin', controller.registerAdmin);
route.post('/postJob', controller.postJob);

/**
  * @description Login Route
  * @method GET /
  */
route.get('/login', controller.findPerson);

/**
  * @description Update Routes
  * @method GET /
  */
route.get('/update', controller.updateUser);

route.get('/sjr', controller.registredStudentsInJob);

module.exports = route;