const axios = require('axios');

exports.home = (req, res) =>
{
    // res.render('home');
    res.send("We are at home");
};

exports.companyProfile = (req, res) =>
{
    res.send("We are at companyProfile");
    res.render('companyProfile');
};