let Messages = {
    TOBG_VIDEO_ON_SCREEN: "tobg_validate_video_elem_on_screen",
    SUCCESS: "success",
    FAILURE: "failure",
    TOBG_OPEN_CHANNEL_IN_TAB: "tobg_open_channel_in_tab",
    TOFG_VIDEO_ON_SCREEN: "tofg_validate_video_elem_on_screen",
    TOFG_OPEN_CHANNEL_IN_TAB: "tofg_open_channel_in_tab",
}

var activeTabId;
var tabIdWithChannelOpen;

chrome.runtime.onInstalled.addListener(() => {
    // default state goes here
    // this runs ONE TIME ONLY (unless the user reinstalls your extension)
    chrome.storage.local.set({
        page: "Start"
    });
});

//isnt run when you close a tab and thus get onto a new tab :( hence why also setting activeTabid inside of tabs.onUpdated as well
chrome.tabs.onActivated.addListener(activeInfo => {
    activeTabId = activeInfo.tabId
})

//Inject foreground into every tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
        console.log("chagne active tab")
        console.log({tabId: tabId, changeInfo: changeInfo, tab: tab})
        activeTabId = tabId
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["./socketio/socket.io.js"]
        })
        .then(() => {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["./foreground.js"]
            }).then(console.log("Injected foregroun"))
        }).catch(err => console.log(err));
    }
});

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === Messages.TOBG_VIDEO_ON_SCREEN) {
        standardMessageToForeground(activeTabId, Messages.TOFG_VIDEO_ON_SCREEN, null, standardCallback(sendResponse))
        return true
    } else if (request.message === Messages.TOBG_OPEN_CHANNEL_IN_TAB) {
        tabIdWithChannelOpen = activeTabId
        standardMessageToForeground(tabIdWithChannelOpen, Messages.TOFG_OPEN_CHANNEL_IN_TAB, request.payload, standardCallback(sendResponse))
        return true
    }
});

standardMessageToForeground = (tabId, message, payload, callback) => {
    chrome.tabs.sendMessage(tabId, {
        message: message,
        payload: payload
    }, resp => callback(resp))
}

//Send success or failure and pass on payload
standardCallback = (sendResponse) => (resp) => {
    if (resp.status === Messages.SUCCESS) {
        sendResponse({
            status: Messages.SUCCESS,
            payload: resp.payload
        })
    } else {
        sendResponse({
            status: Messages.FAILURE
        })
    }
}
