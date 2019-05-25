const { dateToString } = require('../../helpers/date');
const Event = require('../../models/event');
const User = require('../../models/user');

const events = async eventIds => {
    try {
        const events = await Event.find({_id: {$in: eventIds}});
        return events.map(event => {
            return transformedEvent(event);
        });
    }
    catch(err) {
        console.log(err);
        throw err;
    };
};

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return transformedEvent(event);
    }
    catch(err) {
        console.log(err);
        throw err;
    };
};

const user = async userId => {
    try {
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            throw new Error('User not found');
        }
        return {
            ...existingUser._doc, 
            password: null,
            createdEvents: events.bind(this, existingUser._doc.createdEvents)
        };
    }
    catch(err) {
        console.log(err);
        throw err;
    };
};

const transformedEvent = event => {
    return {
        ...event._doc,
        date: dateToString(event._doc.date),
        creator: user.bind(this, event._doc.creator)
    };
};

const transformedBooking = booking => {
    return {
        ...booking._doc,
        user: user.bind(this, booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
    };
};

exports.transformedEvent = transformedEvent;
exports.transformedBooking = transformedBooking;

// exports.user = user;
// exports.singleEvent = singleEvent;
// exports.events = events;