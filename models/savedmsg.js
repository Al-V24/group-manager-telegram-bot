const mongoose = require("mongoose");

const SavedMsgSchema = mongoose.Schema({
    chat_id: String,
    text: String,
    message: String
});

module.exports = mongoose.model("savedmsg" , SavedMsgSchema);