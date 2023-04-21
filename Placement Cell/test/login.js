let chai = require("chai");
let chaiHttp = require("chai-http");

// Assertion Style
chai.should();
chai.use(chaiHttp);

describe('Testing route /login', () =>
{
    const host = `http://localhost:3000`;
    const path = "/login";

    // Role Student
    it("Role Student: With All valid Credentials", (done) =>
    {
        chai
            .request(host)
            .get(path)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ email: '202001226@daiict.ac.in', password: 'jatin1510', role: 'Student' })
            .end(function (error, response, body)
            {
                response.should.have.status(200);
                done();
            });

    });
    it("Role Student: Student email does not contain in our database", (done) =>
    {
        chai
            .request(host)
            .get(path)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ email: '202001258@daiict.ac.in', password: 'jatin1510', role: 'Student' })
            .end(function (error, response, body)
            {
                response.should.have.status(500);
                done();
            });

    });
    it("Role Student: With null email address", (done) =>
    {
        chai
            .request(host)
            .get(path)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ email: '', password: 'jatin1510', role: 'Student' })
            .end(function (error, response, body)
            {
                response.should.have.status(500);
                done();
            });

    });
    it("Role Student: With Wrong Password", (done) =>
    {
        chai
            .request(host)
            .get(path)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ email: '202001226@daiict.ac.in', password: 'jatin15102002', role: 'Student' })
            .end(function (error, response, body)
            {
                response.should.have.status(500);
                done();
            });
    });

    // Role Student
    it("Role Company: With All valid Credentials", (done) =>
    {
        chai
            .request(host)
            .get(path)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ email: 'google@gmail.com', password: 'google', role: 'Company' })
            .end(function (error, response, body)
            {
                response.should.have.status(200);
                done();
            });

    });
    it("Role Company: Company email does not contain in our database", (done) =>
    {
        chai
            .request(host)
            .get(path)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ email: 'mocha@gmail.com', password: 'mochi', role: 'Company' })
            .end(function (error, response, body)
            {
                response.should.have.status(500);
                done();
            });

    });
    it("Role Company: With null email address", (done) =>
    {
        chai
            .request(host)
            .get(path)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ email: '', password: 'password', role: 'Company' })
            .end(function (error, response, body)
            {
                response.should.have.status(500);
                done();
            });

    });
    it("Role Company: With Wrong Password", (done) =>
    {
        chai
            .request(host)
            .get(path)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ email: 'google@gmail.com', password: 'googlers', role: 'Company' })
            .end(function (error, response, body)
            {
                response.should.have.status(500);
                done();
            });
    });

    // Role Admin
    it("Role Admin: With All valid Credentials", (done) =>
    {
        chai
            .request(host)
            .get(path)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ email: '202003039@daiict.ac.in', password: 'iammukli', role: 'Admin' })
            .end(function (error, response, body)
            {
                response.should.have.status(200);
                done();
            });

    });
    it("Role Admin: Admin email does not contain in our database", (done) =>
    {
        chai
            .request(host)
            .get(path)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ email: '202001196@daiict.ac.com', password: 'viraj', role: 'Admin' })
            .end(function (error, response, body)
            {
                response.should.have.status(500);
                done();
            });

    });
    it("Role Admin: With null email address", (done) =>
    {
        chai
            .request(host)
            .get(path)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ email: '', password: 'password', role: 'Admin' })
            .end(function (error, response, body)
            {
                response.should.have.status(500);
                done();
            });

    });
    it("Role Admin: With Wrong Password", (done) =>
    {
        chai
            .request(host)
            .get(path)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ email: '202003039@daiict.ac.in', password: 'iamMukundLadani', role: 'Admin' })
            .end(function (error, response, body)
            {
                response.should.have.status(500);
                done();
            });
    });

    // Role Placement Manager
    it("Role Placement Manager: With All valid Credentials", (done) =>
    {
        chai
            .request(host)
            .get(path)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ email: 'placement@daiict.ac.in', password: 'superadmin', role: 'Placement Manager' })
            .end(function (error, response, body)
            {
                response.should.have.status(200);
                done();
            });

    });
    it("Role Placement Manager: With Wrong Password", (done) =>
    {
        chai
            .request(host)
            .get(path)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ email: 'placement@daiict.ac.in', password: 'notsuperadmin', role: 'Placement Manager' })
            .end(function (error, response, body)
            {
                response.should.have.status(500);
                done();
            });
    });

    // Role changes for login
    it("Logging in with Student Email but Role is Admin", (done) =>
    {
        chai
            .request(host)
            .get(path)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ email: '202001226@daiict.ac.in', password: 'jatin1510', role: 'Admin' })
            .end(function (error, response, body)
            {
                response.should.have.status(500);
                done();
            });
    });
    it("Logging in with Company Email but Role is Student", (done) =>
    {
        chai
            .request(host)
            .get(path)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ email: 'google@gmail.com', password: 'google', role: 'Student' })
            .end(function (error, response, body)
            {
                response.should.have.status(500);
                done();
            });
    });
    it("Logging in with Admin Email but Role is Company", (done) =>
    {
        chai
            .request(host)
            .get(path)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ email: '202003039@daiict.ac.in', password: 'immukli', role: 'Company' })
            .end(function (error, response, body)
            {
                response.should.have.status(500);
                done();
            });
    });
    it("Logging in with Placement Manager Email but Role is Student", (done) =>
    {
        chai
            .request(host)
            .get(path)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({ email: 'placement@daiict.ac.in', password: 'superadmin', role: 'Student' })
            .end(function (error, response, body)
            {
                response.should.have.status(500);
                done();
            });
    });
});