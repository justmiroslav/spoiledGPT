const router = require('express').Router();
const authController = require('../controllers/authController');

router.get('/', authController.getAuthPage);
router.get('/register', authController.getRegisterPage);
router.get('/login', authController.getLoginPage);
router.get('/relogin', authController.getReloginPage);
router.get('/logout', authController.getLogoutPage);
router.post('/post/register', authController.registerUser);
router.post('/post/login', authController.loginUser);

module.exports = router;