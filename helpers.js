const axios = require("axios");

const CONFIG = require("./config");

//Returns base url with bot API key appended
function getUrl() {
    return CONFIG.BOT.API + CONFIG.BOT.API_KEY;
}

//New axiom instance with baseurl from getUrl method
var botapi = axios.create({
    baseURL: getUrl()
});

//To be called on server startup
function onStart() {
    getBotInfo();
    setWebhook();

}

//Set the webhook. Calls /setWebhook api method
function setWebhook() {
    botapi.get("/setWebhook",{
        params: {
            url: CONFIG.BOT.WEBHOOK_URL
        }
    })
        .then((res)=>{
            console.log("Webhook set , Result:  ", res.data);
        })
        .catch((err)=>{
            console.log(err);
        })
}

//Get basic bot info, calls /getMe api method. Return Axios promise
function getBotInfo() {
    return botapi.get("/getMe");

}

//Get webhook info, calls /getWebhookInfo api method. Return Axios promise
function getWebhookInfo() {
    return botapi.get("/getWebhookInfo");
}

//Send message
function sendMessage(chatID,text,replyTo,replyMarkup) {
    let msg = {
        chat_id: chatID,
        text: text,
    };
    if(replyTo){
        msg.reply_to_message_id = replyTo;
    }
    if(replyMarkup){
        msg.reply_markup = replyMarkup;
    }

    botapi.post("/sendMessage", msg)
        .then((sentmsg)=>{
            console.log(sentmsg.data);
        })
        .catch((err) => {
            console.log(err);
        })
}

//Change title of Chat (Group / Channel).Titles can't be changed for private chats
/*
Note: In regular groups (non-supergroups), this method will only work if the ‘All Members Are Admins’ setting is off in the target group.
*/
function changeTitle(chatID, title) {
    botapi.post("/setChatTitle", {
        chat_id: chatID,
        title: title
    })
        .then((resp)=>{
            console.log("title changed: ",resp.data);
        })
        .catch((err) => {
            console.log(err);
        })
}

//Kick member
function kickUser(chatID,userID) {
    botapi.post("/kickChatMember",{
        chat_id: chatID,
        user_id: userID
    })
        .then((resp)=>{
            console.log("User kicked: ",resp.data);
        })
        .catch((err) => {
            console.log(err);
        })
}

//Unban user - needed to let someone rejoin after kick
function unbanUser(chatID,userID) {
    botapi.post("/unbanChatMember",{
        chat_id: chatID,
        user_id: userID
    })
        .then((resp)=>{
            console.log("User kicked: ",resp.data);
        })
        .catch((err) => {
            console.log(err);
        })
}


module.exports = {
    onStart,getBotInfo,getWebhookInfo,setWebhook,sendMessage,changeTitle,kickUser,unbanUser
}


