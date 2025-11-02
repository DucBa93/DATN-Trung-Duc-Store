const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'user'
    },
    avatar: {
        type: String,
        default: ""
    }

},
{ timestamps: true })

const User = mongoose.model('user', UserSchema)
module.exports = User