const Router = require('express');

const eventRouter = Router();

const { addNewEvent, getEvents, updateFollowers, getFollowers, ceartCategory, getCategories } = require('../controllers/eventController');

eventRouter.post('/add-new', addNewEvent);
eventRouter.get('/get-event', getEvents);
eventRouter.post('/update-followers', updateFollowers);
eventRouter.get('/get-followers', getFollowers);
eventRouter.post('/creat-category', ceartCategory)
eventRouter.get('/get-categories', getCategories)

module.exports = eventRouter;