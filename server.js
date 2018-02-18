const express = require("express");

//Import files
require("./eventListeners");
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

app.post("/updates", (req, res) => {
    // console.log("post on update route");
    console.log(req.body.message);
    let msg = req.body.message;
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
    else if (msg.new_chat_member) {
        console.log("New chat member");
        // console.log(typeof msg.new_chat_member.id," ",typeof CONFIG.BOT.ID);
        if (msg.new_chat_member.id === CONFIG.BOT.ID) {
            //Bot added to new grp, do work
            console.log("Bot added to new grp");
            HELPERS.createGroupEntry(msg.chat.id);
        }
        else {
            //New member added, send welcome
            HELPERS.sendWelcome(msg.new_chat_member, msg.chat);
        }
    }
    else if(msg.left_chat_member){
        if(msg.left_chat_member.id === CONFIG.BOT.ID){
            //Bot left chat,delete stuff
        }
        else {
            //Some member left
        }
    }

});

app.listen(1111, () => {
    HELPERS.onStart();
    console.log("Server running");
});