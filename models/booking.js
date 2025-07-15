const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    homeId: { type: Schema.Types.ObjectId, ref: 'Home', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // 'user' hona chahiye
    date: { type: Date, required: true },
    guests: { type: Number, required: true },
    bookingName: { type: String, required: true }, // new
    bookingAge: { type: Number, required: true },  // new
    paymentMethod: { type: String, required: true }, // new
    totalPayment: { type: Number, required: true } // new
});


module.exports = mongoose.model('Booking', bookingSchema);