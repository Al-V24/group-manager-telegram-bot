const mongoose = require("mongoose");

const WarnsSchema = mongoose.Schema({
    chat_id: String,
    warnings: [{
        user_id: String,
        numOfWarns: Number
    }]
});

module.exports = mongoose.model("warns" , WarnsSchema);