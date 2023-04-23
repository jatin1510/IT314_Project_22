const axios = require('axios');
const bcrypt = require('bcrypt');
const { student, company, admin, job, studentJob } = require('../model/model');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { syncIndexes } = require('mongoose');
const nodemailer = require('nodemailer');
const excelJS = require('exceljs')
require('dotenv').config({ path: 'config.env' });

const cookie_expires_in = 24 * 60 * 60 * 1000;

const generateToken = (id, email, role) =>
{
    return jwt.sign(
        { id, email, role },
        process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.home = async (req, res) =>
{
    const token = req.cookies.jwt;
    if (token) {
        res.render('Home', { flag: true });
    }
    else {
        res.render('Home', { flag: false });
    }
};

/**
  * @description Login Utility Function
  */
exports.findPerson = async (req, res) =>
{
    const email = req.body.email;
    const role = req.body.role;
    const password = req.body.password;

    console.log(email, role, password);
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
                    res.cookie("jwt", token, { maxAge: cookie_expires_in, httpOnly: true });
                    res.redirect('/profile');
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
                    res.cookie("jwt", token, { maxAge: cookie_expires_in, httpOnly: true });
                    // res.render('companyProfile', { company: data[0] });
                    res.redirect('/profile');
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
            .then(async (data) =>
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
                            res.cookie("jwt", token, { maxAge: cookie_expires_in, httpOnly: true });
                            res.redirect('/profile');
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
                            const token = await generateToken(data[0]._id, email, role);
                            console.log(token);
                            res.cookie("jwt", token, { maxAge: cookie_expires_in, httpOnly: true });
                            res.redirect('/profile');
                            return;
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
  * @description Already logged in
  */
exports.alreadyLoggedIn = async (req, res) =>
{
    const _id = req.id;
    const email = req.email;
    const role = req.role;
    console.log(email, role, _id);

    if (role == "Student") {
        await student.findById(_id)
            .then((data) =>
            {
                if (!data) {
                    res
                        .status(404)
                        .send({ message: `Not found user with email: ${email} ` });
                } else {
                    res.render('studentProfile', { student: data });
                }
            })
            .catch((err) =>
            {
                console.log(err);
                res
                    .status(500)
                    .send({ message: `Error retrieving user with email ${email}` });
            });
    }
    else if (role == "Company") {
        await company.findById(_id)
            .then(async (data) =>
            {
                if (!data) {
                    // Make new webpage for all not found errors
                    res
                        .status(404)
                        .send({ message: `Not found Company with email: ${email} ` });
                } else {
                    const jobs = await job.find({ comp: data._id }).exec();
                    // console.log(jobs);
                    if (data.isVerified) {
                        res.render('Profile', { company: data, jobs });
                    }
                    else {
                        res.render('Profile', { company: data });
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
    else {
        await admin.findById(_id)
            .then(async (data) =>
            {
                if (!data) {
                    // Make new webpage for all not found errors
                    res
                        .status(404)
                        .send({ message: `Not found admin with email: ${email} ` });
                } else {
                    const placedStudent = await student.find({ isPlaced: true }).exec();
                    const totalStudent = await student.find().exec();
                    const placed = (placedStudent.length * 100) / totalStudent.length;
                    
                    const A1jobs = await job.find({ isVerified: true, ctc: { $gte: 10.0 } }).exec();
                    const totalJobs = await job.find({ isVerified: true }).exec();
                    const a1 = (A1jobs.length * 100) / totalJobs.length;

                    console.log(placed, a1);
                    if (data.role == 1) {
                        if (role === "Placement Manager") {
                            // TODO: calculate percentage for placed and male
                            res.render('adminHome', { admin: data, placed: placed, a1: a1, isSuperAdmin: true });
                        }
                        else {
                            res
                                .status(500)
                                .send({ message: `Error retrieving user with role ${role}` });
                        }
                    }
                    else {
                        if (role === "Admin") {
                            // TODO: calculate percentage for placed and male
                            res.render('adminHome', { admin: data, placed: placed, a1: a1, isSuperAdmin: false });
                            return;
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
        return;
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
                    const token = generateToken(data._id, user.email, "Student");
                    res.cookie("jwt", token, { maxAge: cookie_expires_in, httpOnly: true });
                    res.redirect('/profile');
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

    console.log(req.body);
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
                .then((data) =>
                {
                    const token = generateToken(data._id, data.email, "Company");
                    res.cookie("jwt", token, { maxAge: cookie_expires_in, httpOnly: true });
                    res.redirect('/profile');

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
                .then((data) =>
                {
                    const token = generateToken(data._id, user.email, "Admin");
                    res.cookie("jwt", token, { maxAge: cookie_expires_in, httpOnly: true });
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
  * @description Routing update request to particular role (kind of serving related webpage to logged in role)
  */
exports.updateUser = async (req, res) =>
{
    const email = req.email;
    const role = req.role;
    const id = req.id;

    console.log("inside update router");
    console.log(email, role, id);

    if (role == "Student") {
        await student.find({ _id: id })
            .then((data) =>
            {
                // render to update student page ex. {/updateStudent/:id}
                res.render('studentEditProfile', { student: data[0] });
            })
            .catch((err) =>
            {
                res
                    .status(500)
                    .send({ message: `Error retrieving user with email ${email}` });
            });
    }
    else if (role == "Company") {
        await company.find({ _id: id })
            .then((data) =>
            {
                // render to update company page ex. {/updateCompany/:id}
                res.render('companyEditProfile', { company: data[0] });
            })
            .catch((err) =>
            {
                res
                    .status(500)
                    .send({ message: `Error retrieving user with email ${email}` });
            });
    }
    else {
        await admin.find({ _id: id })
            .then((data) =>
            {
                // initialize cookie with role student and email
                if (data[0].role == 1) {
                    if (role === "Placement Manager") {
                        // render to update placement manager page ex. {/updateSuperAdmin/:id}
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
                        // render to update admin page ex. {/updateAdmin/:id}
                        res.send(data);
                    }
                    else {
                        res
                            .status(500)
                            .send({ message: `Error retrieving user with role ${role}` });
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
}

/**
  * @description Individual user update request to database
  */
exports.updateStudent = async (req, res) =>
{
    if (!req.body) {
        return res
            .status(400)
            .send({ message: 'Data to update can not be empty' });
    }

    const id = req.id;
    const role = req.role;
    if (role !== "Student") {
        res
            .status(500)
            .send({ message: 'Role not matched' });
        return;
    }

    const old = req.body.password;

    if (req.body.password) {
        console.log(req.body.password, req.body.newPassword, req.body.newConfirmPassword);

        await student.findById(id)
            .then(async (data) =>
            {
                if (!data) {
                    res
                        .status(404)
                        .send({ message: `Not found user with email: ${email} ` });
                    return;
                } else {
                    if (!bcrypt.compareSync(req.body.password, data.password)) {
                        res
                            .status(500)
                            .send({ message: `Old Password InCorrect` });
                        return;
                    }
                    console.log("password matched");
                    await bcrypt.hash(req.body.newPassword, saltRounds)
                        .then((hashedPassword) =>
                        {
                            req.body.password = hashedPassword;
                        })
                        .catch(err =>
                        {
                            console.log('Error:', err);
                            return;
                        })
                }
            })
            .catch((err) =>
            {
                res
                    .status(500)
                    .send({ message: `Error retrieving user with email ${email}` });
                return;
            });
    }

    if (req.body.password && req.body.password == old) {
        return;
    }

    const stored = req.body;
    console.log(stored);
    await student.findByIdAndUpdate(id, stored, { useFindAndModify: false })
        .then((data) =>
        {
            if (!data) {
                res
                    .status(400)
                    .send({ message: `Cannot update student with ${id}. May be user not found!` })
            } else {
                res.redirect('/profile');
            }
        })
        .catch(err =>
        {
            res.status(500).send({ message: 'Error update student information' });
        })
}

exports.updateCompany = async (req, res) =>
{
    if (!req.body) {
        return res
            .status(400)
            .send({ message: 'Data to update can not be empty' });
    }

    const email = req.email;
    const id = req.id;
    const role = req.role;

    if (role !== "Company") {
        res
            .status(500)
            .send({ message: 'Role not matched' });
        return;
    }
    if (req.body.password) {
        await bcrypt.hash(req.body.password, saltRounds)
            .then((hashedPassword) =>
            {
                req.body.password = hashedPassword;
            })
            .catch(err =>
            {
                console.log('Error:', err);
            })
    }
    const stored = req.body;
    await company.findByIdAndUpdate(id, stored, { useFindAndModify: false })
        .then((data) =>
        {
            if (!data) {
                res.status(400).send({ message: `Cannot update company with ${id}. May be user not found!` })
            } else {
                res.redirect('/profile');
            }
        })
        .catch(err =>
        {
            res.status(500).send({ message: 'Error update company information' });
        })
}

exports.updateAdmin = async (req, res) =>
{
    if (!req.body) {
        return res
            .status(400)
            .send({ message: 'Data to update can not be empty' });
    }

    const id = req.id;
    const role = req.role;

    console.log(id, role);
    if (role !== "Placement Manager" && role !== "Admin") {
        res
            .status(500)
            .send({ message: 'Role not matched' });
        return;
    }

    const old = req.body.password;

    if (req.body.password) {
        console.log(req.body.password, req.body.newPassword, req.body.newConfirmPassword);

        await admin.findById(id)
            .then(async (data) =>
            {
                if (!data) {
                    res
                        .status(404)
                        .send({ message: `Not found user with email: ${email} ` });
                    return;
                } else {
                    if (!bcrypt.compareSync(req.body.password, data.password)) {
                        res
                            .status(500)
                            .send({ message: `Old Password InCorrect` });
                        return;
                    }
                    console.log("password matched");
                    await bcrypt.hash(req.body.newPassword, saltRounds)
                        .then((hashedPassword) =>
                        {
                            req.body.password = hashedPassword;
                        })
                        .catch(err =>
                        {
                            console.log('Error:', err);
                            return;
                        })
                }
            })
            .catch((err) =>
            {
                res
                    .status(500)
                    .send({ message: `Error retrieving user with email ${email}` });
                return;
            });
    }

    if (req.body.password && req.body.password == old) {
        return;
    }

    const stored = req.body;
    await admin.findByIdAndUpdate(id, stored, { useFindAndModify: false })
        .then((data) =>
        {
            if (!data) {
                res.status(400).send({ message: `Cannot update admin with ${id}. May be user not found!` })
            } else {
                res.redirect('/profile');
            }
        })
        .catch(err =>
        {
            res.status(500).send({ message: 'Error update admin information' });
        })
}


exports.updatePassword = async (req, res) =>
{
    const email = req.email;
    const role = req.role;
    const id = req.id;

    console.log("inside update password");
    console.log(email, role, id);

    if (role == "Student") {
        const stu = await student.findById(id);
        res.render('studentUpdatePassword', { student: stu });
    }
    else if (role == "Company") {
    }
    else {
        if (role == "Admin")
            res.render('adminUpdatePassword', { isSuperAdmin: false });
        else
            res.render('adminUpdatePassword', { isSuperAdmin: true });
    }
}


/**
  * @description Logout current user
  */
exports.logoutUser = async (req, res) =>
{
    res
        .clearCookie("jwt")
        .status(200)
        .redirect('/');

    // render the home page here
}

/**
  * @description Delete current user
  */
exports.deleteUser = async (req, res) =>
{
    const role = req.role;
    const id = req.id;

    console.log(role);
    console.log(id);

    if (role == "Student") {
        student.findByIdAndDelete(id)
            .then(data =>
            {
                if (!data) {
                    res.status(404).send({ message: `Cannot delete with id ${id}. Maybe ID is wrong!` })
                }
                else {
                    res.send({ message: 'User was deleted successfully' });
                }
            })
            .catch(err =>
            {
                res.status(500).send({
                    message: `Could not delete user with id=${id}`,
                });
            });
    }
    else if (role == "Company") {
        company.findByIdAndDelete(id)
            .then(data =>
            {
                if (!data) {
                    res.status(404).send({ message: `Cannot delete with id ${id}. Maybe ID is wrong!` })
                }
                else {
                    res.send({ message: 'User was deleted successfully' });
                }
            })
            .catch(err =>
            {
                res.status(500).send({
                    message: `Could not delete user with id=${id}`,
                });
            });
    }
    else {
        admin.findByIdAndDelete(id)
            .then(data =>
            {
                if (!data) {
                    res.status(404).send({ message: `Cannot delete with id ${id}. Maybe ID is wrong!` })
                }
                else {
                    res.send({ message: 'User was deleted successfully' });
                }
            })
            .catch(err =>
            {
                res.status(500).send({
                    message: `Could not delete user with id=${id}`,
                });
            });
    }
}

/**
  * @description Automate Mail
  */
exports.sendMail = async (req, res) =>
{
    const transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
            user: "placementdaiict@outlook.com",
            pass: process.env.MAIL_PASS,
        },
    });

    const students = await student.find({ isPlaced: false, isVerified: true }).exec();
    // const emails = [];
    // for (let i = 0; i < students.length; i++) {
    //     emails.push(students[i].email);
    // }
    // console.log(emails);
    // const emails = ["jatinranpariya1510@gmail.com", "jbranpariya15@gmail.com", "202001226@daiict.ac.in", "nikhilvaghasiya1600@gmail.com"];
    const emails = ["virajpansuriya777@gmail.com"];

    if (!students) {
        res.status(200).send({
            message: `All registered students are placed.`,
        });
        return;
    }

    const id = req.params.id;
    job.findById(id)
        .then((data) =>
        {
            const companyId = data.comp;
            company.findById(companyId)
                .then(async (companyData) =>
                {
                    const CompanyName = companyData.companyName;
                    const JobName = data.jobName;
                    const locations = data.postingLocation;
                    const openfor = data.ugCriteria;
                    const CpiCriteria = data.cpiCriteria;
                    const ctc = data.ctc;
                    const description = data.description;
                    const start_date = data.startDate;
                    const end_date = data.endDate;

                    const options = {
                        from: `placementdaiict@outlook.com`,
                        to: emails,
                        subject: `Registration is open for ${CompanyName}`,
                        text: ``,
                        html: `<p>Dear students, Upcoming placement drive of the company <b>${CompanyName}</b> is scheduled on ${start_date}</p>
                                <div><h4>Company Profile Details:<h4> </div>
                                <div><b>Registration Starts on:</b> ${start_date} </div>
                                <div><b>Registration Ends on:</b> ${end_date} </div>
                                <div><b>Open for:</b> ${openfor} </div>
                                <div><b>Posting Location(s):</b> ${locations} </div>
                                <div><b>Job Role:</b> ${JobName}</div>
                                <div><b>CPI Criteria:</b> ${CpiCriteria}</div>
                                <div><b>CTC(LPA):</b> ${ctc}</div>
                                <div><b>Description:</b> ${description} </div>
                                <br>
                                <div><b>Note:</b> All the students who are registering for a company are required to attend the company process and cannot back out from the same, for any reason. Anyone violating this norm will be strictly banned from the next eligible company.</div>
                                <br>
                                <div><b>Strict notice to all the students:</b> no late registrations will be entertained (no matter the reason). So, do keep in mind the registration deadline. Research about the company and the job profile before registering.</div> 
                                <br>
                                <div><i>Wish you luck!</i></div>
                                <br>
                                <div>Please Do Not Respond back to this E-mail as this is Auto Generated E-mail, contact us at <b>jatinranpariya1510@gmail.com</b> in case of any doubt.</div>
                                <br>
                                <div>Regards,</div>
                                <div>Placement Cell</div>`,
                    };

                    await transporter.sendMail(options, function (err, info)
                    {
                        if (err) {
                            console.log("Error occured", err);
                            return;
                        }
                        console.log("Mail Sent: ", info.response);
                    });

                    res.redirect('/adminInterviewSchedule');
                })
                .catch(err =>
                {
                    res.status(500).send({ message: 'Company not found' });
                })

        })
        .catch(err =>
        {
            res.status(500).send({ message: 'Job not found' });
        })
}

/**
  * @description Verification Functions
  */
exports.verifyStudent = async (req, res) =>
{
    const id = req.params.id;
    console.log(id);
    if (id) {
        await student.findByIdAndUpdate(id, { isVerified: true }, { useFindAndModify: false })
            .then(async (data) =>
            {
                //console.log(data);
                //const dta = await student.find({isVerified:false}).exec(); 
                //res.render('adminVerifyStudent' , {record : dta});
                //res.send(`Verified student with object id ${id}`);
                res.redirect("/unverifiedstudents");
            })
            .catch(err =>
            {
                res.status(500).send({ message: 'Student not found' });
            })
    }
    else {
        const students = await student.find({ isVerified: false }).exec();
        if (!students) {
            res.status(200).send({ message: 'All students are verified' });
            return;
        }

        // render verifyStudent page with students object
        // res.rend('verifyStudent', {students: students});
        res.send(students);
        // console.log(students.length);
    }
}

exports.verifyJob = async (req, res) =>
{
    const id = req.params.id;
    if (id) {
        await job.findByIdAndUpdate(id, { isVerified: true }, { useFindAndModify: false })
            .then(async (data) =>
            {


                // const dta = await job.find({isVerified:false}).exec(); 
                // console.log(data); 
                res.redirect("/unverifiedjobs")

            })
            .catch(err =>
            {
                res.status(500).send({ message: 'Job not found' });
            })
    }
    else {
        const jobs = await job.find({ isVerified: false }).exec();
        if (!jobs) {
            res.status(200).send({ message: 'All jobs are verified' });
            return;
        }

        // render verifyJob page with students object
        // res.rend('verifyJob', {jobs: jobs});
        res.send(jobs);
        console.log(jobs.length);
    }
}

exports.verifyCompany = async (req, res) =>
{
    const id = req.params.id;
    if (id) {
        await company.findByIdAndUpdate(id, { isVerified: true }, { useFindAndModify: false })
            .then(async (data) =>
            {
                //const dta = await company.find({isVerified:false}).exec(); 
                res.redirect("/unverifiedcompany")
            })
            .catch(err =>
            {
                res.status(500).send({ message: 'Company not found' });
            })
    }
    else {
        const companies = await company.find({ isVerified: false }).exec();
        if (!companies) {
            res.status(200).send({ message: 'All companies are verified' });
            return;
        }

        // render verifyCompany with companies object
        // res.render('verifyCompany', {companies: companies});
        res.send(companies);
        console.log(companies.length);
    }
}


exports.postJob = async (req, res) =>
{
    // add job to jobSchema
    if (!req.body) {
        res.status(400).send({ message: 'Content can not be empty!' });
        return;
    }
    const comp = await company.findById(req.id).exec();
    // new student
    const user = await new job({
        comp: req.id,
        companyName: comp.companyName,
        jobName: req.body.jobName,
        postingLocation: req.body.postingLocation,
        ugCriteria: req.body.ugCriteria,
        cpiCriteria: req.body.cpiCriteria,
        ctc: req.body.ctc,
        description: req.body.description,
    })

    // save student in the database
    user
        .save(user)
        .then(async data =>
        {
            // redirect to company home page
            res.redirect('/profile');
        })
        .catch(err =>
        {
            res.status(500).send({
                message: err.message || 'Some error occured  while creating a create operation',
            });
        });
};

exports.registredStudentsInJob = async (req, res) =>
{
    const jobID = req.params.id;
    studentJob.find({ job: jobID })
        .then(data =>
        {
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
                    .then(async (result) =>
                    {
                        const arrayOfStudents = [];
                        for (let index = 0; index < result.length; index++) {
                            // console.log(result[index]);
                            await student.find({ _id: result[index].student })
                                .then((result1) =>
                                {
                                    if (!result1) {
                                        res.status(404).send({ message: "Not found Student with id " + result[index].student })
                                    }
                                    else if (result[index].job == jobID) {
                                        arrayOfStudents.push(result1[0]);
                                    }
                                })
                                .catch((error) =>
                                {
                                    console.log(error);
                                });
                        }
                        const companyName = await job.findById(jobID);
                        // console.log(arrayOfStudents);
                        res.render('companyStudentList', { students: arrayOfStudents, name: companyName.companyName });
                    })
                    .catch((error) =>
                    {
                        console.log(error);
                    });
            }
        })
        .catch(err =>
        {
            res.status(500).send({ message: "Error retrieving Job with id " + jobID });
        })
};

exports.jobsRegistredbyStudent = (req, res) =>
{
    const studentID = req.query.studentID;
    studentJob.find({ student: studentID })
        .then(data =>
        {
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
                    .then(async (result) =>
                    {
                        const arrayOfJobs = [];
                        for (let index = 0; index < result.length; index++) {
                            await job.find({ _id: result[index].job })
                                .then((result1) =>
                                {
                                    if (!result1) {
                                        res.status(404).send({ message: "Not found job with id " + result[index].job })
                                    }
                                    else {
                                        arrayOfJobs.push(result1[0]);
                                    }
                                })
                                .catch((error) =>
                                {
                                    console.log(error);
                                });
                        }
                        // console.log(arrayOfJobs);
                        res.send(arrayOfJobs);
                    })
                    .catch((error) =>
                    {
                        console.log(error);
                    });
            }
        })
        .catch(err =>
        {
            res.status(500).send({ message: "Error retrieving Student with id " + studentID });
        })
};

// Help student to register in Job
exports.registerStudentInJob = async (req, res) =>
{
    const jobID = req.params.id;
    const studentID = req.id;

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
        .then(async (data) =>
        {
            res.redirect('/viewCompany');
        })
        .catch(err =>
        {
            res.status(500).send({
                message: err.message || 'Some error occured  while creating a create operation',
            });
        });
};

exports.deregisterStudentInJob = async (req, res) =>
{
    const jobID = req.params.id;
    const studentID = req.id;
    console.log(studentID, jobID);
    if (!req.body) {
        res.status(400).send({ message: 'Content can not be empty!' });
        return;
    }

    const entry = await studentJob.findOne({ job: jobID, student: studentID });
    await studentJob.findByIdAndDelete(entry._id)
        .then(async (data) =>
        {
            if (!data) {
                res.status(404).send({ message: `Cannot delete with id ${entry._id}. Maybe ID is wrong!` })
            }
            else {
                res.redirect('/viewCompany');
            }
        })
        .catch(err =>
        {
            res.status(500).send({
                message: `Could not delete user with id=${id}`,
            });
        });
};

exports.updateJob = async (req, res) =>
{
    const jobID = req.params.id;
    if (!req.body) {
        res.status(400).send({ message: 'Content can not be empty!' });
        return;
    }
    const jobObject = await job.findById(jobID);
    res.render('companyEditJobs', { job: jobObject });
}

exports.updateJobPost = async (req, res) =>
{
    const id = req.params.id;
    const object = req.body;
    console.log(object);
    await job.findByIdAndUpdate(id, object, { useFindAndModify: false })
        .then(async (data) =>
        {
            if (!data) {
                res.status(404).send({ message: "Cannot update job with id " + id });
            }
            else {
                res.redirect('/profile');
            }
        })
        .catch(err =>
        {
            res.status(500).send({ message: "Error updating job with id " + id })
        });
}

exports.deleteJob = async (req, res) =>
{
    const id = req.params.id;
    console.log(id);
    await job.findByIdAndDelete(id)
        .then(async (data) =>
        {
            if (!data) {
                res.status(404).send({ message: "Cannot delete job with id " + id });
            }
            else {
                console.log(data);
                res.redirect('/profile');
            }
        })
        .catch(err =>
        {
            res.status(500).send({ message: "Error deleting job with id " + id })
        });
}

exports.viewCompany = async (req, res) =>
{
    const id = req.id;
    const role = req.role;

    if (role === "Student" || role === "Admin" || role === "Placement Manager") {
        const data = await job.find({ isVerified: true }).exec();
        const registered = [], locations = [], jobTitles = [];

        for (let i = 0; i < data.length; i++) {
            locations.push(data[i].postingLocation);
            jobTitles.push(data[i].jobName);

            const jobID = data[i]._id;
            const ok = await studentJob.findOne({ job: jobID, student: id });
            if (ok)
                registered.push(1);
            else
                registered.push(0);
        }
        const user = await student.findById(id);
        const uniqueLocations = [...new Set(locations.map(item => item))];
        const uniquejobTitles = [...new Set(jobTitles.map(item => item))];

        res.render('studentCompanyDetails', { jobs: data, registered: registered, user: user, location: uniqueLocations, titles: uniquejobTitles });
    }
    else {
        res.send('You have not access to the company list');
    }
}

exports.showCompany = async (req, res) =>
{
    const id = req.id;
    const jobID = req.params.id;
    const jobDetails = await job.findById(jobID).exec();
    const user = await student.findById(id);
    console.log(jobDetails);
    res.render('showCompany', { job: jobDetails, user: user });
}

exports.filter = async (req, res) =>
{
    const id = req.id;

    const query = { jobName: req.body.jobTitle, postingLocation: req.body.location, cpiCriteria: { $gte: req.body.cpi }, ctc: { $gte: req.body.ctc }, isVerified: true };

    if (req.body.jobTitle == "Any") {
        delete query.jobName;
    }
    if (req.body.location == "Any") {
        delete query.postingLocation;
    }
    if (req.body.cpi == "Any") {
        delete query.cpiCriteria;
    }
    if (req.body.ctc == "Any") {
        delete query.ctc;
    }
    job.find(query)
        .then(async (queryData) =>
        {
            if (!queryData) {
                res.status(404).send({ message: "Not Found" });
            }
            else {
                const registered = [], locations = [], jobTitles = [];

                for (let i = 0; i < queryData.length; i++) {
                    const jobID = queryData[i]._id;
                    const ok = await studentJob.findOne({ job: jobID, student: id });
                    if (ok)
                        registered.push(1);
                    else
                        registered.push(0);
                }

                const data = await job.find({ isVerified: true }).exec();
                for (let i = 0; i < data.length; i++) {
                    locations.push(data[i].postingLocation);
                    jobTitles.push(data[i].jobName);
                }

                const user = await student.findById(id);
                const uniqueLocations = [...new Set(locations.map(item => item))];
                const uniquejobTitles = [...new Set(jobTitles.map(item => item))];

                res.render('studentCompanyDetails', { jobs: queryData, registered: registered, user: user, location: uniqueLocations, titles: uniquejobTitles });
            }
        })
        .catch(err =>
        {
            res.status(500).send({ message: "Error while fetching data of requested query" })
        });
}

// Viraj
// generate datasheet for admin 
exports.datasheet = async (req, res) =>
{
    try {
        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Students");

        worksheet.columns = [
            { header: "firstName", key: "firstName" },
            { header: "lastName", key: "lastName" },
            { header: "email", key: "email" },
            { header: "gender", key: "gender" },
            { header: "mobileNumber", key: "mobileNumber" }
        ]

        let counter = 1;

        var userdata = await student.find({ isPlaced: false });
        //res.send(userdata);
        let users = [];

        userdata.forEach((user) =>
        {
            worksheet.addRow(user);

        });

        worksheet.getRow(1).eachCell((cell) =>
        {
            cell.font = { bold: true };
        });
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
        );

        res.setHeader("Content-Disposition", `attachment; filename=studentData.xlsx`);

        return workbook.xlsx.write(res).then(() =>
        {
            res.status(200);
        });
    }
    catch (error) {
        res.send({ status: 400, success: false, msg: error.message });
    }
};


// fetch data for admin to verify company(only super admin can verify company) , students , jobs : 
exports.verifycompany = async (req, res) =>
{
    let flag = false;
    if (req.role != "Admin") flag = true;
    const data = await company.find({ isVerified: false, isRejected: false }).exec();
    console.log(data);
    res.render('adminVerifyCompany', { record: data, isSuperAdmin: flag });

}

exports.verifystudent = async (req, res) =>
{
    let flag = false;
    if (req.role != "Admin") flag = true;
    const data = await student.find({ isVerified: false, isRejected: false }).exec();
    console.log(data);
    res.render('adminVerifyStudent', { record: data, isSuperAdmin: flag });

}

exports.verifyjob = async (req, res) =>
{
    let flag = false;
    if (req.role != "Admin") {
        flag = true;
    }
    const data = await job.find({ isVerified: false, isRejected: false }).exec();
    console.log(data);
    res.render('adminVerifyJobs', { record: data, isSuperAdmin: flag });

}



/**
  * @description Verification Functions
*/

exports.rejectStudent = async (req, res) =>
{
    const id = req.params.id;
    console.log(id);
    if (id) {
        await student.findByIdAndUpdate(id, { isRejected: true }, { useFindAndModify: false })
            .then(async (data) =>
            {
                //console.log(data);
                //const dta = await student.find({isVerified:false}).exec(); 
                //res.render('adminVerifyStudent' , {record : dta});
                //res.send(`Verified student with object id ${id}`);
                res.redirect("/unverifiedstudents")
            })
            .catch(err =>
            {
                res.status(500).send({ message: 'Student not found' });
            })
    }
    else {
        const students = await student.find({ isRejected: true }).exec();
        if (!students) {
            res.status(200).send({ message: 'All students are verified' });
            return;
        }

        // render verifyStudent page with students object
        // res.rend('verifyStudent', {students: students});
        res.send(students);
        // console.log(students.length);
    }
}

exports.rejectJob = async (req, res) =>
{
    const id = req.params.id;
    if (id) {
        await job.findByIdAndUpdate(id, { isRejected: true }, { useFindAndModify: false })
            .then(async (data) =>
            {


                // const dta = await job.find({isVerified:false}).exec(); 
                // console.log(data); 
                res.redirect("/unverifiedjobs")

            })
            .catch(err =>
            {
                res.status(500).send({ message: 'Job not found' });
            })
    }
    else {
        const jobs = await job.find({ isRejected: true }).exec();
        if (!jobs) {
            res.status(200).send({ message: 'All jobs are verified' });
            return;
        }

        // render verifyJob page with students object
        // res.rend('verifyJob', {jobs: jobs});
        res.send(jobs);
        console.log(jobs.length);
    }
}

exports.rejectCompany = async (req, res) =>
{
    const id = req.params.id;
    if (id) {
        await company.findByIdAndUpdate(id, { isRejected: true }, { useFindAndModify: false })
            .then(async (data) =>
            {
                //const dta = await company.find({isVerified:false}).exec(); 
                res.redirect("/unverifiedcompany")
            })
            .catch(err =>
            {
                res.status(500).send({ message: 'Company not found' });
            })
    }
    else {
        const companies = await company.find({ isRejected: true }).exec();
        if (!companies) {
            res.status(200).send({ message: 'All companies are verified' });
            return;
        }

        // render verifyCompany with companies object
        // res.render('verifyCompany', {companies: companies});
        res.send(companies);
        console.log(companies.length);
    }
}

exports.adminhome = async (req, res) =>
{
    let flag = false;
    if (req.role != "Admin") {
        flag = true;
    }
    res.render('adminHome', { isSuperAdmin: flag, placed: 30, male: 80 })
}

exports.adminStudents = async (req, res) =>
{

    let flag = false;
    if (req.role != "Admin") {
        flag = true;
    }

    const data = await student.find({}).exec();
    console.log(data);
    res.render('adminStudents', { students: data, isSuperAdmin: flag });

}

exports.adminJobs = async (req, res) =>
{

    let flag = false;
    if (req.role != "Admin") {
        flag = true;
    }

    const data = await job.find({}).exec();
    console.log(data);
    res.render('adminJobs', { jobs: data, isSuperAdmin: flag });

}

exports.adminCompany = async (req, res) =>
{
    let flag = false;
    if (req.role != "Admin") {
        flag = true;
    }

    const data = await company.find({}).exec();
    console.log(data);
    res.render('adminCompany', { company: data, isSuperAdmin: flag });
}


// need to modify from here 
exports.adminInterviewSchedule = async (req, res) =>
{
    let flag = false;
    if (req.role != "Admin") {
        flag = true;
    }
    const data = await job.find({ isRejected: false, isVerified: true }).exec();
    console.log(data);
    res.render('adminInterviewSchedule', { record: data, isSuperAdmin: flag });
}

exports.adminUpdateInterviewSchedule = async (req, res) =>
{
    if (!req.body) {
        return res
            .status(400)
            .send({ message: 'Data to update can not be empty' });
    }

    const id = req.params.id;
    const sd = new Date(req.body.startDate);
    const ed = new Date(req.body.endDate);

    job.findByIdAndUpdate(id, { startDate: sd, endDate: ed }, { useFindAndModify: false })
        .then(async (data) =>
        {
            // mail karo badha student ne
            res.redirect(`/mail/${id}`);
        })
        .catch((err) =>
        {
            res.status(500).send({ message: "Error occured" });
        })
}
