const { default: mongoose } = require('mongoose');
const Trips = require('../models/Trips');
let User = require('../models/User');
const bcryptjs = require('bcryptjs');


// CHECK ANY TRIP PRESENT FOR THE LOGINED USER OR NOT
const getUserbyId = async (req, res) => {
    try {
        const User = await Trips.countDocuments({ userId: new mongoose.Types.ObjectId(req.params.id) });

        if (User === 0) {
            return res.status(200).json({ present: false });
        }
        res.status(200).json({ present: true });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

//CREATE USER
const createUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ email: email });
        if (findUser) {
            const isValid = await bcryptjs.compare(password, findUser.password);

            if (!isValid) {
                return res.json({ error: 'Invalid password', status: 400 });
            }
            res.json(findUser);
        } else {
            const saltRounds = 10;
            const hashedPassword = await bcryptjs.hash(password, saltRounds);
            const user = new User({
                email: email,
                password: hashedPassword,
                trips: []
            });
            const createdUser = await user.save();
            res.json({ ...createdUser._doc, status: true });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

//GET THE TRIPS OF THE USER
const getUserTrips = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        res.json({ trips: user.trips });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { getUserbyId, getUserTrips, createUser };