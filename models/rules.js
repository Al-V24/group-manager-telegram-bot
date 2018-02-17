const mongoose = require("mongoose");

const RulesSchema = mongoose.Schema({
    chat_id: String,
    rules: String
});

module.exports = mongoose.model("rules" , RulesSchema);