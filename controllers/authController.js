const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret= require('../configs/secret');

function generateAccessToken(userId) {
    const payload = { userId };
    return jwt.sign(payload, secret, { expiresIn: '24h' });
}

function getAuthPage(req, res) {
    res.render('auth');
}

function getRegisterPage(req, res) {
    res.render('register');
}

function getLoginPage(req, res) {
    res.render('login');
}

function getReloginPage(req, res) {
    const username = req.cookies.username;
    res.render('logout', { username: username });
}

function getLogoutPage(req, res) {
    const username = req.cookies.username;
    res.clearCookie('username');
    res.clearCookie(`${username}_token`);
    res.render('auth');
}

async function registerUser(req, res) {
    const { username, email, password } = req.body;
    const candidateByUsername = await User.findOne({ username: username });
    if (candidateByUsername) {
        return res.status(400).json({ message: 'User with this username already exists' });
    }
    const candidateByEmail = await User.findOne({ email: email });
    if (candidateByEmail) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await new User({ username, email, password: hashedPassword }).save();
    const token = generateAccessToken(user._id);
    await res.cookie('username', username, { httpOnly: true });
    await res.cookie(`${username}_token`, token, { httpOnly: true });
    return res.status(200).json({ message: 'User created' });
}

async function loginUser(req, res) {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    if (!user) {
        return res.status(400).json({ message: `User ${username} not found` });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid password' });
    }
    const token = generateAccessToken(user._id);
    if (!req.cookies.username) {
        await res.cookie('username', username, { httpOnly: true });
    }
    await res.cookie(`${username}_token`, token, { httpOnly: true });
    return res.status(200).json({ message: 'User logged in' });
}

module.exports = {
    getAuthPage,
    getRegisterPage,
    getLoginPage,
    getReloginPage,
    getLogoutPage,
    registerUser,
    loginUser
}
