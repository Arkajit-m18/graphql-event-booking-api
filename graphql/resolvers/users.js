const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');

module.exports = {
    createUser: (args) => {
        return User.findOne({email: args.userInput.email})
        .then(user => {
            if (user) {
                throw new Error('User already exists')
            }
            return bcrypt.hash(args.userInput.password, 10)
        })
        .then(hash => {
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: args.userInput.email,
                password: hash
            });
            return user.save();
        })
        .then(result => {
            return { ...result._doc, password: null };
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
    },
    login: async (args) => {
        try {
            const user = await User.findOne({email: args.email});
            if (!user) {
                throw new Error('User doesn\'t exist');
            }
            const doMatch = await bcrypt.compare(args.password, user.password);
            if (!doMatch) {
                throw new Error('Invalid credentials');
            }
            const token = jwt.sign({
                userId: user._id,
                email: user.email
            }, process.env.JWT_SECRET_KEY, {
                expiresIn: '2h'
            });
            return {
                userId: user._id,
                token: token,
                tokenExpiration: 2
            };
        }
        catch(err) {
            console.log(err);
            throw err;
        };
    }
}