const { default: mongoose } = require('mongoose');
const Trips = require('../models/Trips');
const geolib = require('geolib');
const moment = require('moment');
const User = require('../models/User');


// GET ALL THE TRIPS OF LOGINED USER
const getTrips = async (req, res) => {
    try {
        const userId = req.params.userId;
        const response = await User.findById(userId);

        const paginatedArr = response.trips.slice((req.params.page - 1) * 10, req.params.page * 10);

        res.json({ response: paginatedArr, totalTrips: response.trips.length });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get a single Trip by ID
const getTripsById = async (req, res) => {
    try {
        const Trip = await Trips.findById(req.params.id);
        if (!Trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }
        res.json(Trip);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

//UPLOAD TRIP
const createTrips = async (req, res) => {
    try {
        const data = req.body.data;
        const alldata = await data.filter((e) => e.latitude !== '')
        const bulkWriteOperations = alldata.map(trip => {
            const filter = {
                latitude: trip.latitude,
                longitude: trip.longitude,
                timestamp: trip.timestamp,
                userId: trip.userId,
                ignition: trip.ignition,
                fileName: trip.fileName
            };
            return {
                updateOne: {
                    filter,
                    update: { $set: trip },
                    upsert: true,
                    new: true
                }
            };
        });
        const result = await Trips.bulkWrite(bulkWriteOperations, { ordered: false });

        let savefilename;
        savefilename = await User.updateOne({ _id: alldata[0].userId }, { $push: { trips: alldata[0].fileName } })

        res.json({ result, savefilename });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

// TRIP FULL DETAILS
const allTripsfullDetails = async (req, res) => {
    function haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const lat1Rad = lat1 * Math.PI / 180;
        const lat2Rad = lat2 * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }

    const data = req.body.data;
    const totalDistance = data.reduce((acc, current, index, array) => {
        if (index === 0) return acc;
        const previous = array[index - 1];
        const distance = haversineDistance(previous.latitude, previous.longitude, current.latitude, current.longitude);
        return acc + distance;
    }, 0);

    const timestamps = data.map(item => new Date(item.timestamp));
    const earliestTimestamp = Math.min(...timestamps.map(timestamp => timestamp.getTime()));
    const latestTimestamp = Math.max(...timestamps.map(timestamp => timestamp.getTime()));

    const totalDuration = latestTimestamp - earliestTimestamp;

    const totalDurationInHours = Math.floor(totalDuration / (1000 * 60 * 60));
    const totalDurationInMinutes = Math.floor((totalDuration % (1000 * 60 * 60)) / (1000 * 60));
    const totalDurationInSeconds = Math.floor((totalDuration % (1000 * 60)) / 1000);
    const overSpeedingPoints = data.filter(point => point.overSpeed);
    const overSpeedingTimestamps = overSpeedingPoints.map(item => new Date(item.timestamp));
    const earliestOverSpeedingTimestamp = Math.min(...overSpeedingTimestamps.map(timestamp => timestamp.getTime()));
    const latestOverSpeedingTimestamp = Math.max(...overSpeedingTimestamps.map(timestamp => timestamp.getTime()));
    const overSpeedingDuration = latestOverSpeedingTimestamp - earliestOverSpeedingTimestamp;
    const overSpeedingDurationInHours = Math.floor(overSpeedingDuration / (1000 * 60 * 60));
    const overSpeedingDurationInMinutes = Math.floor((overSpeedingDuration % (1000 * 60 * 60)) / (1000 * 60));
    const overSpeedingDurationInSeconds = Math.floor((overSpeedingDuration % (1000 * 60)) / 1000);

    const overSpeedingDistance = overSpeedingPoints.reduce((acc, current, index, array) => {
        if (index === 0) return acc;
        const previous = array[index - 1];
        const distance = haversineDistance(previous.latitude, previous.longitude, current.latitude, current.longitude);
        return acc + distance;
    }, 0);

    const stoppedPoints = data.filter(point => point.stopped);
    const stoppedTimestamps = stoppedPoints.map(item => new Date(item.timestamp));
    const earliestStoppedTimestamp = Math.min(...stoppedTimestamps.map(timestamp => timestamp.getTime()));
    const latestStoppedTimestamp = Math.max(...stoppedTimestamps.map(timestamp => timestamp.getTime()));

    const stoppedDuration = latestStoppedTimestamp - earliestStoppedTimestamp;
    const stoppedDurationInHours = Math.floor(stoppedDuration / (1000 * 60 * 60));
    const stoppedDurationInMinutes = Math.floor((stoppedDuration % (1000 * 60 * 60)) / (1000 * 60));
    const stoppedDurationInSeconds = Math.floor((stoppedDuration % (1000 * 60)) / 1000);

    res.json({
        totalDistance: totalDistance,
        totalDuration: {
            hours: totalDurationInHours,
            minutes: totalDurationInMinutes,
            seconds: totalDurationInSeconds
        },
        overSpeedingDuration: {
            hours: overSpeedingDurationInHours,
            minutes: overSpeedingDurationInMinutes,
            seconds: overSpeedingDurationInSeconds
        },
        overSpeedingDistance: overSpeedingDistance,
        stoppedDuration: {
            hours: stoppedDurationInHours,
            minutes: stoppedDurationInMinutes,
            seconds: stoppedDurationInSeconds
        }
    });
}

function formatDuration(duration) {
    const minutes = Math.floor(duration / 60000);
    return `${minutes} mins`;
}
function getTripsData(tripsData) {
    tripsData.forEach((trip, index) => {
        const previousTrip = tripsData[index - 1];
        // Calculate distance and speed
        const distance = geolib.getDistance(
            { latitude: previousTrip?.latitude || 0, longitude: previousTrip?.longitude || 0 },
            { latitude: trip.latitude, longitude: trip.longitude }
        );
        const timeDiff = moment(trip.timestamp).diff(moment(previousTrip?.timestamp || 0));
        const speed = distance / timeDiff * 3600; // convert to km/h
        // Calculate overSpeed
        trip.overSpeed = speed > 60;

        // Calculate idling and stopped
        if (speed === 0) {
            if (trip.ignition === 'on') {
                trip.idling = true;
            } else {
                trip.stopped = true;
            }
        } else {
            trip.idling = false;
            trip.stopped = false;
        }

        // Calculate durationForStopped and durationForIdling
        if (trip.stopped) {
            const stoppedTimeDiff = moment(previousTrip.timestamp).diff(moment(trip.timestamp));
            trip.durationForStopped = formatDuration(stoppedTimeDiff);
        } else {
            trip.durationForStopped = `0 mins`;
        }
        if (trip.idling) {
            const idlingTimeDiff = moment(previousTrip.timestamp).diff(moment(trip.timestamp));
            trip.durationForIdling = formatDuration(idlingTimeDiff);
        } else {
            trip.durationForIdling = `0 mins`;
        }
    });
    return tripsData;
}

//FETCH ALL TRIP DETAILS
const allTripsDetails = async (req, res) => {
    try {
        const pipeline = [
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.body.userId),
                },
            },
        ];

        if (req.body.fileName !== '') {
            pipeline.push({
                $match: {
                    fileName: req.body.fileName,
                },
            });
        }

        pipeline.push({
            $sort: {
                timestamp: -1, // Sort by timestamp in descending order (newest first)
            },
        });

        const AllTrips = await Trips.aggregate(pipeline);
        const result = await getTripsData(AllTrips);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};


//CHECK WHEATHER THE SELECTED FILE IS PRESENT OR NOT
const getFilePresentStatus = async (req, res) => {
    try {
        const filename = req.query.filename;
        const checkfilename = await Trips.findOne({ fileName: filename, userId: req.query.userId });
        res.json({ present: checkfilename?._id ? true : false });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

//DELETE THE SELECTED FILES
const deleteSelectedTrips = async (req, res) => {
    try {
        const deleteDatas = req.body;
        let response;
        for (let index = 0; index < deleteDatas.length; index++) {
            const element = deleteDatas[index];
            response = await Trips.deleteMany({ fileName: element.tripname });
            const finduser = await User.findById(req.params.userId);
            const updatedtrips = finduser.trips.filter((e) => e != element.tripname)
            await User.updateOne({ _id: req.params.userId }, { $set: { trips: updatedtrips } })
        }
        res.json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

//DELETE ALL THE TRIPS
const deleteAllTrips = async (req, res) => {
    try {
        const deleteDatas = req.params;
        const response = await Trips.deleteMany({ userId: req.params.userId });
        await User.updateOne({ _id: deleteDatas.userId }, { $set: { trips: [] } })
        res.json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const reportdetails = (arr) => {

    let entrypoint = [];
    let stoppedpoint = [];
    let entrystopped = false;
    arr.forEach((trip) => {
        if (!trip.stopped) {
            if (entrypoint.length && !entrystopped) {
                entrypoint[entrypoint.length - 1].push(trip)
            } else {
                entrypoint.push([trip])
                entrystopped = false;
            }
        } else {
            trip.speed = 0;
            stoppedpoint.push(trip)
            entrystopped = true;
        }
    })

    let speedreport = []
    let totaldata;
    entrypoint.forEach((e) => {
        if (e.length > 1) {
            totaldata = calculateSpeed(arr[e.length - 1], arr[0]);
        } else {
            totaldata = calculateSpeed(arr[e.length - 1], arr[0]);
        }
        e.forEach((r) => {
            r.speed = Math.ceil(totaldata?.totalspeed ? totaldata?.totalspeed : totaldata);
            speedreport.push(r);
        });
    });

    let stoppedDuration = [];
    for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        if (element.stopped) {
            if (arr.length == 1) {
                stoppedDuration.push(element);
                stoppedDuration.push(element);
            }
            stoppedDuration.push(arr[index - 1]);
            stoppedDuration.push(element);
        }

    }
    let stoppedtime;
    if (stoppedDuration.length) {
        stoppedtime = calculateSpeed(stoppedDuration[stoppedDuration.length - 1], stoppedDuration[0]);
    }

    let overspeedDuration = [];
    for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        if (element.overSpeed) {
            if (arr.length == 1) {
                overspeedDuration.push(element);
                overspeedDuration.push(element);
            }
            overspeedDuration.push(arr[index - 1]);
            overspeedDuration.push(element);
        }
    }
    let overspeedtime;
    if (overspeedDuration.length) {
        overspeedtime = calculateSpeed(overspeedDuration[overspeedDuration.length - 1], overspeedDuration[0]);
    }

    let setDistTime = {
        totalDistance: totaldata.distance,
        totalDuration: totaldata.timeDiff,
        overspeedtimeduration: overspeedtime?.timeDiff ? overspeedtime?.timeDiff : 0,
        stoppedtimeduratime: stoppedtime?.timeDiff ? stoppedtime?.timeDiff : 0
    }

    const outputs = [...speedreport, ...stoppedpoint];

    const sortedoutputs = outputs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const finaloutputs = []
    for (let index = 0; index < sortedoutputs.length - 1; index++) {
        const trip1 = sortedoutputs[index];
        const trip2 = sortedoutputs[index + 1];
        const date1 = new Date(trip1.timestamp);
        const date2 = new Date(trip2.timestamp);
        const formattedTime1 = date1.toLocaleTimeString("en-US", { hour12: true });
        const formattedTime2 = date2.toLocaleTimeString("en-US", { hour12: true });
        finaloutputs.push({
            time: `${formattedTime1} to ${formattedTime2}`,
            points: `${parseFloat(trip2.latitude).toFixed(4)},${parseFloat(trip2.longitude).toFixed(4)}`,
            ignition: trip1.ignition,
            speed: trip1.ignition === 'off' ? '0' : trip1.speed
        })
    }
    if (sortedoutputs.length === 1) {
        const date = new Date(sortedoutputs[0].timestamp);
        const formattedTime = date.toLocaleTimeString("en-US", { hour12: true });
        finaloutputs.push({
            time: `${formattedTime}`,
            points: `${parseFloat(sortedoutputs[0].latitude).toFixed(4)},${parseFloat(sortedoutputs[0].longitude).toFixed(4)}`,
            ignition: sortedoutputs[0].ignition,
            speed: sortedoutputs[0].speed
        })
    }

    function calculateSpeed(point1, point2) {
        const distance = haversineDistance(point1.longitude, point1.latitude, point2.longitude, point2.latitude);
        const seconds = getTimeDiff(point1.timestamp, point2.timestamp);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const totalspeed = (distance / seconds) * 3600;
        return { distance, timeDiff: `${minutes} min ${remainingSeconds} sec`, totalspeed: totalspeed ? totalspeed : 1 }
    }

    function haversineDistance(long1, lat1, long2, lat2) {
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLong = toRad(long2 - long1);

        const lat1Rad = toRad(lat1);
        const lat2Rad = toRad(lat2);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLong / 2) * Math.sin(dLong / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;
    }

    function toRad(deg) {
        return deg * Math.PI / 180;
    }

    function getTimeDiff(timestamp1, timestamp2) {
        const date1 = new Date(timestamp1);
        const date2 = new Date(timestamp2);

        return (date2 - date1) / 1000;
    }
    return {
        finaloutputs: finaloutputs,
        setDistTime: setDistTime
    }

};

//GET THE TRIP REPORTS
const tripReports = async (req, res) => {
    try {
        const totaltrips = await Trips.countDocuments({
            userId: new mongoose.Types.ObjectId(req.body.userId),
            fileName: req.body.fileName
        });

        const trips = await Trips.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.body.userId),
                    fileName: req.body.fileName
                }
            },
            {
                $sort: {
                    timestamp: -1 // Sort by timestamp in descending order (newest first)

                }
            },
            {
                $skip: (req.body.page - 1) * 10
            },
            {
                $limit: 11
            }
        ]);
        const addedOverspeedandStopped = getTripsData(trips)

        const response = reportdetails(addedOverspeedandStopped);
        const result = { totaltrips: totaltrips, response };
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}



module.exports = {
    deleteSelectedTrips,
    tripReports,
    deleteAllTrips,
    getTrips,
    getFilePresentStatus,
    getTripsById,
    createTrips,
    allTripsDetails,
    allTripsfullDetails
};