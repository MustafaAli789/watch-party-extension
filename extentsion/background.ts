import { Messages } from './models/constants'
import { MessageObject, ResponseObject } from './models/messagepassing'

// Updates needed
/**
 * - Actual notifs when user joins or leaves
 * - future feature: chat box
 */

chrome.runtime.onInstalled.addListener(() => {
    // default state goes here
    // this runs ONE TIME ONLY (unless the user reinstalls your extension)
});

const tabChange = (tabId: number, event: string) => {
    chrome.tabs.sendMessage(tabId, { message: Messages.TOFG_DO_YOU_EXIST } as MessageObject<null>, (resp: ResponseObject<boolean>) => {
        if (chrome.runtime.lastError) {

            // DOESNT EXIST CAN INJECT NOW
            console.log("INJECTING FOREGROUND WITH TABID: " + tabId)
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["./socketio/socket.io.js"]
            })
            .then(() => {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ["./bootstrap/js/bootstrap.min.js"]
                })
                .then(() => {
                    chrome.scripting.insertCSS({
                        target: {tabId: tabId},
                        files: ["./bootstrap/css/bootstrap.min.css"]
                    })
                    .then(() => {
                        chrome.scripting.insertCSS({
                            target: {tabId: tabId},
                            files: ["./css/foreground.css"]
                        })
                        .then(() => {
                            chrome.scripting.executeScript({
                                target: { tabId: tabId },
                                files: ["./foreground.js"]
                            })
                        })
                    })
                })
            }).catch(err => console.log(err));
        } else if(event === "onUpdated") { //i.e url changes but script continues to exist (ex: on youtube)
            chrome.tabs.sendMessage(tabId, { message: Messages.TOFG_DISCONNECT} as MessageObject<null>)
        }
    })                
}

//gone use this one for changing the tab b/w existing tabs (includes when u a close a tab and u auto go to another tab)
//technically this one is fired when creating a new tab too but its kinda useless since the url isnt ready at this point so cant inject script yet
chrome.tabs.onActivated.addListener(activeTabInfo => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if (/^http/.test(tabs[0].url)) {
            tabChange(activeTabInfo.tabId, "onActivated");
        }
   })
})


//gonna use this one for when u create a new tab, or when you change the url of the cur tab ur on
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status == 'complete' && /^http/.test(tab.url)) {
        tabChange(tabId, "onUpdated");
    }
});

// Message handler
chrome.runtime.onMessage.addListener((request: MessageObject<any>, sender, sendResponse) => {
    if (request.message === Messages.TOBG_OPEN_IMG_IN_TAB) {
        chrome.tabs.create({
            active:true,
            url: request.payload
        })
    }
});

