chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let vidElem = document.querySelector('video')
    if (request.message === 'video_on_screen') {
        if (vidElem != null && vidElem != undefined) {
            sendResponse({
                message: 'success',
                payload: true
            })
        } else {
            sendResponse({
                message: 'success',
                payload: false
            })
        }

        return true;
    } 
});