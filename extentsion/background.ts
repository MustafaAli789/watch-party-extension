import { Messages, Page, TabsStorage } from './models/constants'
import { Tabs, Tab, MessageObject } from './models/interfaces'

chrome.runtime.onInstalled.addListener(() => {
    // default state goes here
    // this runs ONE TIME ONLY (unless the user reinstalls your extension)

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

const tabChange = (tabId: number, logMsg: string) => {
    chrome.storage.local.get(TabsStorage, (data) => {

        let updatedTabs: Tabs = Object.assign({}, data[TabsStorage])

        //needs to be out here in case someone has a normal tab open but then opens a new chrome:// tab after
        //the new tab wont be added to our tabs storage or injected but we do need all others tabs to be active false now
        updatedTabs.tabs.forEach(tab => tab.active = false)

        chrome.tabs.query({}, tabs => {

            //removing old tabs from our storage obj if it has been closed
            for (let i = updatedTabs.tabs.length-1; i>=0; i--) {
                let tabStorage: Tab = updatedTabs.tabs[i]
                if (tabs.find(tab => tab.id == tabStorage.id) == null) {
                    updatedTabs.tabs.splice(i, 1);
                }
            }

            //new tab not in storage
            if (data[TabsStorage].tabs.find(tab => tab.id === tabId) == null) {

                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ["./socketio/socket.io.js"]
                })
                .then(() => {
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ["./foreground.js"]
                    }).then(() => {
                        updatedTabs.tabs.push({ id: tabId, channelOpen: false, active: true } as Tab)
                        setTabs(updatedTabs)
                        console.log(logMsg)
                    })
                }).catch(err => console.log(err));
            
            //existing tab in storage
            } else { 
                updatedTabs.tabs.forEach(tab => {
                    if (tab.id == tabId) {
                        tab.active = true;
                    } else {
                        tab.active = false;
                    }
                })
                console.log(logMsg)
            }

            setTabs(updatedTabs)
        });
    })
}

//gone use this one for changing the tab b/w existing tabs (includes when u a close a tab and u auto go to another tab)
//technically this one is fired when creating a new tab too but its kinda useless since the url isnt ready at this point so cant inject script yet
chrome.tabs.onActivated.addListener(activeTabInfo => {

    tabChange(activeTabInfo.tabId, "onActivated");
})

//SPECIAL NOTE FOR BELOW METHOD:
//even if you change cur url to a chrome:// url, since the script has already been injected and tabid is not changing, nothing shuld really happen
//active stays true and no errors pop up

//gonna use this one for when u create a new tab, or when you change the url of the cur tab ur on
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        tabChange(tabId, "onUpdated");
    }
});

// Message handler
chrome.runtime.onMessage.addListener((request: MessageObject<null>, sender, sendResponse) => {

    chrome.storage.local.get(TabsStorage, (data: Tabs) => {
        let updatedTabs: Tabs = data

        if (request.message === Messages.TOBG_CREATE_ROOM_IN_TAB) {
            updatedTabs.tabs.find(tab => tab.active = true).channelOpen = true
        } else if (request.message === Messages.TOBG_DISCONNECT) {
            updatedTabs.tabs.find(tab => tab.active = true).channelOpen = false
        }

        setTabs(updatedTabs);
    })
});

// const standardMessageToForeground = (tabId: number, message: Messages, payload, callback: Function) => {
//     chrome.tabs.sendMessage(tabId, {
//         message: message,
//         payload: payload
//     }, resp => callback(resp))
// }

// //Send success or failure and pass on payload
// const standardCallback = (sendResponse) => (resp) => {
//     if (resp.status === Messages.SUCCESS) {
//         sendResponse({
//             status: Messages.SUCCESS,
//             payload: resp.payload
//         })
//     } else {
//         sendResponse({
//             status: Messages.FAILURE
//         })
//     }
// }
