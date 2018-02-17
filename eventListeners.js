const models = require("./models/mongoose");
const HELPERS = require("./helpers");
const PRESETS = require("./presets");
const eventObj = require("./eventObj");

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