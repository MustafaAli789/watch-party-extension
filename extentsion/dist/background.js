/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./models/constants.ts":
/*!*****************************!*\
  !*** ./models/constants.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TabsStorage = exports.Messages = exports.Page = void 0;
var Page;
(function (Page) {
    Page[Page["START"] = 0] = "START";
    Page[Page["MAIN"] = 1] = "MAIN";
})(Page = exports.Page || (exports.Page = {}));
var Messages;
(function (Messages) {
    Messages[Messages["TOBG_VIDEO_ON_SCREEN"] = 0] = "TOBG_VIDEO_ON_SCREEN";
    Messages[Messages["SUCCESS"] = 1] = "SUCCESS";
    Messages[Messages["FAILURE"] = 2] = "FAILURE";
    Messages[Messages["TOBG_CREATE_ROOM_IN_TAB"] = 3] = "TOBG_CREATE_ROOM_IN_TAB";
    Messages[Messages["TOFG_VIDEO_ON_SCREEN"] = 4] = "TOFG_VIDEO_ON_SCREEN";
    Messages[Messages["TOFG_CREATE_ROOM_IN_TAB"] = 5] = "TOFG_CREATE_ROOM_IN_TAB";
    Messages[Messages["TOBG_DISCONNECT"] = 6] = "TOBG_DISCONNECT";
    Messages[Messages["TOFG_DISCONNECT"] = 7] = "TOFG_DISCONNECT";
    Messages[Messages["TOFG_RETRIEVE_ROOM_DATA"] = 8] = "TOFG_RETRIEVE_ROOM_DATA";
    Messages[Messages["TOFG_DO_YOU_EXIST"] = 9] = "TOFG_DO_YOU_EXIST";
    Messages[Messages["TOPOPUP_LEAVE_ROOM"] = 10] = "TOPOPUP_LEAVE_ROOM";
})(Messages = exports.Messages || (exports.Messages = {}));
exports.TabsStorage = "active_tabs_watchparty";


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!***********************!*\
  !*** ./background.ts ***!
  \***********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const constants_1 = __webpack_require__(/*! ./models/constants */ "./models/constants.ts");
