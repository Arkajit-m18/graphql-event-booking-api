const mongoose = require('mongoose');

const Booking = require('../../models/booking');
const Event = require('../../models/event');
const { transformedBooking, transformedEvent } = require('./merge');

module.exports = {
    bookings: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated');
        }
        try {
            const bookings = await Booking.find({user: req.userId});
            return bookings.map(booking => {
                return transformedBooking(booking);
            });
        }
        catch(err) {
            console.log(err);
            throw err;
        };
    },
    bookEvent: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated');
        }
        try {
            const event = await Event.findOne({_id: args.eventId});
            const booking = new Booking({
                _id: new mongoose.Types.ObjectId(),
                user: req.userId,
                event: event
            });
            const result = await booking.save();
            return transformedBooking(result);
        }
        catch(err) {
            console.log(err);
            throw err;
        };
    },
    cancelBooking: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated');
        }
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = transformedEvent(booking.event);
            await Booking.deleteOne({_id: args.bookingId});
            return event;
        }
        catch(err) {
            console.log(err);
            throw err;
        };
    }
}