const newRoomBtn = document.getElementById("newRoom")
const joinRoomBtn = document.getElementById("joinRoom")
let curActivePage = 'Start'

//Initial open of popup
chrome.runtime.sendMessage({ 
    message: "get_cur_page"
}, response => {
    if (response.message === 'success') {
        changePage(response.payload)
    }
});

newRoomBtn.addEventListener('click', e => {
    if (curActivePage === 'Start') {
        chrome.storage.local.set({
            page: "Main"
        });
        changePage('Main')
    }
})
joinRoomBtn.addEventListener('click', e => {
    if (curActivePage === 'Start') {
        chrome.storage.local.set({
            page: "Main"
        });
        changePage('Main')
    }
})

changePage = (page) => {
    if (page === 'Start') {
        curActivePage = 'Start'
        document.getElementById("startPage").classList.remove('hidden')
        document.getElementById("mainPage").classList.add('hidden')
    } else if (page === 'Main') {
        curActivePage = 'Main'
        document.getElementById("startPage").classList.add('hidden')
        document.getElementById("mainPage").classList.remove('hidden')
    }
}



