const Router = require('express');

const userRouter = Router();

const { getAllUsers, getEventsFollowed, updateFcmToken, getProfile, getFollowers, updateProfile } = require('../controllers/userController')

userRouter.get('/get-all', getAllUsers)
userRouter.get('/get-followed-events', getEventsFollowed)
userRouter.post('/update-fcmtoken', updateFcmToken)
userRouter.get('/get-profile', getProfile)
userRouter.get('/get-followers', getFollowers)
userRouter.put('/update-profile', updateProfile)

module.exports = userRouter;