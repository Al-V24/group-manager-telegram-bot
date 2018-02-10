const express = require("express");

//Import files
const HELPERS = require("./helpers");

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use("/info", require("./routes/info"));


app.get("/",(req,res)=>{
    res.send("home page");
});

app.post("/updates",(req,res)=>{
    // console.log("post on update route");
    console.log(req.body.message.text);
    let msg = req.body.message;
    res.sendStatus(204);
    HELPERS.sendMessage(msg.from.id,msg.text);
    if(msg.text && msg.text[0] === 'z')
        HELPERS.changeTitle(msg.chat.id,msg.text);
    if(msg.text && msg.text === "kick")
        HELPERS.kickUser(msg.chat.id,msg.from.id);
});

app.listen(1111,()=>{
    HELPERS.onStart();
    console.log("Server running");

});