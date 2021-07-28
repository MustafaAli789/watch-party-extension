import { Messages, Page, PageStorage } from './models/constants'
const newRoomBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById("newRoomBtn")
const joinRoomBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById("joinRoomBtn")
const backBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById("backBtn")
const roomNameInput: HTMLInputElement = <HTMLInputElement>document.getElementById("roomInput")
const errorMsg: HTMLParagraphElement = document.querySelector(".error")
const nameInput: HTMLInputElement = <HTMLInputElement>document.getElementById("nameInput")
const copyImgBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById("copyImgBtn")

//Initial open of popup
chrome.storage.local.get(PageStorage, data => {
    let page: Page = data[PageStorage]
    changePage(page, null)
})

const validRoomInput = () => {
    if(roomNameInput.value.trim() === "") {
        errorMsg.classList.remove('hidden')
        errorMsg.innerHTML = 'Please enter a room/id'
        return false
    } else {
        errorMsg.classList.add('hidden')
        errorMsg.innerHTML = ''
        return true
    }
}

newRoomBtn.addEventListener('click', e => {
    createNewRoomWithValidation()
})
joinRoomBtn.addEventListener('click', e => {
    //goToMainWithValidation()
})
backBtn.addEventListener('click', e => {
    chrome.runtime.sendMessage({
        message: Messages.TOBG_DISCONNECT
    }, resp => {
        if (resp.status === Messages.SUCCESS) {
            chrome.storage.local.set({
                [PageStorage]: Page.start
            });
            changePage(Page.start,  null)
        } else {
            //err
        }
    })
})
copyImgBtn.addEventListener('click', () => {
    let roomId = document.querySelector("#roomId").innerHTML
    navigator.clipboard.writeText(roomId).then(() => {
        //Successfully copied
    }, () => {
        //Failed to copy
    })
})

const createNewRoomWithValidation = () => {
    chrome.runtime.sendMessage({ 
        message: Messages.TOBG_VIDEO_ON_SCREEN
    }, response => {
        if (response.status === Messages.SUCCESS) {
            if (response.payload === true) {
                if(!validRoomInput()) return
                chrome.runtime.sendMessage({
                    message: Messages.TOBG_CREATE_ROOM_IN_TAB,
                    payload: {
                        roomName: roomNameInput.value.trim(), 
                        userName: nameInput.value
                    }
                }, resp => {
                    if (resp.status === Messages.SUCCESS) {
                        chrome.storage.local.set({
                            page: "Main"
                        });
                        console.log(resp.payload)
                        changePage(Page.main, { roomId: resp.payload.roomId })
                        updateMainUsers(resp.payload.users)
                    } else {
                        //err for some reason couldnt connect to socket server
                    }
                })
            } else{
                //no video on screen
            }
        } else {
            //err
        }
    });
}

const changePage = (page: Page, details) => {
    if (page === Page.start) {
        document.getElementById("startPage").classList.remove('hidden')
        document.getElementById("mainPage").classList.add('hidden')
        document.getElementById("header").classList.remove('hidden')
        roomNameInput.value = ""
        nameInput.value = ""
    } else if (page === Page.main) {
        document.getElementById("startPage").classList.add('hidden')
        document.getElementById("mainPage").classList.remove('hidden')
        document.getElementById("header").classList.add('hidden')

        document.querySelector("#mainPage .roomName").innerHTML =  `${nameInput.value}`
        document.getElementById("roomId").innerHTML = `${details?.roomId}`

    }
}

//[user{userName: string, roomId: string, userId: string}]
const updateMainUsers = (users) => {
    let usersContaienr = document.querySelector("#mainPage .users")
    users.forEach(user => {
        let userElem = document.createElement("DIV")
        userElem.classList.add("userElem")
        userElem.innerHTML = user.userName
        usersContaienr.append(userElem)
    });
}



