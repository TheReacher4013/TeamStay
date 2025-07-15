const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');

router.post('/book-home', async (req, res) => {
    const { homeId, date, guests, bookingName, bookingAge, paymentMethod } = req.body;
    const userId = req.session.user ? req.session.user._id : null;

    if (!userId) {
        return res.redirect('/login');
    }

    // Duplicate booking check
    const existing = await Booking.findOne({ homeId, user: userId, date: new Date(date) });
    if (existing) {
        return res.send('Customer have already booked this home for this date.');
    }

    try {
        // Home ki price nikalne ke liye Home model import karein
        const Home = require('../models/home');
        const home = await Home.findById(homeId);

        const totalPayment = home.price * guests;

        const booking = new Booking({
            homeId: homeId,
            user: userId,
            date: date,
            guests: guests,
            bookingName: bookingName,
            bookingAge: bookingAge,
            paymentMethod: paymentMethod,
            totalPayment: totalPayment
        });
        await booking.save();
        res.redirect('/bookings');
    } catch (err) {
        console.error(err);
        res.status(500).send('Booking failed.');
    }
});

router.post('/cancel/:bookingId', async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.bookingId);
        res.redirect('/bookings');
    } catch (err) {
        res.status(500).send('Cancel failed');
    }
});

module.exports = router;