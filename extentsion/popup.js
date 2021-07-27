let Messages = {
    TOBG_VIDEO_ON_SCREEN: "tobg_validate_video_elem_on_screen",
    SUCCESS: "success",
    FAILURE: "failure",
    TOBG_CREATE_ROOM_IN_TAB: "tobg_create_room_in_tab",
    TOFG_VIDEO_ON_SCREEN: "tofg_validate_video_elem_on_screen",
    TOFG_CREATE_ROOM_IN_TAB: "tofg_create_room_in_tab",
    TOBG_DISCONNECT: "tobg_disconnect",
    TOFG_DISCONNECT: 'tofg_disconnect'
}

const newRoomBtn = document.getElementById("newRoomBtn")
const joinRoomBtn = document.getElementById("joinRoomBtn")
const backBtn = document.getElementById("backBtn")
const roomNameInput = document.getElementById("roomInput")
const errorMsg = document.querySelector(".error")
const nameInput = document.getElementById("nameInput")
const copyImgBtn = document.getElementById("copyImgBtn")

//Initial open of popup
chrome.storage.local.get('page', data => {
    changePage(data.page)
})

validRoomInput = () => {
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
                page: "Start"
            });
            changePage('Start')
        } else {
            //err
        }
    })
})
copyImgBtn.addEventListener('click', () => {
    let roomId = document.querySelector("#roomId").innerHTML
    navigator.clipboard.writeText(roomId).then(() => {
        alert("Successfully copied")
    }, () => {
        alert("Failed to copy")
    })
})

createNewRoomWithValidation = () => {
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
                        changePage('Main', { roomId: resp.payload.roomId })
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

changePage = (page, details) => {
    if (page === 'Start') {
        document.getElementById("startPage").classList.remove('hidden')
        document.getElementById("mainPage").classList.add('hidden')
        document.getElementById("header").classList.remove('hidden')
        roomNameInput.value = ""
        nameInput.value = ""
    } else if (page === 'Main') {
        document.getElementById("startPage").classList.add('hidden')
        document.getElementById("mainPage").classList.remove('hidden')
        document.getElementById("header").classList.add('hidden')

        document.querySelector("#mainPage .roomName").innerHTML =  `${nameInput.value}`
        document.getElementById("roomId").innerHTML = `${details.roomId}`

    }
}

//[user{userName: string, roomId: string, userId: string}]
updateMainUsers = (users) => {
    console.log(users)
}



