const mongoose = require("mongoose");

const WcMsgSchema = mongoose.Schema({
    chat_id: String,
    message: String
});

module.exports = mongoose.model("wcmsg" , WcMsgSchema);