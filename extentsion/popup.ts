import { Messages, Page, TabsStorage } from './models/constants';
import { MessageObject, NewRoomPayload, PageMetadata, ResponseObject, SocketRoomCreatedPayload, Tabs, User } from './models/interfaces';

//Containers
const startPage: HTMLDivElement = document.querySelector("#startPage");
const mainPage: HTMLDivElement = document.querySelector("#mainPage");
const header: HTMLDivElement = document.querySelector("#header");
const usersContainer: HTMLDivElement = document.querySelector("#main .users");

//Bttons
const newRoomBtn: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#startPage .addItemContainer .newRoomBtn");
const joinRoomBtn: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#startPage .addItemContainer .joinRoomBtn");
const leaveRoomBtn: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#startPage .addItemContainer .backBtn");
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

        //retrieve data from socket connection about room metadata here
        //mocked for now
        pageMetadata.roomId = "MOCKED_roomId";
        pageMetadata.roomName = "MOCKED_roomName";

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
    chrome.storage.local.get(TabsStorage, data => {
        let activeTabId: number = data.tabs.find(tab => tab.active = true).id;

        chrome.runtime.sendMessage({
            message: Messages.TOBG_DISCONNECT
        } as MessageObject<null>)
        chrome.tabs.sendMessage(activeTabId, {
            message: Messages.TOFG_DISCONNECT
        } as MessageObject<null>)
        changePage({ pageType: Page.MAIN, roomId: null, roomName: "" })
    })
})

copyImgBtn.addEventListener('click', () => {
    let roomIdVal = roomIdElem.innerHTML
    navigator.clipboard.writeText(roomIdVal).then(() => {
    }, () => {
        //Failed to copy
    })
})

const createNewRoomWithValidation = () => {

    chrome.storage.local.get(TabsStorage, data => {
        let activeTabId: number = data.tabs.find(tab => tab.active = true).id;

        chrome.tabs.sendMessage(activeTabId, { message: Messages.TOFG_VIDEO_ON_SCREEN } as MessageObject<null>, (resp: ResponseObject<boolean>) => {
            if (resp.status === Messages.SUCCESS && resp.payload && validRoomInput()) { 
                let messageObject: MessageObject<NewRoomPayload> = { 
                    message: Messages.TOFG_CREATE_ROOM_IN_TAB, 
                    payload: {
                        roomName: roomNameInput.value.trim(), 
                        userName: nameInput.value
                    }
                }
                chrome.tabs.sendMessage(activeTabId, messageObject, (resp: ResponseObject<SocketRoomCreatedPayload>) => {
                    if (resp.status === Messages.SUCCESS) {
                        chrome.runtime.sendMessage({ message: Messages.TOBG_CREATE_ROOM_IN_TAB } as MessageObject<null>)
                        changePage( { pageType: Page.MAIN, roomId: resp.payload.roomId, roomName: nameInput.value } as PageMetadata)
                        updateMainUsers(resp.payload.users)
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



