const axios = require('axios');
const bcrypt = require('bcrypt');
const { student, company, admin, job } = require('../model/model');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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
                    res.cookie("jwt", token, { maxAge: cookie_expires_in, httpOnly: true });
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
                    res.cookie("jwt", token, { maxAge: cookie_expires_in, httpOnly: true });
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
                            res.cookie("jwt", token, { maxAge: cookie_expires_in, httpOnly: true });
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
                            res.cookie("jwt", token, { maxAge: cookie_expires_in, httpOnly: true });
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
                    res.send(data);
                })
                .catch(err =>
                {
                    res.status(500).send(err);
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

    if (role == "Student") {
        await student.find({ id: id })
            .then((data) =>
            {
                // render to update student page ex. {/updateStudent/:id}
                res.send(data);
            })
            .catch((err) =>
            {
                res
                    .status(500)
                    .send({ message: `Error retrieving user with email ${email}` });
            });
    }
    else if (role == "Company") {
        await company.find({ id: id })
            .then((data) =>
            {
                // render to update company page ex. {/updateCompany/:id}
                res.send(data);
            })
            .catch((err) =>
            {
                res
                    .status(500)
                    .send({ message: `Error retrieving user with email ${email}` });
            });
    }
    else {
        await admin.find({ id: id })
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
    await student.findByIdAndUpdate(id, stored, { useFindAndModify: false })
        .then((data) =>
        {
            if (!data) {
                res.status(400).send({ message: `Cannot update student with ${id}. May be user not found!` })
            } else {
                if (req.body.email) {
                    // updating email in cookie
                    res.clearCookie("jwt");
                    const token = generateToken(data._id, req.body.email, role);
                    res.cookie("jwt", token, { maxAge: cookie_expires_in, httpOnly: true });
                }
                res.send(stored);
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
                if (req.body.email) {
                    // updating email in cookie
                    res.clearCookie("jwt");
                    const token = generateToken(data._id, req.body.email, role);
                    res.cookie("jwt", token, { maxAge: cookie_expires_in, httpOnly: true });
                }
                res.send(stored);
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

    if (role !== "Placement Manager" && role !== "Admin") {
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
    await admin.findByIdAndUpdate(id, stored, { useFindAndModify: false })
        .then((data) =>
        {
            if (!data) {
                res.status(400).send({ message: `Cannot update admin with ${id}. May be user not found!` })
            } else {
                if (req.body.email) {
                    // updating email in cookie
                    res.clearCookie("jwt");
                    const token = generateToken(data._id, req.body.email, role);
                    res.cookie("jwt", token, { maxAge: cookie_expires_in, httpOnly: true });
                }
                res.send(stored);
            }
        })
        .catch(err =>
        {
            res.status(500).send({ message: 'Error update admin information' });
        })
}

/**
  * @description Logout current user
  */
exports.logoutUser = async (req, res) =>
{
    res
        .clearCookie("jwt")
        .status(200)
        .send({ message: "Successfully logged out!!" });

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

// Auto Mail
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

    const students = await student.find({ isPlaced: false }).exec();
    const emails = [];
    for (let i = 0; i < students.length; i++) {
        emails.push(students[i].email);
    }

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
            res.send(data);
            const companyId = data.comp;
            company.findById(companyId)
                .then((companyData) =>
                {
                    const CompanyName = companyData.companyName;

                    const JobName = data.jobName;
                    const locations = data.postingLocation;
                    const openfor = data.ugCriteria;
                    const CpiCriteria = data.cpiCriteria;
                    const ctc = data.ctc;
                    const description = data.description;

                    const start_date = new Date();
                    const end_date = new Date();
                    end_date.setDate(end_date.getDate() + 1);

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

                    transporter.sendMail(options, function (err, info)
                    {
                        if (err) {
                            console.log("Error occured", err);
                            return;
                        }
                        console.log("Sent: ", info.response);
                    });
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