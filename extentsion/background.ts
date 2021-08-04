import { Messages, Page, TabsStorage } from './models/constants'
import { Tabs, Tab } from './models/tabs'
import { MessageObject, ResponseObject } from './models/messagepassing'


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

const setAllTabsToInactive = () => {
    chrome.storage.local.get(TabsStorage, (data) => {
        let updatedTabs: Tabs = Object.assign({}, data[TabsStorage])
        updatedTabs.tabs.forEach(tab => tab.active = false)
        setTabs(updatedTabs)
    })
}

const tabChange = (tabId: number, event: string) => {
    chrome.storage.local.get(TabsStorage, (data) => {

        let updatedTabs: Tabs = Object.assign({}, data[TabsStorage])

        chrome.tabs.query({}, tabs => {

            //removing old tabs from our storage obj if it has been closed
            for (let i = updatedTabs.tabs.length-1; i>=0; i--) {
                let tabStorage: Tab = updatedTabs.tabs[i]
                if (tabs.find(tab => tab.id == tabStorage.id) == null) {
                    updatedTabs.tabs.splice(i, 1);
                }
            }

            //new tab not in storage
            //special case where changing urls of a tab that prev had script injected needs to be injected again
            //cause url change causes script to be lost
            let existingTab = data[TabsStorage].tabs.find(tab => tab.id === tabId)
            if (!existingTab || event === "onUpdated") {

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
                                files: ["./foreground.js"]
                            }).then(() => {
                                if (!existingTab) {
                                    updatedTabs.tabs.push({ id: tabId, channelOpen: false, active: true } as Tab)
                                    setTabs(updatedTabs)
                                }
                            })
                        }).catch(err => console.log(err));
                    }
                })
            
            //existing tab in storage
            } else { 
                updatedTabs.tabs.forEach(tab => {
                    if (tab.id == tabId) {
                        tab.active = true;
                    } else {
                        tab.active = false;
                    }
                })
            }

            setTabs(updatedTabs)
        });
    })
}

//gone use this one for changing the tab b/w existing tabs (includes when u a close a tab and u auto go to another tab)
//technically this one is fired when creating a new tab too but its kinda useless since the url isnt ready at this point so cant inject script yet
chrome.tabs.onActivated.addListener(activeTabInfo => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        console.log(tabs)
        if (/^http/.test(tabs[0].url)) {
            tabChange(activeTabInfo.tabId, "onActivated");
        } else { //non http url
            setAllTabsToInactive()
        }
   })
})


//gonna use this one for when u create a new tab, or when you change the url of the cur tab ur on
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status == 'complete' && /^http/.test(tab.url)) {
        tabChange(tabId, "onUpdated");
    } else if (!/^http/.test(tab.url)) { //not http url
        setAllTabsToInactive()
    }
});

// Message handler
chrome.runtime.onMessage.addListener((request: MessageObject<any>, sender, sendResponse) => {

    chrome.storage.local.get(TabsStorage, (data: Tabs) => {
        let updatedTabs: Tabs = Object.assign({}, data[TabsStorage])

        if (request.message === Messages.TOBG_CREATE_ROOM_IN_TAB) {
            updatedTabs.tabs.find(tab => tab.active).channelOpen = true
        } else if (request.message === Messages.TOBG_DISCONNECT) {
            updatedTabs.tabs.find(tab => tab.active).channelOpen = false
        }

        setTabs(updatedTabs);
    })
    return true
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
