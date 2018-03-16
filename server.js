const express = require("express");

//Import files
require("./eventListeners");
require("./callbackEventListeners");
const HELPERS = require("./helpers");
const models = require("./models/mongoose");
const CONFIG = require("./config");

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use("/info", require("./routes/info"));


app.get("/", (req, res) => {
    res.send("home page");
});

app.post("/updates", (req, res, next) => {
    // console.log("post on update route");
    // console.log(req.body);

    //If callback , process it
    let callback = req.body.callback_query;
    if(callback){
        console.log("Callback: ", callback);
        res.sendStatus(204);
        HELPERS.processCallbacks(callback);
        return next();
    }

    //Proceed to message processing
    let msg = req.body.message;
    console.log("message: ",msg);
    res.sendStatus(204);
    // HELPERS.sendMessage(msg.chat.id,msg.text);

    if (msg.text) {

        //Handle commands.Commands start with  '/'
        if (msg.text[0] === '/') {
            HELPERS.processCommands(msg);
        }

        //Saved message template. Saved Msg start with  '#'
        if (msg.text[0] === '#') {
            HELPERS.sendSavedMsg(msg.text, msg.chat.id);
        }
    }
    else if(msg.sticker){
        models.groupConfigs.findOne({
            chat_id: msg.chat.id
        })
            .then((config)=>{
                if(config.stickerControl === true){
                    HELPERS.deleteMessage(msg.chat.id,msg.message_id);
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }
    else if(msg.photo){
        models.groupConfigs.findOne({
            chat_id: msg.chat.id
        })
            .then((config)=>{
                if(config.photoControl === true){
                    HELPERS.deleteMessage(msg.chat.id,msg.message_id);
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }
    else if(msg.voice){
        models.groupConfigs.findOne({
            chat_id: msg.chat.id
        })
            .then((config)=>{
                if(config.voiceControl === true){
                    HELPERS.deleteMessage(msg.chat.id,msg.message_id);
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }
    else if(msg.video || msg.video_note){
        models.groupConfigs.findOne({
            chat_id: msg.chat.id
        })
            .then((config)=>{
                if(config.videoControl === true){
                    HELPERS.deleteMessage(msg.chat.id,msg.message_id);
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }
    else if (msg.new_chat_member) {
        console.log("New chat member");
        // console.log(typeof msg.new_chat_member.id," ",typeof CONFIG.BOT.ID);
        if (msg.new_chat_member.id === CONFIG.BOT.ID) {
            //Bot added to new grp, do work
            console.log("Bot added to new grp");
            HELPERS.createGroupEntry(msg.chat.id);
            HELPERS.addAdministrators(msg.chat.id);
        }
        else {
            //New member added, send welcome
            HELPERS.sendWelcome(msg.new_chat_member, msg.chat);
        }
    }
    else if(msg.left_chat_member){
        if(msg.left_chat_member.id === CONFIG.BOT.ID){
            /// TODO: Bot left chat,delete stuff
        }
        else {
            // TODO: Some member left
        }
    }

});

app.listen(1111, () => {
    HELPERS.onStart();
    console.log("Server running");
});