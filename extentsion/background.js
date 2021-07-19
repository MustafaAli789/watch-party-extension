var activeTabId;

chrome.runtime.onInstalled.addListener(() => {
    // default state goes here
    // this runs ONE TIME ONLY (unless the user reinstalls your extension)
    chrome.storage.local.set({
        page: "Start"
    });
});

chrome.tabs.onActivated.addListener(activeInfo => {
    activeTabId = activeInfo.tabId
})

//Inject foreground into every tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
        activeTabId = tabId
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["./foreground.js"]
        })
            .then(() => {
                console.log("INJECTED THE FOREGROUND SCRIPT.");
            }).catch(err => console.log(err));
    }
});


// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'get_cur_page') {
        chrome.storage.local.get('page', data => {
            if (chrome.runtime.lastError) {
                sendResponse({
                    message: 'fail'
                });
                return;
            }

            sendResponse({
                message: 'success',
                payload: data.page
            });
        });

        return true;
    } else if (request.message === "validate_video_elem_on_screen") {
        chrome.tabs.sendMessage(activeTabId, {
            message: "video_on_screen"
        }, resp => {
            if (resp.message === 'success') {
                sendResponse({
                    message: 'success',
                    payload: resp.payload
                })
            } else {
                sendResponse({
                    message: 'fail'
                })
            }
        })
        return true
    }
});
