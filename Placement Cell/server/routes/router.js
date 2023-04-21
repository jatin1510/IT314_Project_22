const express = require('express');
const route = express.Router();
const services = require('../service/render');
const controller = require('../controller/controller');
const { authorization, authorizationAdmin, authorizationSuperAdmin } = require('../middleware/middleware');

/**
  * @description Root Route
  * @method GET /
  */
route.get('/', services.home);
route.get('/aboutus', services.aboutus);
route.get('/loginPage', services.loginPage);
route.get('/registerPage', services.registerPage);

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
  * @method POST /
  */
route.post('/profile', controller.findPerson);

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
  * @description mail for specific job to students
  * @method GET /
  */
route.get('/mail/:id', authorizationAdmin, controller.sendMail);

/**
  * @description Verify Routes (serving pages)
  * @method GET /
  */
route.get('/verifyStudent', authorizationAdmin, controller.verifyStudent);
route.get('/verifyJob', authorizationAdmin, controller.verifyJob);
route.get('/verifyCompany', authorizationSuperAdmin, controller.verifyCompany);

module.exports = route;