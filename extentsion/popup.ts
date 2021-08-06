import { Messages, Page } from './models/constants'
import { ExtensionJoinRoomPayload, ExtensionNewRoomPayload, ExtensionRoomPayload, ExtensionUserChangePayload } from './models/payloads';
import { MessageObject, ResponseObject,  } from './models/messagepassing';
import { PageMetadata } from './models/pagemetadata';

import { User } from '../sharedmodels/user'
import {  } from '../sharedmodels/payloads'

//Containers
const startPage: HTMLDivElement = document.querySelector("#startPage");
const mainPage: HTMLDivElement = document.querySelector("#mainPage");
const header: HTMLDivElement = document.querySelector("#header");
const usersListContainer: HTMLDivElement = document.querySelector("#mainPage .users .usersList");

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
chrome.tabs.query({active:true, currentWindow: true}, tabs => {
    let activeTabId = tabs[0].id
    let pageMetadata: PageMetadata = <PageMetadata>{roomName: "", pageType: Page.START}

    chrome.tabs.sendMessage(activeTabId, {
        message: Messages.TOFG_IS_CHANNEL_OPEN
    } as MessageObject<null>, (resp: ResponseObject<boolean>) => {
        if (resp.status == Messages.SUCCESS && resp.payload) {
            chrome.tabs.sendMessage(activeTabId, {
                message: Messages.TOFG_RETRIEVE_ROOM_DATA
            } as MessageObject<null>, (resp: ResponseObject<ExtensionRoomPayload>) => {
                pageMetadata.roomId = resp.payload.room.roomId
                pageMetadata.roomName = resp.payload.room.roomName
                pageMetadata.pageType = Page.MAIN
                updateMainUsers(resp.payload.room.users)
                changePage(pageMetadata)
            }) 
        }
    })

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

joinRoomBtn.addEventListener('click', e => {
    joinRoomWithValidation()
})

leaveRoomBtn.addEventListener('click', _ => {
    leaveRoom()
})

const leaveRoom = () => {
    chrome.tabs.query({active:true, currentWindow: true}, tabs => {
        let activeTabId = tabs[0].id
        chrome.tabs.sendMessage(activeTabId, {
            message: Messages.TOFG_IS_CHANNEL_OPEN
        } as MessageObject<null>, (resp: ResponseObject<boolean>) => {
            if (resp.status == Messages.SUCCESS && resp.payload) {
                chrome.tabs.sendMessage(activeTabId, {
                    message: Messages.TOFG_DISCONNECT
                } as MessageObject<null>)
            }
        })
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

const joinRoomWithValidation = () => {
    let messageObject: MessageObject<ExtensionJoinRoomPayload> = { 
        message: Messages.TOFG_JOIN_ROOM_IN_TAB, 
        payload: {
            roomId: roomNameInput.value.trim(), 
            userName: nameInput.value
        }
    }
    goIntoRoomWithValidation(messageObject)
}

const createNewRoomWithValidation = () => {
    let messageObject: MessageObject<ExtensionNewRoomPayload> = { 
        message: Messages.TOFG_CREATE_ROOM_IN_TAB, 
        payload: {
            roomName: roomNameInput.value.trim(), 
            userName: nameInput.value
        }
    }
    goIntoRoomWithValidation(messageObject)
}

const goIntoRoomWithValidation = (messageObject: MessageObject<any>) => {
    chrome.tabs.query({active:true, currentWindow: true}, tabs => {
        let activeTabId: number = tabs[0].id;
        chrome.tabs.sendMessage(activeTabId, { message: Messages.TOFG_VIDEO_ON_SCREEN } as MessageObject<null>, (resp: ResponseObject<boolean>) => {
            if (resp.status === Messages.SUCCESS && resp.payload && validRoomInput()) { 
                chrome.tabs.sendMessage(activeTabId, messageObject, (resp: ResponseObject<ExtensionRoomPayload>) => {
                    if (resp.status === Messages.SUCCESS) {
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
    usersListContainer.innerHTML = ""
    users.forEach(user => {
        let userElem = document.createElement("DIV");
        userElem.classList.add("userElem");
        if (!!user.current) {
            userElem.classList.add("currentUser")
        }
        userElem.innerHTML = (user.admin ? '<strong>ADMIN:</strong> ' : '')+user.userName;
        usersListContainer.append(userElem);
    });
}

// Message handler
chrome.runtime.onMessage.addListener((request: MessageObject<any>, sender, sendResponse) => {
    
    //Check below is important b/c if we have multiple popups open in diff windows, we dont want all reacting to same event
    chrome.tabs.query({active: true, currentWindow:true}, tabs => {
        let curActiveTabId = tabs[0].id
        if (sender.tab.id === curActiveTabId) {
            if (request.message === Messages.TOPOPUP_LEAVE_ROOM) {
                leaveRoom()
            } else if (request.message === Messages.TOPOPUP_ROOM_DATA) {
                let reqData = <ExtensionRoomPayload>request.payload
                updateMainUsers(reqData.room.users)
            } else if (request.message === Messages.TOPOPUP_USER_CONNECTED) {
                let reqData = <ExtensionUserChangePayload>request.payload
                //do something with the data now
            }
        }
    })
    return true
});


