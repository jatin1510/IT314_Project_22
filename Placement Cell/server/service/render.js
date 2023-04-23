const axios = require('axios');

exports.home = (req, res) =>
{
    res.render('Home');
};

exports.aboutus = (req, res) =>
{
    res.render('AboutUS');
};

exports.loginPage = (req, res) =>
{
    res.render('Login');
};

exports.registerPage = (req, res) =>
{
    res.render('registerStudent');
};

exports.postJobPage = (req, res) =>
{
    res.render('companyPostJob');
}