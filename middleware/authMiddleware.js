const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const secret = require('../configs/secret');

async function authMiddleware(req, res, next) {
    let username;
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/auth/register');
    }
    try {
        const decoded = jwt.verify(token, secret);
        const user = await User.findOne({ _id: decoded.userId });
        req.user = user.username;
        username = user.username;
        next();
    } catch {
        req.cookie('username', username, { httpOnly: true });
        return res.redirect('/auth/login');
    }
}

module.exports = authMiddleware;