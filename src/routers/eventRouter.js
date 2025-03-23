const Router = require('express');

const eventRouter = Router();

const { addNewEvent, getEvents } = require('../controllers/eventController')

eventRouter.post('/add-new', addNewEvent);
eventRouter.get('/get-event', getEvents);

module.exports = eventRouter;