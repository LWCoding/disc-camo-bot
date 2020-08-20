const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    discordId: {
        type: Number,
        required: true
    },
    camoCoins: {
        type: Number,
        default: 0
    },
    messages: {
        type: Number,
        default: 0
    },
    commandsUsed: {
        type: Number,
        default: 0
    },
    commands: [{
        command: {
            type: String,
            required: true
        },
        contents: [{
            item: {
                type: String,
                required: true
            }
        }]
    }]
})

const userModel = mongoose.model("User", userSchema)

module.exports = userModel