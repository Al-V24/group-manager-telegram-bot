const mongoose = require("mongoose");

const AdminsSchema = mongoose.Schema({
    chat_id: String,
    admins: [String]
});

module.exports = mongoose.model("admins" , AdminsSchema);