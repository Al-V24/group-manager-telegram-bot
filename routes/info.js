const route = require("express").Router();

const HELPERS = require("../helpers");

route.get("/", (req, res) => {
    res.send("info");
});

//Get bot info
route.get("/bot",(req,res)=>{
    HELPERS.getBotInfo()
        .then((resp) => {
            // console.log("Bot Info: ", res.data);
            res.send(resp.data);
        })
})

//Get webhook info
route.get("/webhook", (req, res) => {
    HELPERS.getWebhookInfo()
        .then((resp) => {
            console.log(resp.data);
            res.send(resp.data);
        })
        .catch((err) => {
            console.log(err);
        })
    console.log("res sent");
});


module.exports = route;