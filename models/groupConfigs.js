const mongoose = require("mongoose");

const GroupConfigsSchema = mongoose.Schema({
    chat_id: String,
    stickerControl: Boolean,
    photoControl: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("groupConfigs" , GroupConfigsSchema);