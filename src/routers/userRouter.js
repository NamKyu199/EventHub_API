const Router = require('express');

const userRouter = Router();

const { getAllUsers, getEventsFollowed, updateFcmToken } = require('../controllers/userController')

userRouter.get('/get-all', getAllUsers)
userRouter.get('/get-followed-events', getEventsFollowed)
userRouter.post('/update-fcmtoken', updateFcmToken)

module.exports = userRouter;