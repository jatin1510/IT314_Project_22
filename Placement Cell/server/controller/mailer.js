const nodemailer = require('nodemailer');
const { student } = require('../model/model');

function delay(time)
{
    return new Promise(resolve => setTimeout(resolve, time));
}

const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
        user: "placementdaiict@outlook.com",
        pass: "placement@daiictgroup22",
    },
});

// const emails = student.find({ isPlaced: false });
// const emails = ["jatinranpariya1510@gmail.com", "jbranpariya15@gmail.com", "anonymousdaiict@gmail.com"];
const emails = ["anonymousdaiict@gmail.com"];
// const emails = ["202001226@daiict.ac.in"];
// const emails = ["202001226@daiict.ac.in", "202001202@daiict.ac.in", "202003039@daiict.ac.in", "202003042@daiict.ac.in", "202001267@daiict.ac.in"];

const CompanyName = "Google";

const start_date = new Date();
const end_date = new Date();
end_date.setDate(end_date.getDate() + 1);

const locations = ["Mumbai"];
const openfor = ["M.Tech", "B.Tech ICT"];

const JobName = "Software Engineer";
const CpiCriteria = 8.2;
const ctc = 32.5;
const description = "Hello Come on, Get Placed on Google";


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

async function automate()
{
    // for (let i = 0; i < emails.length; i++) {
    //     options.to = emails[i];
    //     console.log(options);
    //     await delay(1500);
    // }
    transporter.sendMail(options, function (err, info)
    {
        if (err) {
            console.log("Error occured", err);
            return;
        }
        console.log("Sent: ", info.response);
    });
}
console.log(options);
// automate();