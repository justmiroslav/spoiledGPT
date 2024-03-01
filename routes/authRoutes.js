const router = require('express').Router();
const authController = require('../controllers/authController');

router.get('/register', authController.getRegisterPage);
router.get('/login', authController.getLoginPage);
router.get('/logout', authController.logoutUser);
router.post('/post/register', authController.registerUser);
router.post('/post/login', authController.loginUser);

module.exports = router;