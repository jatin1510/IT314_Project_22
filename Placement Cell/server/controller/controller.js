const axios = require('axios');
const bcrypt = require('bcrypt');
const { student, company, admin, job } = require('../model/model');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'config.env' });

const generateToken = (id, email, role) =>
{
    return jwt.sign(
        { id, email, role },
        process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

/**
  * @description Login Utility Function
  */
exports.findPerson = async (req, res) =>
{
    const email = req.body.email;
    const role = req.body.role;
    const password = req.body.password;

    if (role == "Student") {
        await student.find({ email: email })
            .then((data) =>
            {
                if (!data) {
                    res
                        .status(404)
                        .send({ message: `Not found user with email: ${email} ` });
                } else {
                    if (!bcrypt.compareSync(password, data[0].password)) {
                        res
                            .status(500)
                            .send({ message: `Password Invalid` });
                        return;
                    }
                    // create token
                    const token = generateToken(data[0]._id, email, role);
                    console.log(token);
                    res.cookie("jwt", token);
                    res.send(data);
                    // res.render('studentProfile', { student: data[0] });
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
        await company.find({ email: email })
            .then((data) =>
            {
                if (!data) {
                    // Make new webpage for all not found errors
                    res
                        .status(404)
                        .send({ message: `Not found Company with email: ${email} ` });
                } else {
                    if (!bcrypt.compareSync(password, data[0].password)) {
                        res
                            .status(500)
                            .send({ message: `Password Invalid` });
                        return;
                    }
                    // create token
                    const token = generateToken(data[0]._id, email, role);
                    console.log(token);
                    res.cookie("jwt", token);
                    res.send(data);
                    // res.render('companyProfile', { company: data[0] });
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
        await admin.find({ email: email })
            .then((data) =>
            {
                if (!data) {
                    // Make new webpage for all not found errors
                    res
                        .status(404)
                        .send({ message: `Not found admin with email: ${email} ` });
                } else {
                    // initialize cookie with role student and email
                    if (data[0].role == 1) {
                        if (role === "Placement Manager") {
                            if (!bcrypt.compareSync(password, data[0].password)) {
                                res
                                    .status(500)
                                    .send({ message: `Password Invalid` });
                                return;
                            }
                            // create token
                            const token = generateToken(data[0]._id, email, role);
                            console.log(token);
                            res.cookie("jwt", token);
                            // res.render('superAdminProfile', { admin: data[0] });
                            res.send(data);
                        }
                        else {
                            res
                                .status(500)
                                .send({ message: `Error retrieving user with role ${role}` });
                        }
                    }
                    else {
                        if (role === "Admin") {
                            if (!bcrypt.compareSync(password, data[0].password)) {
                                res
                                    .status(500)
                                    .send({ message: `Password Invalid` });
                                return;
                            }
                            // create token
                            const token = generateToken(data[0]._id, email, role);
                            console.log(token);
                            res.cookie("jwt", token);
                            // res.render('adminProfile', { admin: data[0] });
                            res.send(data);
                        }
                        else {
                            res
                                .status(500)
                                .send({ message: `Error retrieving user with role ${role}` });
                        }
                    }
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

/**
  * @description Register Utility Functions
  */
// Register student
exports.registerStudent = async (req, res) =>
{
    // validate request
    if (!req.body) {
        res.status(400).send({ message: 'Content can not be empty!' });
        return;
    }

    if (req.body.confirmPassword !== req.body.password) {
        // make new webpage for any type for error
        res.send("Password doesn't matched");
    }

    await bcrypt.hash(req.body.password, saltRounds)
        .then((hashedPassword) =>
        {
            // new student
            const user = new student({
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, saltRounds),
                firstName: req.body.firstName,
                middleName: req.body.middleName,
                lastName: req.body.lastName,
                dob: req.body.dob,
                gender: req.body.gender,
                mobileNumber: req.body.mobileNumber,
                alternateMobileNumber: req.body.alternateMobileNumber,
                tenthPercentage: req.body.tenthPercentage,
                twelfthPercentage: req.body.twelfthPercentage,
                cpi: req.body.cpi,
                activeBacklog: req.body.activeBacklog,
                totalBacklog: req.body.totalBacklog,
                branch: req.body.branch,
                resume: req.body.resume,
            })

            // save student in the database
            user
                .save(user)
                .then(data =>
                {
                    const token = generateToken(data[0]._id, user.email, "Student");
                    res.cookie("jwt", token);
                    res.send(data);
                })
                .catch(err =>
                {
                    res.status(500).send({
                        message: err.message || 'Some error occured  while creating a create operation',
                    });
                });
        })
        .catch(err =>
        {
            console.log('Error:', err);
        })
}

// Register company
exports.registerCompany = async (req, res) =>
{
    // validate request
    if (!req.body) {
        res.status(400).send({ message: 'Content can not be empty!' });
        return;
    }

    await bcrypt.hash(req.body.password, saltRounds)
        .then((hashedPassword) =>
        {
            // new company
            const user = new company({
                email: req.body.email,
                website: req.body.website,
                companyName: req.body.companyName,
                hrName: req.body.hrName,
                contactNumber: req.body.contactNumber,
                password: hashedPassword,
            })

            // save company in the database
            user
                .save(user)
                .then(data =>
                {
                    const token = generateToken(data[0]._id, user.email, "Company");
                    res.cookie("jwt", token);
                    res.send(data);
                })
                .catch(err =>
                {
                    res.status(500).send({
                        message: err.message || 'Some error occured  while creating a create operation',
                    });
                });
        })
        .catch(err =>
        {
            console.log('Error:', err);
        })
}

// Register company
exports.registerAdmin = async (req, res) =>
{
    // validate request
    if (!req.body) {
        res.status(400).send({ message: 'Content can not be empty!' });
        return;
    }

    await bcrypt.hash(req.body.password, saltRounds)
        .then((hashedPassword) =>
        {
            // new company
            const user = new admin({
                email: req.body.email,
                password: hashedPassword,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
            })

            // save company in the database
            user
                .save(user)
                .then(data =>
                {
                    const token = generateToken(data[0]._id, user.email, "Admin");
                    res.cookie("jwt", token);
                    res.send(data);
                })
                .catch(err =>
                {
                    res.status(500).send({
                        message: err.message || 'Some error occured  while creating a create operation',
                    });
                });
        })
        .catch(err =>
        {
            console.log('Error:', err);
        })
}

/**
  * @description Modify Utility Functions
  */

exports.updateUser = async (req, res) =>
{

}