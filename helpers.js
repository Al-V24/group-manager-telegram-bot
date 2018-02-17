const axios = require("axios");

const CONFIG = require("./config");
const models = require("./models/mongoose");
const eventObj = require("./eventObj");

//Returns base url with bot API key appended
function getUrl() {
    return CONFIG.BOT.API + CONFIG.BOT.API_KEY;
}

//New axiom instance with baseurl from getUrl method
const botapi = axios.create({
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
            // console.log(sentmsg.data);
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

//Add new saved msg
//TODO: this

//Process Command
function processCommands(msg) {
    console.log("new command");
    //remove starting '/'
    let commandMsg = msg.text.slice(1).split(" ");
    //first word is command
    let command = commandMsg[0];
    let params = commandMsg.slice(1).join(" ");
    console.log("Command: ",command," Params: ",params);
    eventObj.emit(command,msg.chat.id,msg.message_id,params,msg);
}

// Send saved message
function sendSavedMsg(message,chatID) {
    console.log("sending a saved msg");

    //remove the '#' in front
    let savedMessage = message.slice(1);
    console.log(savedMessage);
    models.savedmsg.findOne({
        chat_id: chatID,
        text: savedMessage
    })
        .then((savMsg)=>{
            if(savMsg)
                sendMessage(chatID,savMsg.message);
            else {
                console.log("No such saved message !");
            }
        })
}

// Function to send all the saved message list
function sendAllSaved(chatID,msgID) {
    models.savedmsg.find({
        chat_id: chatID
    })
        .then((msges)=>{
        let text = "";
            msges.forEach((msg)=>{
                text+= "#" + msg.text;
                text+="\n";
            });
            console.log(text);
            if(text)
                sendMessage(chatID,text,msgID);
            else {
                console.log("No saved messages");
            }
        })
}

// Function to send welcome message when a member joins
function sendWelcome(user,chat) {
    let text =  `Welcome ${user.first_name} ${user.last_name}(${user.id}). Feel free to explore around ${chat.title}`;
    sendMessage(chat.id,text);
}

module.exports = {
    onStart,getBotInfo,getWebhookInfo,setWebhook,sendMessage,changeTitle,kickUser,unbanUser,processCommands,sendSavedMsg,sendAllSaved,sendWelcome
};