chrome.runtime.onInstalled.addListener(() => {
    // default state goes here
    // this runs ONE TIME ONLY (unless the user reinstalls your extension)
    let initialTabs;
    initialTabs = {};
    initialTabs.tabs = [];
    setTabs(initialTabs);
});
const setTabs = (tabs) => {
    chrome.storage.local.set({
        [constants_1.TabsStorage]: tabs
    });
};
const setAllTabsToInactive = () => {
    chrome.storage.local.get(constants_1.TabsStorage, (data) => {
        let updatedTabs = Object.assign({}, data[constants_1.TabsStorage]);
        updatedTabs.tabs.forEach(tab => tab.active = false);
        setTabs(updatedTabs);
    });
};
const tabChange = (tabId, event) => {
    chrome.storage.local.get(constants_1.TabsStorage, (data) => {
        let updatedTabs = Object.assign({}, data[constants_1.TabsStorage]);
        chrome.tabs.query({}, tabs => {
            //removing old tabs from our storage obj if it has been closed
            for (let i = updatedTabs.tabs.length - 1; i >= 0; i--) {
                let tabStorage = updatedTabs.tabs[i];
                if (tabs.find(tab => tab.id == tabStorage.id) == null) {
                    updatedTabs.tabs.splice(i, 1);
                }
            }
            //new tab not in storage
            //special case where changing urls of a tab that prev had script injected needs to be injected again
            //cause url change causes script to be lost
            let existingTab = data[constants_1.TabsStorage].tabs.find(tab => tab.id === tabId);
            if (!existingTab || event === "onUpdated") {
                chrome.tabs.sendMessage(tabId, { message: constants_1.Messages.TOFG_DO_YOU_EXIST }, (resp) => {
                    if (chrome.runtime.lastError) {
                        // DOESNT EXIST CAN INJECT NOW
                        console.log("INJECTING FOREGROUND WITH TABID: " + tabId);
                        chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            files: ["./socketio/socket.io.js"]
                        })
                            .then(() => {
                            chrome.scripting.executeScript({
                                target: { tabId: tabId },
                                files: ["./foreground.js"]
                            }).then(() => {
                                if (!existingTab) {
                                    updatedTabs.tabs.push({ id: tabId, channelOpen: false, active: true });
                                    setTabs(updatedTabs);
                                }
                                else { //i.e url change on existing tab
                                    chrome.runtime.sendMessage({ message: constants_1.Messages.TOPOPUP_LEAVE_ROOM });
                                }
                            });
                        }).catch(err => console.log(err));
                    }
                });
                //existing tab in storage
            }
            else {
                updatedTabs.tabs.forEach(tab => {
                    if (tab.id == tabId) {
                        tab.active = true;
                    }
                    else {
                        tab.active = false;
                    }
                });
            }
            setTabs(updatedTabs);
        });
    });
};
//gone use this one for changing the tab b/w existing tabs (includes when u a close a tab and u auto go to another tab)
//technically this one is fired when creating a new tab too but its kinda useless since the url isnt ready at this point so cant inject script yet
chrome.tabs.onActivated.addListener(activeTabInfo => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        console.log(tabs);
        if (/^http/.test(tabs[0].url)) {
            tabChange(activeTabInfo.tabId, "onActivated");
        }
        else { //non http url
            setAllTabsToInactive();
        }
    });
});
//gonna use this one for when u create a new tab, or when you change the url of the cur tab ur on
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status == 'complete' && /^http/.test(tab.url)) {
        tabChange(tabId, "onUpdated");
    }
    else if (!/^http/.test(tab.url)) { //not http url
        setAllTabsToInactive();
    }
});
// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    chrome.storage.local.get(constants_1.TabsStorage, (data) => {
        let updatedTabs = Object.assign({}, data[constants_1.TabsStorage]);
        if (request.message === constants_1.Messages.TOBG_CREATE_ROOM_IN_TAB) {
            updatedTabs.tabs.find(tab => tab.active).channelOpen = true;
        }
        else if (request.message === constants_1.Messages.TOBG_DISCONNECT) {
            updatedTabs.tabs.find(tab => tab.active).channelOpen = false;
        }
        setTabs(updatedTabs);
    });
    return true;
});
// const standardMessageToForeground = (tabId: number, message: Messages, payload, callback: Function) => {
//     chrome.tabs.sendMessage(tabId, {
//         message: message,
//         payload: payload
//     }, resp => callback(resp))
// }
// //Send success or failure and pass on payload
// const standardCallback = (sendResponse) => (resp) => {
//     if (resp.status === Messages.SUCCESS) {
//         sendResponse({
//             status: Messages.SUCCESS,
//             payload: resp.payload
//         })
//     } else {
//         sendResponse({
//             status: Messages.FAILURE
//         })
//     }
// }

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsR0FBRyxLQUFLO1NBQy9EO1FBRUQsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3pCLENBQUMsQ0FBQztJQUNGLE9BQU8sSUFBSTtBQUNmLENBQUMsQ0FBQyxDQUFDO0FBRUgsMkdBQTJHO0FBQzNHLHVDQUF1QztBQUN2Qyw0QkFBNEI7QUFDNUIsMkJBQTJCO0FBQzNCLGlDQUFpQztBQUNqQyxJQUFJO0FBRUosZ0RBQWdEO0FBQ2hELHlEQUF5RDtBQUN6RCw4Q0FBOEM7QUFDOUMseUJBQXlCO0FBQ3pCLHdDQUF3QztBQUN4QyxvQ0FBb0M7QUFDcEMsYUFBYTtBQUNiLGVBQWU7QUFDZix5QkFBeUI7QUFDekIsdUNBQXVDO0FBQ3ZDLGFBQWE7QUFDYixRQUFRO0FBQ1IsSUFBSSIsInNvdXJjZXMiOlsid2VicGFjazovL2V4dGVudHNpb24vLi9tb2RlbHMvY29uc3RhbnRzLnRzIiwid2VicGFjazovL2V4dGVudHNpb24vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi8uL2JhY2tncm91bmQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGVudW0gUGFnZXtcclxuICAgIFNUQVJULFxyXG4gICAgTUFJTlxyXG59XHJcblxyXG5leHBvcnQgZW51bSBNZXNzYWdlc3tcclxuICAgIFRPQkdfVklERU9fT05fU0NSRUVOLFxyXG4gICAgU1VDQ0VTUyxcclxuICAgIEZBSUxVUkUsXHJcbiAgICBUT0JHX0NSRUFURV9ST09NX0lOX1RBQixcclxuICAgIFRPRkdfVklERU9fT05fU0NSRUVOLFxyXG4gICAgVE9GR19DUkVBVEVfUk9PTV9JTl9UQUIsXHJcbiAgICBUT0JHX0RJU0NPTk5FQ1QsXHJcbiAgICBUT0ZHX0RJU0NPTk5FQ1QsXHJcbiAgICBUT0ZHX1JFVFJJRVZFX1JPT01fREFUQSxcclxuICAgIFRPRkdfRE9fWU9VX0VYSVNULFxyXG4gICAgVE9QT1BVUF9MRUFWRV9ST09NXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBUYWJzU3RvcmFnZSA9IFwiYWN0aXZlX3RhYnNfd2F0Y2hwYXJ0eVwiXHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJpbXBvcnQgeyBNZXNzYWdlcywgUGFnZSwgVGFic1N0b3JhZ2UgfSBmcm9tICcuL21vZGVscy9jb25zdGFudHMnXHJcbmltcG9ydCB7IFRhYnMsIFRhYiB9IGZyb20gJy4vbW9kZWxzL3RhYnMnXHJcbmltcG9ydCB7IE1lc3NhZ2VPYmplY3QsIFJlc3BvbnNlT2JqZWN0IH0gZnJvbSAnLi9tb2RlbHMvbWVzc2FnZXBhc3NpbmcnXHJcblxyXG5cclxuY2hyb21lLnJ1bnRpbWUub25JbnN0YWxsZWQuYWRkTGlzdGVuZXIoKCkgPT4ge1xyXG4gICAgLy8gZGVmYXVsdCBzdGF0ZSBnb2VzIGhlcmVcclxuICAgIC8vIHRoaXMgcnVucyBPTkUgVElNRSBPTkxZICh1bmxlc3MgdGhlIHVzZXIgcmVpbnN0YWxscyB5b3VyIGV4dGVuc2lvbilcclxuXHJcbiAgICBsZXQgaW5pdGlhbFRhYnM6IFRhYnNcclxuICAgIGluaXRpYWxUYWJzID0ge30gYXMgVGFic1xyXG4gICAgaW5pdGlhbFRhYnMudGFicyA9IFtdXHJcblxyXG4gICAgc2V0VGFicyhpbml0aWFsVGFicylcclxufSk7XHJcblxyXG5jb25zdCBzZXRUYWJzID0gKHRhYnM6IFRhYnMpID0+IHtcclxuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7XHJcbiAgICAgICAgW1RhYnNTdG9yYWdlXTogdGFic1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IHNldEFsbFRhYnNUb0luYWN0aXZlID0gKCkgPT4ge1xyXG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFRhYnNTdG9yYWdlLCAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGxldCB1cGRhdGVkVGFiczogVGFicyA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGFbVGFic1N0b3JhZ2VdKVxyXG4gICAgICAgIHVwZGF0ZWRUYWJzLnRhYnMuZm9yRWFjaCh0YWIgPT4gdGFiLmFjdGl2ZSA9IGZhbHNlKVxyXG4gICAgICAgIHNldFRhYnModXBkYXRlZFRhYnMpXHJcbiAgICB9KVxyXG59XHJcblxyXG5jb25zdCB0YWJDaGFuZ2UgPSAodGFiSWQ6IG51bWJlciwgZXZlbnQ6IHN0cmluZykgPT4ge1xyXG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFRhYnNTdG9yYWdlLCAoZGF0YSkgPT4ge1xyXG5cclxuICAgICAgICBsZXQgdXBkYXRlZFRhYnM6IFRhYnMgPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhW1RhYnNTdG9yYWdlXSlcclxuXHJcbiAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoe30sIHRhYnMgPT4ge1xyXG5cclxuICAgICAgICAgICAgLy9yZW1vdmluZyBvbGQgdGFicyBmcm9tIG91ciBzdG9yYWdlIG9iaiBpZiBpdCBoYXMgYmVlbiBjbG9zZWRcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHVwZGF0ZWRUYWJzLnRhYnMubGVuZ3RoLTE7IGk+PTA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRhYlN0b3JhZ2U6IFRhYiA9IHVwZGF0ZWRUYWJzLnRhYnNbaV1cclxuICAgICAgICAgICAgICAgIGlmICh0YWJzLmZpbmQodGFiID0+IHRhYi5pZCA9PSB0YWJTdG9yYWdlLmlkKSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZFRhYnMudGFicy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vbmV3IHRhYiBub3QgaW4gc3RvcmFnZVxyXG4gICAgICAgICAgICAvL3NwZWNpYWwgY2FzZSB3aGVyZSBjaGFuZ2luZyB1cmxzIG9mIGEgdGFiIHRoYXQgcHJldiBoYWQgc2NyaXB0IGluamVjdGVkIG5lZWRzIHRvIGJlIGluamVjdGVkIGFnYWluXHJcbiAgICAgICAgICAgIC8vY2F1c2UgdXJsIGNoYW5nZSBjYXVzZXMgc2NyaXB0IHRvIGJlIGxvc3RcclxuICAgICAgICAgICAgbGV0IGV4aXN0aW5nVGFiID0gZGF0YVtUYWJzU3RvcmFnZV0udGFicy5maW5kKHRhYiA9PiB0YWIuaWQgPT09IHRhYklkKVxyXG4gICAgICAgICAgICBpZiAoIWV4aXN0aW5nVGFiIHx8IGV2ZW50ID09PSBcIm9uVXBkYXRlZFwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiSWQsIHsgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19ET19ZT1VfRVhJU1QgfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8Ym9vbGVhbj4pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBET0VTTlQgRVhJU1QgQ0FOIElOSkVDVCBOT1dcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJJTkpFQ1RJTkcgRk9SRUdST1VORCBXSVRIIFRBQklEOiBcIiArIHRhYklkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWJJZCB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IFtcIi4vc29ja2V0aW8vc29ja2V0LmlvLmpzXCJdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWJJZCB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBbXCIuL2ZvcmVncm91bmQuanNcIl1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXhpc3RpbmdUYWIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZFRhYnMudGFicy5wdXNoKHsgaWQ6IHRhYklkLCBjaGFubmVsT3BlbjogZmFsc2UsIGFjdGl2ZTogdHJ1ZSB9IGFzIFRhYilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGFicyh1cGRhdGVkVGFicylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgeyAvL2kuZSB1cmwgY2hhbmdlIG9uIGV4aXN0aW5nIHRhYlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7IG1lc3NhZ2U6IE1lc3NhZ2VzLlRPUE9QVVBfTEVBVkVfUk9PTSB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvL2V4aXN0aW5nIHRhYiBpbiBzdG9yYWdlXHJcbiAgICAgICAgICAgIH0gZWxzZSB7IFxyXG4gICAgICAgICAgICAgICAgdXBkYXRlZFRhYnMudGFicy5mb3JFYWNoKHRhYiA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhYi5pZCA9PSB0YWJJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWIuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWIuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2V0VGFicyh1cGRhdGVkVGFicylcclxuICAgICAgICB9KTtcclxuICAgIH0pXHJcbn1cclxuXHJcbi8vZ29uZSB1c2UgdGhpcyBvbmUgZm9yIGNoYW5naW5nIHRoZSB0YWIgYi93IGV4aXN0aW5nIHRhYnMgKGluY2x1ZGVzIHdoZW4gdSBhIGNsb3NlIGEgdGFiIGFuZCB1IGF1dG8gZ28gdG8gYW5vdGhlciB0YWIpXHJcbi8vdGVjaG5pY2FsbHkgdGhpcyBvbmUgaXMgZmlyZWQgd2hlbiBjcmVhdGluZyBhIG5ldyB0YWIgdG9vIGJ1dCBpdHMga2luZGEgdXNlbGVzcyBzaW5jZSB0aGUgdXJsIGlzbnQgcmVhZHkgYXQgdGhpcyBwb2ludCBzbyBjYW50IGluamVjdCBzY3JpcHQgeWV0XHJcbmNocm9tZS50YWJzLm9uQWN0aXZhdGVkLmFkZExpc3RlbmVyKGFjdGl2ZVRhYkluZm8gPT4ge1xyXG4gICAgY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZX0sIHRhYnMgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRhYnMpXHJcbiAgICAgICAgaWYgKC9eaHR0cC8udGVzdCh0YWJzWzBdLnVybCkpIHtcclxuICAgICAgICAgICAgdGFiQ2hhbmdlKGFjdGl2ZVRhYkluZm8udGFiSWQsIFwib25BY3RpdmF0ZWRcIik7XHJcbiAgICAgICAgfSBlbHNlIHsgLy9ub24gaHR0cCB1cmxcclxuICAgICAgICAgICAgc2V0QWxsVGFic1RvSW5hY3RpdmUoKVxyXG4gICAgICAgIH1cclxuICAgfSlcclxufSlcclxuXHJcblxyXG4vL2dvbm5hIHVzZSB0aGlzIG9uZSBmb3Igd2hlbiB1IGNyZWF0ZSBhIG5ldyB0YWIsIG9yIHdoZW4geW91IGNoYW5nZSB0aGUgdXJsIG9mIHRoZSBjdXIgdGFiIHVyIG9uXHJcbmNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcigodGFiSWQsIGNoYW5nZUluZm8sIHRhYikgPT4ge1xyXG4gICAgaWYgKGNoYW5nZUluZm8uc3RhdHVzID09ICdjb21wbGV0ZScgJiYgL15odHRwLy50ZXN0KHRhYi51cmwpKSB7XHJcbiAgICAgICAgdGFiQ2hhbmdlKHRhYklkLCBcIm9uVXBkYXRlZFwiKTtcclxuICAgIH0gZWxzZSBpZiAoIS9eaHR0cC8udGVzdCh0YWIudXJsKSkgeyAvL25vdCBodHRwIHVybFxyXG4gICAgICAgIHNldEFsbFRhYnNUb0luYWN0aXZlKClcclxuICAgIH1cclxufSk7XHJcblxyXG4vLyBNZXNzYWdlIGhhbmRsZXJcclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0OiBNZXNzYWdlT2JqZWN0PGFueT4sIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcblxyXG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFRhYnNTdG9yYWdlLCAoZGF0YTogVGFicykgPT4ge1xyXG4gICAgICAgIGxldCB1cGRhdGVkVGFiczogVGFicyA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGFbVGFic1N0b3JhZ2VdKVxyXG5cclxuICAgICAgICBpZiAocmVxdWVzdC5tZXNzYWdlID09PSBNZXNzYWdlcy5UT0JHX0NSRUFURV9ST09NX0lOX1RBQikge1xyXG4gICAgICAgICAgICB1cGRhdGVkVGFicy50YWJzLmZpbmQodGFiID0+IHRhYi5hY3RpdmUpLmNoYW5uZWxPcGVuID0gdHJ1ZVxyXG4gICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5tZXNzYWdlID09PSBNZXNzYWdlcy5UT0JHX0RJU0NPTk5FQ1QpIHtcclxuICAgICAgICAgICAgdXBkYXRlZFRhYnMudGFicy5maW5kKHRhYiA9PiB0YWIuYWN0aXZlKS5jaGFubmVsT3BlbiA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZXRUYWJzKHVwZGF0ZWRUYWJzKTtcclxuICAgIH0pXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG59KTtcclxuXHJcbi8vIGNvbnN0IHN0YW5kYXJkTWVzc2FnZVRvRm9yZWdyb3VuZCA9ICh0YWJJZDogbnVtYmVyLCBtZXNzYWdlOiBNZXNzYWdlcywgcGF5bG9hZCwgY2FsbGJhY2s6IEZ1bmN0aW9uKSA9PiB7XHJcbi8vICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwge1xyXG4vLyAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXHJcbi8vICAgICAgICAgcGF5bG9hZDogcGF5bG9hZFxyXG4vLyAgICAgfSwgcmVzcCA9PiBjYWxsYmFjayhyZXNwKSlcclxuLy8gfVxyXG5cclxuLy8gLy9TZW5kIHN1Y2Nlc3Mgb3IgZmFpbHVyZSBhbmQgcGFzcyBvbiBwYXlsb2FkXHJcbi8vIGNvbnN0IHN0YW5kYXJkQ2FsbGJhY2sgPSAoc2VuZFJlc3BvbnNlKSA9PiAocmVzcCkgPT4ge1xyXG4vLyAgICAgaWYgKHJlc3Auc3RhdHVzID09PSBNZXNzYWdlcy5TVUNDRVNTKSB7XHJcbi8vICAgICAgICAgc2VuZFJlc3BvbnNlKHtcclxuLy8gICAgICAgICAgICAgc3RhdHVzOiBNZXNzYWdlcy5TVUNDRVNTLFxyXG4vLyAgICAgICAgICAgICBwYXlsb2FkOiByZXNwLnBheWxvYWRcclxuLy8gICAgICAgICB9KVxyXG4vLyAgICAgfSBlbHNlIHtcclxuLy8gICAgICAgICBzZW5kUmVzcG9uc2Uoe1xyXG4vLyAgICAgICAgICAgICBzdGF0dXM6IE1lc3NhZ2VzLkZBSUxVUkVcclxuLy8gICAgICAgICB9KVxyXG4vLyAgICAgfVxyXG4vLyB9XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==