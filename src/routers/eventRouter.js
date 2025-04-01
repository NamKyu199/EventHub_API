const Router = require('express');

const eventRouter = Router();

const { addNewEvent, getEvents, updateFollowers, getFollowers, ceartCategory, getCategories, searchEvent } = require('../controllers/eventController');

eventRouter.post('/add-new', addNewEvent);
eventRouter.get('/get-event', getEvents);
eventRouter.post('/update-followers', updateFollowers);
eventRouter.get('/get-followers', getFollowers);
eventRouter.post('/creat-category', ceartCategory)
eventRouter.get('/get-categories', getCategories)
eventRouter.get('/get-search-events', searchEvent)

module.exports = eventRouter;