const Router = require('express');

const userRouter = Router();

const { getAllUsers } = require('../controllers/userController')

userRouter.get('/get-all', getAllUsers)

module.exports = userRouter;