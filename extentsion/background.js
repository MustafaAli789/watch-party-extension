const Messages = {
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
        activeTabId = tabId
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["./socketio/socket.io.js"]
        })
        .then(() => {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["./foreground.js"]
            })
        }).catch(err => console.log(err));
    }
});


// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === Messages.TOBG_VIDEO_ON_SCREEN) {
        chrome.tabs.sendMessage(activeTabId, {
            message: Messages.TOFG_VIDEO_ON_SCREEN
        }, resp => {
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
        })
        return true
    } else if (request.message === Messages.TOBG_OPEN_CHANNEL_IN_TAB) {
        tabIdWithChannelOpen = activeTabId
        chrome.tabs.sendMessage(tabIdWithChannelOpen, {
            message: Messages.TOFG_OPEN_CHANNEL_IN_TAB,
            payload: request.payload
        }, resp => {
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
        })
        return true
    }
});
