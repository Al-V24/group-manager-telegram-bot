const models = require("./models/mongoose");
const HELPERS = require("./helpers");
const PRESETS = require("./presets");
const eventObj = require("./eventObj").em;

//Event listener for add command to add new saved message.
eventObj.on("add", (chatID, msgID, params) => {
    console.log("Add event found");
    console.log("params: ", params);
    let textval = params.split(" ")[0];
    let messageVal = params.split(" ").slice(1).join(" ");
    console.log("text: ", textval, " msg: ", messageVal);
    models.savedmsg.findOne({
        chat_id: chatID,
        text: textval
    })
        .then((saveMsg) => {

            //If Saved message does not exist
            if (saveMsg === null) {
                models.savedmsg.create({
                    chat_id: chatID,
                    text: textval,
                    message: messageVal
                })
                    .then((newSave) => {
                        console.log("New Add entry: ", newSave);
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            }
            else {
                //If saved message exists, update it
                saveMsg.message = messageVal;
                saveMsg.save();
            }
        })
        .catch((err) => {
            console.log(err);
        })
});

//Event listener to see all saved messages]
eventObj.on("saved", (chatID, msgID, params) => {
    console.log("Saved event fired");
    console.log(HELPERS);
    HELPERS.sendAllSaved(chatID, msgID);
});

//Event listener for viewing rules
eventObj.on("rules", (chatID, msgID) => {
    models.rules.findOne({
        chat_id: chatID
    })
        .then((rulesObj) => {
            if (rulesObj) {
                HELPERS.sendMessage(chatID, rulesObj.rules, msgID);
            }
            else {
                HELPERS.sendMessage(chatID, PRESETS.RULES_NOT_DEF_TXT, msgID)
            }
        })
        .catch((err) => {
            console.log(err);
        });
    console.log("Rules event fired");
});

//Event listener for setting rules
eventObj.on("setrules", (chatID, msgID, params) => {
    console.log("Setrules event fired");
    //TODO: Handle empty rules text
    // let rules = params
    // let ruleText = params.split(" ").slice(1).join(" ");
    models.rules.findOne({
        chat_id: chatID
    })
        .then((rule) => {

            //If rule does not exist
            if (rule === null) {
                models.rules.create({
                    chat_id: chatID,
                    rules: params
                })
                    .then((newrule) => {
                        console.log("New rule entry: ", newrule);
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            }
            else {
                //If rules exist, update them
                rule.rules = params;
                rule.save();
            }
        })
});

// Event listener for changing title
eventObj.on("title", (chatID, msgID, params, msg) => {
    console.log("Title event fired");
    let title = params;
    console.log("Title: ", params);
    if (msg.chat.type !== "private")
        if (title)
            HELPERS.changeTitle(chatID, title);
        else {
            HELPERS.sendMessage(chatID, PRESETS.TITLE_EMPTY_ERR, msgID);
        }
    else {
            HELPERS.sendMessage(chatID, PRESETS.TITLE_PRIVATE_CHAT_ERR, msgID);
    }
});

//Event listener for kick command
eventObj.on("kick",(chatID,msgID,params,msg)=>{
    if(msg.reply_to_message){
        HELPERS.kickUser(chatID,msg.reply_to_message.from.id);
    }
    else {
        HELPERS.sendMessage(chatID,PRESETS.KICK_TAG_SOMEONE,msgID);
    }
});

//Event listener for unpinning message
eventObj.on("unpin",(chatID,msgID,params,msg)=>{
    if(msg.chat.type === "supergroup") {
        HELPERS.unpinMessage(chatID);
    }
    else {
        HELPERS.sendMessage(chatID, PRESETS.PIN_SUPERGROUP_ONLY,msgID);
    }
});

//Event listener for pinning message
eventObj.on("pin",(chatID,msgID,params,msg)=>{
    console.log("Pin event fired");
    if(msg.chat.type === "supergroup") {
        if (msg.reply_to_message) {
            HELPERS.pinMessage(chatID, msg.reply_to_message.message_id);
        }
        else {
            HELPERS.sendMessage(chatID, PRESETS.PIN_NO_MSG, msgID);
        }
    }
    else {
        HELPERS.sendMessage(chatID, PRESETS.PIN_SUPERGROUP_ONLY,msgID);
    }
});

//Event listener for warning user
eventObj.on("warn",(chatID,msgID,params,msg)=>{
    if(msg.reply_to_message){
        HELPERS.warnUser(chatID,msg.reply_to_message.from.id);
    }
    else {
        HELPERS.sendMessage(chatID,PRESETS.WARN_TAG_SOMEONE,msgID);
    }
});

//Event listener for sticker control
eventObj.on("sticker",(chatID,msgID,params)=>{
    let setting = params.split(" ")[0];
    if(setting === "on"){
        console.log("Turning sticker control ON");
        HELPERS.stickerControlSet(chatID,true);
    }
    else if(setting === "off"){
        console.log("Turning sticker control OFF");
        HELPERS.stickerControlSet(chatID,false);
    }
    else {
        HELPERS.sendMessage(chatID,PRESETS.STICKER_ON_OFF,msgID);
    }
});

//Event listener for photo control
eventObj.on("photos",(chatID,msgID,params)=>{
    let setting = params.split(" ")[0];
    if(setting === "on"){
        console.log("Turning photo control ON");
        HELPERS.photoControlSet(chatID,true);
    }
    else if(setting === "off"){
        console.log("Turning photo control OFF");
        HELPERS.photoControlSet(chatID,false);
    }
    else {
        HELPERS.sendMessage(chatID,PRESETS.PHOTO_ON_OFF,msgID);
    }
});

//Event listener for voice note control
eventObj.on("voice",(chatID,msgID,params)=>{
    let setting = params.split(" ")[0];
    if(setting === "on"){
        console.log("Turning voice note control ON");
        HELPERS.voiceControlSet(chatID,true);
    }
    else if(setting === "off"){
        console.log("Turning voice note control OFF");
        HELPERS.voiceControlSet(chatID,false);
    }
    else {
        HELPERS.sendMessage(chatID,PRESETS.VOICE_ON_OFF,msgID);
    }
});

//Event listener for video note control
eventObj.on("video",(chatID,msgID,params)=>{
    let setting = params.split(" ")[0];
    if(setting === "on"){
        console.log("Turning video note control ON");
        HELPERS.videoControlSet(chatID,true);
    }
    else if(setting === "off"){
        console.log("Turning video note control OFF");
        HELPERS.videoControlSet(chatID,false);
    }
    else {
        HELPERS.sendMessage(chatID,PRESETS.VIDEO_ON_OFF,msgID);
    }
});

//Event listener for report feature
eventObj.on("report",(chatID,msgID,params,msg)=>{
    console.log("Message Reported");
    if(msg.reply_to_message){
        //Report the message to admin
        HELPERS.createReport(chatID,msg.reply_to_message.text,msg.from.id,msg.reply_to_message.from.id,msg.reply_to_message.message_id,msg.chat.username)
            .then((report)=>{
                HELPERS.sendToAdmins(chatID,report);
            })
            .catch((err) => {
                console.log(err);
            })
    }
    else {
        //No message tagged for report
        HELPERS.sendMessage(chatID,PRESETS.REPORT_REPLY_TO);
    }
});

//Event listener for AdminMode feature
eventObj.on("adminmode",(chatID,msgID,params)=>{
    let setting = params.split(" ")[0];
    if(setting === "on"){
        console.log("Turning admin only mode ON");
        HELPERS.adminModeSet(chatID,true);
        HELPERS.sendMessage(chatID,PRESETS.ADMINMODE_NOW_ON,msgID);
    }
    else if(setting === "off"){
        console.log("Turning admin only mode OFF");
        HELPERS.sendMessage(chatID,PRESETS.ADMINMODE_NOW_OFF,msgID);
        HELPERS.adminModeSet(chatID,false);
    }
    else {
        HELPERS.sendMessage(chatID,PRESETS.ADMINMODE_ON_OFF,msgID);
    }
});

// Event listener for Admin List Refresh
eventObj.on("refreshadmins",(chatID)=>{
    HELPERS.addAdministrators(chatID);
});