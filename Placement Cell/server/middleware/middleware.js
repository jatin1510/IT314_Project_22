const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'config.env' });

exports.authorization = (req, res, next) =>
{
    const token = req.cookies.jwt;
    if (!token) {
        // simply return to login page
        return res
            .status(500)
            .send({
                message: 'Access denied, You need to login or sign up.',
            });;
    }

    console.log(token);
    try {
        const data = jwt.verify(token, "viratian-forever-AND-marvelian-forever-AND-placementcell-forever");
        console.log(data);
        req.id = data.id;
        req.email = data.email;
        req.role = data.role;
        next();
    } catch {
        return res
            .sendStatus(403)
            .send('Invalid Token');
    }
}