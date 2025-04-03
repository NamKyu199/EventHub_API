const Router = require('express');

const userRouter = Router();

const {
    getAllUsers,
    getEventsFollowed,
    updateFcmToken,
    getProfile,
    getFollowers,
    updateProfile,
    updateInterests,
    toggleFollowing,
    getFollowing,
    pushInviteNotification,
    getInvitedUsers
} = require('../controllers/userController')

userRouter.get('/get-all', getAllUsers)
userRouter.get('/get-followed-events', getEventsFollowed)
userRouter.post('/update-fcmtoken', updateFcmToken)
userRouter.get('/get-profile', getProfile)
userRouter.get('/get-followers', getFollowers)
userRouter.get('/get-following', getFollowing)
userRouter.put('/update-profile', updateProfile)
userRouter.put('/update-interests', updateInterests)
userRouter.put('/update-following', toggleFollowing)
userRouter.post('/send-invite', pushInviteNotification)
userRouter.get('/get-invited-users', getInvitedUsers)

module.exports = userRouter;