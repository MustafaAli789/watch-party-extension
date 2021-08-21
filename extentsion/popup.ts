import { Messages, Page } from './models/constants'
import { ToFgJoinRoomPayload, ToFgNewRoomPayload, ToFgOffsetPayload, ToPopupAdminTimeInfoPayload, ToPopupRoomPayload } from './models/payloads';
import { MessageObject, ResponseObject,  } from './models/messagepassing';
import { PageMetadata } from './models/Miscellaneous';

import { User } from '../sharedmodels/user'
import {  } from '../sharedmodels/payloads'

let localUsers: User[] = []
let chatToggled: Boolean = true
let activeTabId: number

//Containers
const startPage: HTMLDivElement = document.querySelector("#startPage");
const mainPage: HTMLDivElement = document.querySelector("#mainPage");
const header: HTMLDivElement = document.querySelector("#header");
const usersListContainer: HTMLDivElement = document.querySelector("#mainPage .users .usersList");
const offsetContainer: HTMLDivElement = document.querySelector("#mainPage .offsetContainer")

//Bttons
const newRoomBtn: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#startPage .addItemContainer .newRoomBtn");
const joinRoomBtn: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#startPage .addItemContainer .joinRoomBtn");
const leaveRoomBtn: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#mainPage .backBtn");
const copyImgBtn: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#mainPage .roomIdContainer .copyImgBtn");
const syncBtn: HTMLButtonElement = document.querySelector("#mainPage .actions .actionBtns .syncBtn")
const chatToggleBtn: HTMLButtonElement = document.querySelector("#mainPage .actions .actionBtns .chatToggle")
const posOffsetBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById("posOffsetBtn")
const resetOffsetBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById("resetOffsetBtn")

//Inputs
const nameInput: HTMLInputElement = <HTMLInputElement>document.querySelector("#startPage .addItemContainer .nameInput");
const roomNameInput: HTMLInputElement = <HTMLInputElement>document.querySelector("#startPage .addItemContainer .roomInput");
const offsetInput: HTMLInputElement = <HTMLInputElement>document.querySelector("#mainPage .offsetContainer .html-duration-picker")

//Text
const errorMsgElem: HTMLParagraphElement = document.querySelector("#startPage .addItemContainer .error");
const roomIdElem: HTMLSpanElement = document.querySelector('#mainPage .roomIdContainer .roomId');
const roomNameElem: HTMLHeadingElement = document.querySelector("#mainPage .head .roomName");


