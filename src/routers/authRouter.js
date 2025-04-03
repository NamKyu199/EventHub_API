const Router = require('express');
const {
    register,
    login,
    verification,
    changePassword
} = require('../controllers/authController');

const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/verification', verification)
authRouter.post('/change-password', changePassword);

module.exports = authRouter;