chrome.runtime.onInstalled.addListener(() => {
    // default state goes here
    // this runs ONE TIME ONLY (unless the user reinstalls your extension)
    chrome.storage.local.set({
        page: "Start"
    });
});



// Message handler

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'get_cur_page') {
        chrome.storage.local.get('page', data => {
            if (chrome.runtime.lastError) {
                sendResponse({
                    message: 'fail'
                });
                return;
            }

            sendResponse({
                message: 'success',
                payload: data.page
            });
        });

        return true;
    } 
    // else if (request.message === 'change_name') {
    //     chrome.storage.local.set({
    //         name: request.payload
    //     }, () => {
    //         if (chrome.runtime.lastError) {
    //             sendResponse({ message: 'fail' });
    //             return;
    //         }

    //         sendResponse({ message: 'success' });
    //     })

    //     return true;
    // }
});
