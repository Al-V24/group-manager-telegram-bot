const express = require("express");

//Import files
require("./eventListeners");
const HELPERS = require("./helpers");
const models = require("./models/mongoose");

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

    if (msg.new_chat_member) {
        HELPERS.sendWelcome(msg.new_chat_member,msg.chat);
    }
    else if (msg.text) {

        //Handle commands.Commands start with  '/'
        if (msg.text[0] === '/') {
            HELPERS.processCommands(msg);
        }

        //Saved message template. Saved Msg start with  '#'
        if (msg.text[0] === '#') {
            HELPERS.sendSavedMsg(msg.text, msg.chat.id);
        }
    }
});

app.listen(1111, () => {
    HELPERS.onStart();
    console.log("Server running");
});