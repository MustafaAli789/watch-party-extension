const goToStartButton = document.getElementById("goToStartButton")
let curActivePage = 'Start'

//Initial open of popup
chrome.runtime.sendMessage({ 
    message: "get_cur_page"
}, response => {
    if (response.message === 'success') {
        changePage(response.payload)
    }
});

goToStartButton.addEventListener('click', e => {
    if (curActivePage === 'Start') {
        chrome.storage.local.set({
            page: "Main"
        });
        changePage('Main')
    } else if (curActivePage === 'Main') {
        chrome.storage.local.set({
            page: "Start"
        });
        changePage('Start')
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