//Initial open of popup
chrome.tabs.query({active:true, currentWindow: true}, tabs => {
    activeTabId = tabs[0].id
    let pageMetadata: PageMetadata = <PageMetadata>{roomName: "", pageType: Page.START}

    chrome.tabs.sendMessage(activeTabId, {
        message: Messages.TOFG_IS_CHANNEL_OPEN
    } as MessageObject<null>, (resp: ResponseObject<boolean>) => {
        if (resp.status == Messages.SUCCESS && resp.payload) {
            chrome.tabs.sendMessage(activeTabId, {
                message: Messages.TOFG_RETRIEVE_ROOM_DATA
            } as MessageObject<null>, (resp: ResponseObject<ToPopupRoomPayload>) => {
                pageMetadata.roomId = resp.payload.room.roomId
                pageMetadata.roomName = resp.payload.room.roomName
                pageMetadata.pageType = Page.MAIN
                chatToggled = resp.payload.chatOpen

                changePage(pageMetadata)
                updateMainUsers(resp.payload.room.users)
                setChatOpenToggle(chatToggled)
                setOffsetInput(resp.payload.offsetTime, resp.payload.videoLength)
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
    } else if (nameInput.value.trim().length < 3) {
        errorMsgElem.classList.remove('hidden');
        errorMsgElem.innerHTML = 'Please enter a username longer than 3 chars';
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

syncBtn.addEventListener('click', () => {
    if (localUsers.length === 1){
        return
    }
    chrome.tabs.sendMessage(activeTabId, {
        message: Messages.TOFG_SYNC_VID
    } as MessageObject<null>)
})
chatToggleBtn.addEventListener('click', () => {
    chatToggled = !chatToggled
    chrome.tabs.sendMessage(activeTabId, {
        message: Messages.TOFG_CHAT_TOGGLE,
    } as MessageObject<null>, _ =>{
        setChatOpenToggle(chatToggled)
    })
})

const leaveRoom = () => {
    chrome.tabs.sendMessage(activeTabId, {
        message: Messages.TOFG_DISCONNECT
    } as MessageObject<null>)
    changePage({ pageType: Page.START, roomId: null, roomName: "" })
}

copyImgBtn.addEventListener('click', () => {
    let roomIdVal = roomIdElem.innerHTML
    navigator.clipboard.writeText(roomIdVal).then(() => {
    }, () => {
        //Failed to copy
    })
})

posOffsetBtn.addEventListener('click', () => {
    setOffset("UP")
})

resetOffsetBtn.addEventListener('click', () => {
    if (offsetInput.value !== "00:00:00") {
        offsetInput.value = "00:00:00"
        setOffset(null)
    }
})

const setOffset = (direction: "UP" | "DOWN") => {
    let time = offsetInput.value.split(":")
    let hours = parseInt(time[0])
    let mins = parseInt(time[1])
    let secs = parseInt(time[2])

    let offsetTime = hours*3600 + mins*60 + secs

    // setting button styles
    posOffsetBtn.classList.remove('toggledBtn')
    if (direction === "UP") {
        posOffsetBtn.classList.add('toggledBtn')
    }

    if ((offsetTime > 0 && direction !== null) || (!direction && offsetTime === 0)) {
        chrome.tabs.sendMessage(activeTabId, {
            message: Messages.TOFG_SET_OFFSET,
            payload: { offsetTime: offsetTime, direction: direction }
        } as MessageObject<ToFgOffsetPayload>)
    }
}

const joinRoomWithValidation = () => {
    let messageObject: MessageObject<ToFgJoinRoomPayload> = { 
        message: Messages.TOFG_JOIN_ROOM_IN_TAB, 
        payload: {
            roomId: roomNameInput.value.trim(), 
            userName: nameInput.value
        }
    }
    goIntoRoomWithValidation(messageObject)
}

const createNewRoomWithValidation = () => {
    let messageObject: MessageObject<ToFgNewRoomPayload> = { 
        message: Messages.TOFG_CREATE_ROOM_IN_TAB, 
        payload: {
            roomName: roomNameInput.value.trim(), 
            userName: nameInput.value
        }
    }
    goIntoRoomWithValidation(messageObject)
}

const goIntoRoomWithValidation = (messageObject: MessageObject<any>) => {
    chrome.tabs.sendMessage(activeTabId, { message: Messages.TOFG_VIDEO_ON_SCREEN } as MessageObject<null>, (resp: ResponseObject<boolean>) => {
        if (resp.status === Messages.SUCCESS && resp.payload && validRoomInput()) { 
            chrome.tabs.sendMessage(activeTabId, messageObject, (resp: ResponseObject<ToPopupRoomPayload>) => {
                if (resp.status === Messages.SUCCESS) {
                    changePage( { pageType: Page.MAIN, roomId: resp.payload.room.roomId, roomName: resp.payload.room.roomName } as PageMetadata)
                    updateMainUsers(resp.payload.room.users)
                    setChatOpenToggle(resp.payload.chatOpen)
                    setOffsetInput(resp.payload.offsetTime, resp.payload.videoLength)
                }
            })
        }
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
    localUsers = users
    
    if (localUsers.length === 1) {
        syncBtn.classList.add("disabledBtn")
    } else {
        syncBtn.classList.remove("disabledBtn")
    }

    usersListContainer.innerHTML = ""
    users.forEach(user => {
        let userElem = document.createElement("DIV");
        userElem.classList.add("userElem");
        if (!!user.current) {
            userElem.classList.add("currentUser")
        }
        if (user.admin && !user.current) {
            userElem.classList.add("adminUser")
        }
        let imgTitle = user.admin ? (!!user.current ? 'CurrentUserAdmin' : 'Admin') : (!!user.current ? 'CurrentUser' : 'RoomUser')
        let userIcon = (user.admin ? `<img class='userIcon' src='../images/adminUser.png' alt='adminuser' title=${imgTitle}>` : `<img class='userIcon' src='../images/user.png' alt='normaluser' title=${imgTitle}>`)
        let userName = (!!user.current ? `<strong>${user.userName}</strong>` : `${user.userName}`)
        
        if (user.admin && !user.current) {
            let adminNameContainer = '<div class="adminNameContainer">'+userIcon+`<span style="margin-left:5px; max-width: 80%; word-break: break-all">${userName}</span>`+`<div class="userColorCircle" style="background-color:${user.color}"></div></div>`;
            let adminTimerContainer = `
                <div class="adminTimerContainer">
                    <div id="loadingBar"></div>
                    <span id="adminTime">00:11:04/00:25:15</span>
                    <span id="adminVidPlaying"></span>
                </div>
            `
            userElem.innerHTML = adminNameContainer+adminTimerContainer
        } else {
            userElem.innerHTML = userIcon+`<span style="margin-left:5px; max-width: 80%; word-break: break-all">${userName}</span>`+`<div class="userColorCircle" style="background-color:${user.color}"></div>`;
        }
        usersListContainer.append(userElem);
    });
}

const setChatOpenToggle = (chatOpen: Boolean) => {
    if (chatOpen) {
        chatToggleBtn.classList.add('toggledBtn')
    } else {
        chatToggleBtn.classList.remove('toggledBtn')
    }
}

const setOffsetInput = (offsetTime: number, videoLength: number) => {

    // Admin does not see offset input
    if (localUsers.find(user => user.current)?.admin) {
        offsetContainer.style.display = "none"
        return
    }

    if (offsetTime > 0) {
        posOffsetBtn.classList.add('toggledBtn')
    }

    offsetTime < 0 ? offsetTime*=-1 : null

    // https://stackoverflow.com/questions/1322732/convert-seconds-to-hh-mm-ss-with-javascript
    let maxTime = new Date(videoLength * 1000).toISOString().substr(11, 8)
    let curTime = new Date(offsetTime * 1000).toISOString().substr(11, 8)
    offsetInput.setAttribute("data-duration-max", maxTime)
    offsetInput.setAttribute("data-duration-min", "00:00:00")
    offsetInput.value = curTime
}

const updateAdminContainer = (adminCurTime: number, adminVidLength: number, adminVidPaused: Boolean, adminVidBuffering: Boolean) => {
    let loadingBar: HTMLDivElement = <HTMLDivElement>document.getElementById("loadingBar")
    let adminTime: HTMLSpanElement = document.getElementById("adminTime")
    let adminVidPlaying: HTMLSpanElement = document.getElementById("adminVidPlaying")

    loadingBar.style.width = `${(adminCurTime/adminVidLength)*100}%`

    let curTimeFormatted = new Date(adminCurTime * 1000).toISOString().substr(11, 8)
    let vidLengthFormatted = new Date(adminVidLength * 1000).toISOString().substr(11, 8)
    adminTime.innerHTML = `${curTimeFormatted}/${vidLengthFormatted}`
    adminVidPlaying.innerHTML = adminVidBuffering ? "⌛" : (adminVidPaused ? "⏸︎" : "⏩︎")
    adminVidPlaying.title = adminVidBuffering ? "Buffering" : (adminVidPaused ? "Paused" : "Playing")
}

// Message handler
chrome.runtime.onMessage.addListener((request: MessageObject<any>, sender, sendResponse) => {

    //Check below is important b/c if we have multiple popups open in diff windows, we dont want all reacting to same event
    if (sender.tab?.id === activeTabId) {
        if (request.message === Messages.TOPOPUP_ROOM_DATA) {
            let reqData = <ToPopupRoomPayload>request.payload
            updateMainUsers(reqData.room.users)
            setOffsetInput(reqData.offsetTime, reqData.videoLength)
            setChatOpenToggle(reqData.chatOpen)
        } else if (request.message === Messages.TOPOPUP_ADMIN_VID_TIME_INFO) {
            let reqData = <ToPopupAdminTimeInfoPayload>request.payload
            updateAdminContainer(reqData.curTime, reqData.vidDuration, reqData.vidPaused, reqData.vidBuffering)
        } else if (request.message === Messages.TOPOPUP_LEAVE_ROOM) {
            changePage({ pageType: Page.START, roomId: null, roomName: "" })
        }
    }
    return true
});

setInterval(() => {
    //i.e we are connected to a room RN and current user is not admin
    if (localUsers.length > 0 && !localUsers.find(user => user.admin).current) {
        chrome.tabs.sendMessage(activeTabId, {
            message: Messages.TOFG_GET_ADMIN_VID_TIME
        } as MessageObject<null>)
    }
}, 1000)

