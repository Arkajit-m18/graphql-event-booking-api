const mongoose = require('mongoose');

const Event = require('../../models/event');
const User = require('../../models/user');
const { transformedEvent } = require('./merge');

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            // .populate('creator')
            return events.map(event => {
                return transformedEvent(event);
                // creator: {
                //     ...event._doc.creator._doc,
                //     password: null
                // }
            });
        }
        catch(err) {
            console.log(err);
            throw err;
        };
    },
    createEvent: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated');
        }
        try {
            const event = new Event({
                _id: new mongoose.Types.ObjectId(),
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: req.userId
            });
            let createdEvent;
            const result = await event.save();
            createdEvent = transformedEvent(result);
            const creator = await User.findById(req.userId);
            if (!creator) {
                throw new Error('User doesn\'t exixt' );
            }
            creator.createdEvents.push(event);
            await creator.save();
            return createdEvent;
        }
        catch(err) {
            console.log(err);
            throw err;
        };
    }
}