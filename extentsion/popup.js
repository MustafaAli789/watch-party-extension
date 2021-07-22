const Messages = {
    TOBG_VIDEO_ON_SCREEN: "tobg_validate_video_elem_on_screen",
    SUCCESS: "success",
    FAILURE: "failure",
    TOBG_OPEN_CHANNEL_IN_TAB: "tobg_open_channel_in_tab",
    TOFG_VIDEO_ON_SCREEN: "tofg_validate_video_elem_on_screen",
    TOFG_OPEN_CHANNEL_IN_TAB: "tofg_open_channel_in_tab",
}

const newRoomBtn = document.getElementById("newRoomBtn")
const joinRoomBtn = document.getElementById("joinRoomBtn")
const backBtn = document.getElementById("backBtn")
const roomNameInput = document.getElementById("roomInput")
const errorMsg = document.querySelector(".error")

//Initial open of popup
chrome.storage.local.get('page', data => {
    changePage(data.page)
})

validRoomInput = () => {
    return roomNameInput.value.trim() != ""
}

newRoomBtn.addEventListener('click', e => {
    goToMainWithValidation()
})
joinRoomBtn.addEventListener('click', e => {
    goToMainWithValidation()
})
backBtn.addEventListener('click', e => {
    chrome.storage.local.set({
        page: "Start"
    });
    changePage('Start')
})

goToMainWithValidation = () => {
    chrome.runtime.sendMessage({ 
        message: Messages.TOBG_VIDEO_ON_SCREEN
    }, response => {
        if (response.status === Messages.SUCCESS) {
            if (response.payload === true) {
                if (!validRoomInput()) {
                    errorMsg.classList.remove('hidden')
                    errorMsg.innerHTML = 'Please enter a room/id'
                    return
                } else {
                    errorMsg.classList.add('hidden')
                    errorMsg.innerHTML = ''
                }
                chrome.runtime.sendMessage({
                    message: Messages.TOBG_OPEN_CHANNEL_IN_TAB,
                    payload: roomNameInput.value.trim()
                }, resp => {
                    if (resp.status === Messages.SUCCESS) {
                        chrome.storage.local.set({
                            page: "Main"
                        });
                        changePage('Main')
                    } else {
                        //err
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

changePage = (page) => {
    if (page === 'Start') {
        document.getElementById("startPage").classList.remove('hidden')
        document.getElementById("mainPage").classList.add('hidden')
        roomNameInput.value = ""
    } else if (page === 'Main') {
        document.getElementById("startPage").classList.add('hidden')
        document.getElementById("mainPage").classList.remove('hidden')
    }
}



