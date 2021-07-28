import { Messages, Page, TabsStorage, PageStorage } from './models/constants'
import { Tabs, Tab } from './models/activeTab'

chrome.runtime.onInstalled.addListener(() => {
    // default state goes here
    // this runs ONE TIME ONLY (unless the user reinstalls your extension)
    chrome.storage.local.set({
        [PageStorage]: Page.start
    });

    let initialTabs: Tabs
    initialTabs = {} as Tabs
    initialTabs.tabs = []

    setTabs(initialTabs)
});

const setTabs = (tabs: Tabs) => {
    chrome.storage.local.set({
        [TabsStorage]: tabs
    });
}

chrome.tabs.onRemoved.addListener((tabid) => {
    chrome.storage.local.get(TabsStorage, (data) => {
        let updatedTabs: Tabs = data[TabsStorage]
        updatedTabs.tabs.splice(updatedTabs.tabs.indexOf(updatedTabs.tabs.find(tab => tab.id === tabid)), 1)
        setTabs(updatedTabs)
    })
})
   
// chrome.windows.onRemoved.addListener((windowid) => {
//     alert("window closed")
// })

const tabChange = (tabId) => {
    chrome.storage.local.get(TabsStorage, (data) => {
        if (data[TabsStorage].tabs.find(tab => tab.id === tabId) == null) {

            console.log("working")
            console.log(data)

            let updatedTabs: Tabs = data[TabsStorage]
            updatedTabs.tabs.forEach(tab => tab.active = false)
            updatedTabs.tabs.push({ id: tabId, channelOpen: false, active: true } as Tab)

            setTabs(updatedTabs)

            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["./socketio/socket.io.js"]
            })
            .then(() => {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ["./foreground.js"]
                }).then(() => console.log("Injected foregroun"))
            }).catch(err => console.log(err));

        } else {
            let updatedTabs: Tabs = data[TabsStorage]
            updatedTabs.tabs.forEach(tab => {
                if (tab.id == tabId) {
                    tab.active = true;
                } else {
                    tab.active = false;
                }
            })
            console.log("NEW:")
            console.log(updatedTabs)
            setTabs(updatedTabs)
        }
    })
}

chrome.tabs.onActivated.addListener(activeTabInfo => {
    console.log("wassup")
    tabChange(activeTabInfo.tabId);
})

//Inject foreground into every tab that hasnt already been injected into
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {

        console.log('yelloo')
        tabChange(tabId);
        
    }
});

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    chrome.storage.local.get(TabsStorage, (data: Tabs) => {
        let activeTabId: number = data.tabs.find(tab => tab.active = true).id

        if (request.message === Messages.TOBG_VIDEO_ON_SCREEN) {
            standardMessageToForeground(activeTabId, Messages.TOFG_VIDEO_ON_SCREEN, null, standardCallback(sendResponse))
            return true
        } else if (request.message === Messages.TOBG_CREATE_ROOM_IN_TAB) {

            let updatedTabs: Tabs = data
            updatedTabs.tabs.find(tab => tab.active = true).channelOpen = true
            chrome.storage.local.set({
                TabsStorage: updatedTabs
            });

            standardMessageToForeground(activeTabId, Messages.TOFG_CREATE_ROOM_IN_TAB, request.payload, standardCallback(sendResponse))
            return true
        } else if (request.message === Messages.TOBG_DISCONNECT) {
            standardMessageToForeground(activeTabId, Messages.TOFG_DISCONNECT, request.payload, standardCallback(sendResponse))
            return true
        }
    })
});

const standardMessageToForeground = (tabId: number, message: Messages, payload, callback: Function) => {
    chrome.tabs.sendMessage(tabId, {
        message: message,
        payload: payload
    }, resp => callback(resp))
}

//Send success or failure and pass on payload
const standardCallback = (sendResponse) => (resp) => {
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
