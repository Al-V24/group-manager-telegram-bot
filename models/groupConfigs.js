const mongoose = require("mongoose");

const GroupConfigsSchema = mongoose.Schema({
    chat_id: String,
    stickerControl: Boolean
});

module.exports = mongoose.model("groupConfigs" , GroupConfigsSchema);