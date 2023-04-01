const axios = require('axios');
const { student, company, admin, job } = require('../model/model');

exports.findPerson = (req, res) =>
{
    const email = req.body.email;
    const role = req.body.role;
    const password = req.body.password;

    if (role == "Student") {
        student.find({ email: email, password: password })
            .then((data) =>
            {
                if (!data) {
                    res
                        .status(404)
                        .send({ message: `Not found user with email: ${email} ` });
                } else {
                    // initialize cookie with role student and email
                    res.render('studentProfile', { student: data[0] });
                }
            })
            .catch((err) =>
            {
                res
                    .status(500)
                    .send({ message: `Error retrieving user with email ${email}` });
            });
    }
    else if (role == "Company") {
        company.find({ email: email, password: password })
            .then((data) =>
            {
                if (!data) {
                    // Make new webpage for all not found errors
                    res
                        .status(404)
                        .send({ message: `Not found Company with email: ${email} ` });
                } else {
                    // initialize cookie with role student and email
                    res.render('companyProfile', { company: data[0] });
                }
            })
            .catch((err) =>
            {
                res
                    .status(500)
                    .send({ message: `Error retrieving user with email ${email}` });
            });
    }
    else {
        admin.find({ email: email, password: password })
            .then((data) =>
            {
                if (!data) {
                    // Make new webpage for all not found errors
                    res
                        .status(404)
                        .send({ message: `Not found admin with email: ${email} ` });
                } else {
                    // initialize cookie with role student and email
                    if (data[0].role == 1)
                        res.render('superAdminProfile', { admin: data[0] });
                    else
                        res.render('adminProfile', { admin: data[0] });

                }
            })
            .catch((err) =>
            {
                res
                    .status(500)
                    .send({ message: `Error retrieving user with email ${email}` });
            });
    }
};