const express = require('express');
const route = express.Router();
const services = require('../service/render');
const controller = require('../controller/controller');
const { authorization, authorizationAdmin } = require('../middleware/middleware');

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

/**
  * @description Login Route
  * @method GET /
  */
route.get('/login', controller.findPerson);

/**
  * @description get update Routes
  * @method GET /
  */
route.get('/update', authorization, controller.updateUser);

/**
  * @description Update in the database
  * @method POST /
  */

route.post('/updateStudent', authorization, controller.updateStudent);
route.post('/updateCompany', authorization, controller.updateCompany);
route.post('/updateAdmin', authorization, controller.updateAdmin);

/**
  * @description Logout Routes
  * @method GET /
  */
route.get('/logout', authorization, controller.logoutUser);

/**
  * @description Delete Routes
  * @method DELETE /
  */
route.delete('/delete', authorization, controller.deleteUser);

/**
  * @description Delete Routes
  * @method GET /
  */
route.get('/mail/:id', authorizationAdmin, controller.sendMail);


module.exports = route;