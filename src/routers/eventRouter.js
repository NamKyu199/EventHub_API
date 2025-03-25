const Router = require('express');

const eventRouter = Router();

const { addNewEvent, getEvents, updateFollowers, getFollowers } = require('../controllers/eventController');

eventRouter.post('/add-new', addNewEvent);
eventRouter.get('/get-event', getEvents);
eventRouter.post('/update-followers', updateFollowers);
eventRouter.get('/get-followers', getFollowers);


module.exports = eventRouter;