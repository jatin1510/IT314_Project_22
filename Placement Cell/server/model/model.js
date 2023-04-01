const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    // verify all negative numbers
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    middleName: { type: String, required: false },
    lastName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    alternateMobileNumber: { type: String, required: false },
    tenthPercentage: { type: Number, required: true },
    twelfthPercentage: { type: Number, required: true },
    cpi: { type: Number, required: true },
    activeBacklog: { type: Number, required: true },
    totalBacklog: { type: Number, required: true },
    branch: { type: String, required: true },
    resume: { type: String, require: true },
    isVerified: { type: Boolean, default: false },
    isPlaced: { type: Boolean, default: false },
});

const companySchema = new Schema({
    email: { type: String, required: true, unique: true },
    website: { type: String, required: true },
    companyName: { type: String, required: true },
    hrName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
});

const adminSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: Number, default: 2 },
});

const jobSchema = new Schema({
    comp: { type: mongoose.Schema.Types.ObjectId, ref: 'company' },
    postingLocation: { type: String, require: true },
    ugCriteria: [{ type: String, require: true }],
    cpiCriteria: { type: Number, require: true },
    ctc: { type: mongoose.Number, require: true },
    description: { type: String, require: true },
    startDate: { type: Date, default: new Date() },
    endDate: { type: Date, default: new Date() },
});

const student = mongoose.model('Student', studentSchema);
const company = mongoose.model('Company', companySchema);
const admin = mongoose.model('Admin', adminSchema);
const job = mongoose.model('Job', jobSchema);

module.exports = { student, company, admin, job };