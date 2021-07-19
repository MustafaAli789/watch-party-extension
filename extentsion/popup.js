const newRoomBtn = document.getElementById("newRoomBtn")
const joinRoomBtn = document.getElementById("joinRoomBtn")
const backBtn = document.getElementById("backBtn")
const roomNameInput = document.getElementById("roomInput")
const errorMsg = document.querySelector(".error")

let curActivePage = 'Start'

//Initial open of popup
chrome.runtime.sendMessage({ 
    message: "get_cur_page"
}, response => {
    if (response.message === 'success') {
        changePage(response.payload)
    }
});

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
        message: "validate_video_elem_on_screen"
    }, response => {
        if (response.message === 'success') {
            if (response.payload === true) {
                if (!validRoomInput()) {
                    errorMsg.classList.remove('hidden')
                    errorMsg.innerHTML = 'Please enter a room/id'
                    return
                } else {
                    errorMsg.classList.add('hidden')
                    errorMsg.innerHTML = ''
                }
                chrome.storage.local.set({
                    page: "Main"
                });
                changePage('Main')
            }
        } else {
            alert('Bigg RIP eh')
        }
    });
}

changePage = (page) => {
    if (page === 'Start') {
        curActivePage = 'Start'
        document.getElementById("startPage").classList.remove('hidden')
        document.getElementById("mainPage").classList.add('hidden')
        roomNameInput.value = ""
    } else if (page === 'Main') {
        curActivePage = 'Main'
        document.getElementById("startPage").classList.add('hidden')
        document.getElementById("mainPage").classList.remove('hidden')
    }
}



