import { Messages, TabsStorage, Page } from './models/constants'
import { ExtensionNewRoomPayload, ExtensionRoomPayload } from './models/payloads';
import { MessageObject, ResponseObject,  } from './models/messagepassing';
import { Tab, Tabs } from './models/tabs';
import { PageMetadata } from './models/pagemetadata';

import { User } from '../sharedmodels/user'
import {  } from '../sharedmodels/payloads'

//Containers
const startPage: HTMLDivElement = document.querySelector("#startPage");
const mainPage: HTMLDivElement = document.querySelector("#mainPage");
const header: HTMLDivElement = document.querySelector("#header");
const usersContainer: HTMLDivElement = document.querySelector("#mainPage .users");

//Bttons
const newRoomBtn: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#startPage .addItemContainer .newRoomBtn");
const joinRoomBtn: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#startPage .addItemContainer .joinRoomBtn");
const leaveRoomBtn: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#mainPage .backBtn");
const copyImgBtn: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#mainPage .roomIdContainer .copyImgBtn");

//Inputs
const nameInput: HTMLInputElement = <HTMLInputElement>document.querySelector("#startPage .addItemContainer .nameInput");
const roomNameInput: HTMLInputElement = <HTMLInputElement>document.querySelector("#startPage .addItemContainer .roomInput");

//Text
const errorMsgElem: HTMLParagraphElement = document.querySelector("#startPage .addItemContainer .error");
const roomIdElem: HTMLSpanElement = document.querySelector('#mainPage .roomIdContainer .roomId');
const roomNameElem: HTMLHeadingElement = document.querySelector("#mainPage .head .roomName");


//Initial open of popup
chrome.storage.local.get(TabsStorage, data => {
    let tabsData: Tabs = data[TabsStorage];
    let pageMetadata: PageMetadata = <PageMetadata>{roomName: "", pageType: Page.START}
    if (tabsData.tabs.find(tab => tab.active)?.channelOpen) {
        pageMetadata.pageType = Page.MAIN;

        chrome.tabs.sendMessage(tabsData.tabs.find(tab => tab.active).id, {
            message: Messages.TOFG_RETRIEVE_ROOM_DATA
        } as MessageObject<null>, (resp: ResponseObject<ExtensionRoomPayload>) => {
            pageMetadata.roomId = resp.payload.room.roomId
            pageMetadata.roomName = resp.payload.room.roomName
            updateMainUsers(resp.payload.room.users)
            changePage(pageMetadata)
        })  
    }
    changePage(pageMetadata);
})

const validRoomInput = () => {
    if(roomNameInput.value.trim() === "") {
        errorMsgElem.classList.remove('hidden');
        errorMsgElem.innerHTML = 'Please enter a room/id';
        return false;
    } else {
        errorMsgElem.classList.add('hidden');
        errorMsgElem.innerHTML = '';
        return true;
    }
}

newRoomBtn.addEventListener('click', _ => {
    createNewRoomWithValidation();
})

// joinRoomBtn.addEventListener('click', e => {
// })

leaveRoomBtn.addEventListener('click', _ => {
    leaveRoom()
})

const leaveRoom = () => {
    chrome.storage.local.get(TabsStorage, data => {
        let activeTab: Tab = data[TabsStorage].tabs.find(tab => tab.active);
        if (!activeTab.channelOpen) {
            return
        }

        chrome.runtime.sendMessage({
            message: Messages.TOBG_DISCONNECT
        } as MessageObject<null>)
        chrome.tabs.sendMessage(activeTab.id, {
            message: Messages.TOFG_DISCONNECT
        } as MessageObject<null>)
        changePage({ pageType: Page.START, roomId: null, roomName: "" })
    })
}

copyImgBtn.addEventListener('click', () => {
    let roomIdVal = roomIdElem.innerHTML
    navigator.clipboard.writeText(roomIdVal).then(() => {
    }, () => {
        //Failed to copy
    })
})

const createNewRoomWithValidation = () => {

    chrome.storage.local.get(TabsStorage, data => {
        let activeTabId: number = data[TabsStorage].tabs.find(tab => tab.active).id;

        chrome.tabs.sendMessage(activeTabId, 
            { message: Messages.TOFG_VIDEO_ON_SCREEN } as MessageObject<null>, (resp: ResponseObject<boolean>) => {
            if (resp.status === Messages.SUCCESS && resp.payload && validRoomInput()) { 
                let messageObject: MessageObject<ExtensionNewRoomPayload> = { 
                    message: Messages.TOFG_CREATE_ROOM_IN_TAB, 
                    payload: {
                        roomName: roomNameInput.value.trim(), 
                        userName: nameInput.value
                    }
                }
                chrome.tabs.sendMessage(activeTabId, messageObject, (resp: ResponseObject<ExtensionRoomPayload>) => {
                    if (resp.status === Messages.SUCCESS) {
                        chrome.runtime.sendMessage({ message: Messages.TOBG_CREATE_ROOM_IN_TAB } as MessageObject<null>)
                        changePage( { pageType: Page.MAIN, roomId: resp.payload.room.roomId, roomName: resp.payload.room.roomName } as PageMetadata)
                        updateMainUsers(resp.payload.room.users)
                    }
                })
            }
        })
        
    })
}

const changePage = (pageMetadata: PageMetadata) => {
    if (pageMetadata.pageType === Page.START) {
        startPage.classList.remove('hidden');
        mainPage.classList.add('hidden');
        header.classList.remove('hidden');
        roomNameInput.value = pageMetadata.roomName;
        nameInput.value = "";
    } else if (pageMetadata.pageType === Page.MAIN) {
        startPage.classList.add('hidden');
        mainPage.classList.remove('hidden');
        header.classList.add('hidden');

        roomNameElem.innerHTML =  `${pageMetadata.roomName}`;
        roomIdElem.innerHTML = `${pageMetadata.roomId}`;

    }
}

const updateMainUsers = (users: Array<User>) => {
    users.forEach(user => {
        let userElem = document.createElement("DIV");
        userElem.classList.add("userElem");
        userElem.innerHTML = user.userName;
        usersContainer.append(userElem);
    });
}

// Message handler
chrome.runtime.onMessage.addListener((request: MessageObject<any>, sender, sendResponse) => {
    if (request.message === Messages.TOPOPUP_LEAVE_ROOM) {
        leaveRoom()
    }
    return true
});


