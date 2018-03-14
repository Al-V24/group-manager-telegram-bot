const models = require("./models/mongoose");
const HELPERS = require("./helpers");
const eventObj = require("./eventObj").callbackEvents;

// Callback for delete button on welcome message
eventObj.on("delWelcome",(callback)=>{
    console.log("delete btn event fired");
    HELPERS.deleteMessage(callback.message.chat.id,callback.message.message_id);
    HELPERS.answerCallback(callback.id);
});