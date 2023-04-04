const axios = require('axios');
const bcrypt = require('bcrypt');
const { student, company, admin, job, studentJob } = require('../model/model');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { syncIndexes } = require('mongoose');
require('dotenv').config({ path: 'config.env' });

const generateToken = (id, email, role) => {
    return jwt.sign(
        { id, email, role },
        process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

/**
  * @description Login Utility Function
  */
exports.findPerson = async (req, res) => {
    const email = req.body.email;
    const role = req.body.role;
    const password = req.body.password;

    if (role == "Student") {
        await student.find({ email: email })
            .then((data) => {
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
            .catch((err) => {
                res
                    .status(500)
                    .send({ message: `Error retrieving user with email ${email}` });
            });
    }
    else if (role == "Company") {
        await company.find({ email: email })
            .then((data) => {
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
            .catch((err) => {
                res
                    .status(500)
                    .send({ message: `Error retrieving user with email ${email}` });
            });
    }
    else {
        await admin.find({ email: email })
            .then((data) => {
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
            .catch((err) => {
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
exports.registerStudent = async (req, res) => {
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
        .then((hashedPassword) => {
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
                .then(data => {
                    const token = generateToken(data[0]._id, user.email, "Student");
                    res.cookie("jwt", token);
                    res.send(data);
                })
                .catch(err => {
                    res.status(500).send({
                        message: err.message || 'Some error occured  while creating a create operation',
                    });
                });
        })
        .catch(err => {
            console.log('Error:', err);
        })
}

// Register company
exports.registerCompany = async (req, res) => {
    // validate request
    if (!req.body) {
        res.status(400).send({ message: 'Content can not be empty!' });
        return;
    }

    await bcrypt.hash(req.body.password, saltRounds)
        .then((hashedPassword) => {
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
                .then(data => {
                    const token = generateToken(data[0]._id, user.email, "Company");
                    res.cookie("jwt", token);
                    res.send(data);
                })
                .catch(err => {
                    res.status(500).send({
                        message: err.message || 'Some error occured  while creating a create operation',
                    });
                });
        })
        .catch(err => {
            console.log('Error:', err);
        })
}

// Register company
exports.registerAdmin = async (req, res) => {
    // validate request
    if (!req.body) {
        res.status(400).send({ message: 'Content can not be empty!' });
        return;
    }

    await bcrypt.hash(req.body.password, saltRounds)
        .then((hashedPassword) => {
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
                .then(data => {
                    const token = generateToken(data[0]._id, user.email, "Admin");
                    res.cookie("jwt", token);
                    res.send(data);
                })
                .catch(err => {
                    res.status(500).send({
                        message: err.message || 'Some error occured  while creating a create operation',
                    });
                });
        })
        .catch(err => {
            console.log('Error:', err);
        })
}

/**
  * @description Modify Utility Functions
  */

exports.updateUser = async (req, res) => {

}

//company home by Jaimin
exports.showJob = (req, res) => {
    const companyID = null;
    job.find({ comp: companyID })
        .then(data => {
            if (!data) {
                res.status(404).send({ message: "Not found company with id " + id })
            } else {
                res.send(data)
            }
        })
        .catch(err => {
            res.status(500).send({ message: "Error retrieving company with id " + id })
        })
};

exports.postJob = (req, res) => {
    // add job to jobSchema
    const companyID = "642c112c7a0fdd91ee4100bb";
    if (!req.body) {
        res.status(400).send({ message: 'Content can not be empty!' });
        return;
    }

    // new student
    const user = new job({
        comp: companyID,
        jobName: req.body.jobName,
        postingLocation: req.body.postingLocation,
        ugCriteria: req.body.ugCriteria,
        cpiCriateria: req.body.cpiCriateria,
        ctc: req.body.ctc,
        description: req.body.description,
    })

    // save student in the database
    user
        .save(user)
        .then(data => {
            // redirect to company home page
            // res.redirect('/');
            res.send(user);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || 'Some error occured  while creating a create operation',
            });
        });
};

exports.registredStudentsInJob = async (req, res) => {
    const jobID = req.query.jobID;
    studentJob.find({ job: jobID })
        .then(data => {
            if (!data) {
                res.status(404).send({ message: "Not found Job with id " + jobID })
            } else {
                // console.log(jobID);
                studentJob.aggregate([
                    {
                        $lookup:
                        {
                            from: 'job',
                            localField: 'job',
                            foreignField: '_id',
                            as: 'studentjobsjoinjob'
                        }
                    }
                ])
                    .then(async (result) => {
                        const arrayOfStudents = [];
                        for (let index = 0; index < result.length; index++) {
                            await student.find({ _id: result[index].student })
                                .then((result1) => {
                                    if (!result1) {
                                        res.status(404).send({ message: "Not found Student with id " + result[index].student })
                                    }
                                    else {
                                        arrayOfStudents.push(result1[0]);
                                    }
                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                        }
                        // console.log(arrayOfStudents);
                        res.send(arrayOfStudents);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }
        })
        .catch(err => {
            res.status(500).send({ message: "Error retrieving Job with id " + jobID });
        })
};

exports.jobsRegistredbyStudent = (req, res) => {
    const studentID = req.query.studentID;
    studentJob.find({ student: studentID })
        .then(data => {
            if (!data) {
                res.status(404).send({ message: "Not found Student with id " + studentID })
            } else {
                // console.log(jobID);
                studentJob.aggregate([
                    {
                        $lookup:
                        {
                            from: 'stuent',
                            localField: 'student',
                            foreignField: '_id',
                            as: 'studentjobsjoinstudent'
                        }
                    }
                ])
                    .then(async (result) => {
                        const arrayOfJobs = [];
                        for (let index = 0; index < result.length; index++) {
                            await job.find({ _id: result[index].job })
                                .then((result1) => {
                                    if (!result1) {
                                        res.status(404).send({ message: "Not found job with id " + result[index].job })
                                    }
                                    else {
                                        arrayOfJobs.push(result1[0]);
                                    }
                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                        }
                        // console.log(arrayOfJobs);
                        res.send(arrayOfJobs);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }
        })
        .catch(err => {
            res.status(500).send({ message: "Error retrieving Student with id " + studentID });
        })
};

// Help student to register in Job
exports.registerStudentInJob = (req, res) => {
    const jobID = "642c1273520e78f528916627";
    const studentID = "642c10217a0fdd91ee4100b5";
    if (!req.body) {
        res.status(400).send({ message: 'Content can not be empty!' });
        return;
    }

    // new student
    const user = new studentJob({
        job: jobID,
        student: studentID,
    });

    // save student in the database
    user
        .save(user)
        .then(data => {
            // redirect to company home page
            // res.redirect('/');
            res.send(user);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || 'Some error occured  while creating a create operation',
            });
        });
};