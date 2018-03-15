const axios = require("axios");

const CONFIG = require("./config");
const models = require("./models/mongoose");
const eventObj = require("./eventObj").em;
const callbackEveObj = require("./eventObj").callbackEvents;

//New axiom instance with base url from getUrl method
const botapi = axios.create({
    baseURL: getUrl()
});

/****************
 *  MISSCALANEOUS
 ****************/

//To be called on server startup
function onStart() {
    getBotInfo();
    setWebhook();

}

//Returns base url with bot API key appended
function getUrl() {
    return CONFIG.BOT.API + CONFIG.BOT.API_KEY;
}

/**********************
 *  DIRECT API FUNCTIONS
 **********************/

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
            console.log(err.response.data);
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

// Function to delete a message
function deleteMessage(chatID,msgID) {
    botapi.post("/deleteMessage",{
        chat_id: chatID,
        message_id: msgID
    })
        .then((resp)=>{
            console.log("Deleted message: ",resp.data);
        })
        .catch((err) => {
            console.log(err);
        })
}

// Function to create inline Keyboard button
function createInlineBtn(text,url,callback_data,switch_inline_query) {
    let btn = {};
    if(text){
        btn.text = text;
    }
    if(url){
        btn.url = url;
    }
    if(callback_data){
        btn.callback_data = callback_data;
    }
    if(switch_inline_query){
        btn.switch_inline_query = switch_inline_query;
    }

    return btn;
}

// Function to unpin a message in a supergrouo or channel
function unpinMessage(chatID) {
    botapi.post("/unpinChatMessage",{
        chat_id: chatID
    })
        .then((resp)=>{
            console.log("Unpinned: ",resp);
        })
        .catch((err) => {
            console.log(err);
        });
}

// Function to pin a message in a supergroup or channel
function pinMessage(chatID,msgID) {
    botapi.post("/pinChatMessage",{
        chat_id: chatID,
        message_id: msgID
    })
        .then((resp)=>{
            console.log("Message pinned: ",resp.data);
        })
        .catch((err)=>{
            console.log(err);
        })
}

// Function to answer a callback query
function answerCallback(callback_query_id,text,show_alert,url) {
    let answer = {
        callback_query_id: callback_query_id
    };
    if(text){
        answer.text = text;
    }
    if(show_alert){
        answer.show_alert = show_alert
    }
    if(url){
        answer.url = url;
    }
    // console.log(answer);
    botapi.post("/answerCallbackQuery",answer)
        .then((data)=>{
            // console.log(data);
        })
        .catch((err) => {
            console.log(err.response.data);
        });
}

/************************
 * BOT SPECIFIC FUNCTIONS
 ***********************/

//Process Command
function processCommands(msg) {
    // console.log("new command");
    //remove starting '/'
    let commandMsg = msg.text.slice(1).split(" ");
    //first word is command
    let command = commandMsg[0];
    let params = commandMsg.slice(1).join(" ");
    console.log("Command: ",command," Params: ",params);
    eventObj.emit(command,msg.chat.id,msg.message_id,params,msg);
}

// Process callbacks
function processCallbacks(callback) {
    if(callback.data){
        console.log("Callback event: ",callback.data);
        callbackEveObj.emit(callback.data,callback);
    }
}

//Add new saved msg
//TODO: this

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
    console.log("Sending welcome");
    let text =  `Welcome ${user.first_name} ${user.last_name}(${user.id}). Feel free to explore around ${chat.title}`;

    let delBtn = createInlineBtn("Delete ❌",null,"delWelcome");
    let keyboard = {

        inline_keyboard: [
            [ delBtn ]
        ]
    };


    sendMessage(chat.id,text,null,keyboard);
}

// Function to do work when bot first added to group
function createGroupEntry(chatID) {
    console.log("Creating a group entry");
    models.warns.create({
        chat_id: chatID,
        warnings: []
    })
        .then(()=>{
            return models.groupConfigs.create({
                chat_id: chatID,
                stickerControl: false
            })
        })
        .then(()=>{
            console.log("Group Entry created");
        })
        .catch((err) => {
            console.log(err);
        });
}

// Function to warn a user
function warnUser(chatID,userID) {
    models.warns.findOne({
        chat_id: chatID
    })
        .then((warnitem)=>{
            // let arr = warnitem.warnings;
            let found = false;
            for(let i of warnitem.warnings){
                // console.log("userid:",typeof userID," i:",typeof i.user_id);
                if(i.user_id == userID){
                    // console.log("found");
                    found = true;
                    i.numOfWarns++;
                    if(i.numOfWarns === 3){
                        //Kick user on 3rd warn
                        kickUser(chatID,userID);
                        //Remove user's entry from warnings
                        warnitem.warnings.splice(warnitem.warnings.indexOf(i),1);
                    }
                    break;
                }
            }
            if(found === false){
                // console.log("not found");
                let a = {
                    user_id: userID,
                    numOfWarns: 1
                };
                warnitem.warnings.push(a);
            }

            warnitem.save()
                .then(()=>{
                    console.log("New entry to warnings");
                })
                .catch((err) => {
                    console.log(err.data);
                })
        })

}

//Function to set sticker control
function stickerControlSet(chatID,val) {
    models.groupConfigs.findOne({
        chat_id: chatID
    })
        .then((config)=>{
            config.stickerControl = val;
            config.save();
        })
        .catch((err) => {
            console.log(err);
        })
}

//Function to set photo control
function photoControlSet(chatID,val) {
    models.groupConfigs.findOne({
        chat_id: chatID
    })
        .then((config)=>{
            config.photoControl = val;
            config.save();
        })
        .catch((err) => {
            console.log(err);
        })
}

//Function to set photo control
function voiceControlSet(chatID,val) {
    models.groupConfigs.findOne({
        chat_id: chatID
    })
        .then((config)=>{
            config.voiceControl = val;
            config.save();
        })
        .catch((err) => {
            console.log(err);
        })
}

module.exports = {
    onStart,getBotInfo,getWebhookInfo,sendMessage,changeTitle,kickUser,unbanUser,processCommands,sendSavedMsg,sendAllSaved,sendWelcome,unpinMessage,pinMessage,createGroupEntry,warnUser,stickerControlSet,deleteMessage,answerCallback,processCallbacks,photoControlSet,voiceControlSet
};


