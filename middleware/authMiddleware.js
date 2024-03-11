const jwt = require('jsonwebtoken');
const secret = require('../configs/secret');

async function authMiddleware(req, res, next) {
    const username = req.cookies.username;
    if (!username) {
        return res.redirect('/auth');
    }
    try {
        const token = req.cookies[`${username}_token`];
        await jwt.verify(token, secret);
        next();
    } catch (error) {
       if (error.name === 'TokenExpiredError') {
           return res.redirect('/auth/relogin');
       }
       return res.redirect('/auth/login');
    }
}

module.exports = authMiddleware;