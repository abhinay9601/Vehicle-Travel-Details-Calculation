const express = require('express');
const { tripReports, deleteSelectedTrips, deleteAllTrips, getFilePresentStatus, getTrips, createTrips, allTripsDetails, allTripsfullDetails } = require('../controllers/tripController');
const { getUserbyId, getUserTrips, createUser } = require('../controllers/userController');
const router = express.Router();


router.post('/v1/user', createUser);
router.get('/v1/trips/:userId/:page', getTrips);
router.get('/v1/user/:id', getUserbyId);
router.delete('/v1/user/alltrips/:userId', deleteAllTrips);
router.delete('/v1/trips/:userId', deleteSelectedTrips);
router.post('/v1/trips/fulldetails', allTripsfullDetails);
router.get('/v1/user/alltrips/:userId', getUserTrips);
router.post('/v1/trips/reports', tripReports);
router.post('/v1/trips/alldetails', allTripsDetails);
router.post('/v1/trips', createTrips);
router.get('/v1/trips/checkfilename', getFilePresentStatus);


module.exports = router;
