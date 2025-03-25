const Router = require('express');

const userRouter = Router();

const { getAllUsers, getEventsFollowed } = require('../controllers/userController')

userRouter.get('/get-all', getAllUsers)
userRouter.get('/get-followed-events', getEventsFollowed)

module.exports = userRouter;