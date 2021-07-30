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
const tabChange = (tabId, logMsg) => {
    chrome.storage.local.get(constants_1.TabsStorage, (data) => {
        let updatedTabs = Object.assign({}, data[constants_1.TabsStorage]);
        //needs to be out here in case someone has a normal tab open but then opens a new chrome:// tab after
        //the new tab wont be added to our tabs storage or injected but we do need all others tabs to be active false now
        updatedTabs.tabs.forEach(tab => tab.active = false);
        chrome.tabs.query({}, tabs => {
            //removing old tabs from our storage obj if it has been closed
            for (let i = updatedTabs.tabs.length - 1; i >= 0; i--) {
                let tabStorage = updatedTabs.tabs[i];
                if (tabs.find(tab => tab.id == tabStorage.id) == null) {
                    updatedTabs.tabs.splice(i, 1);
                }
            }
            //new tab not in storage
            if (data[constants_1.TabsStorage].tabs.find(tab => tab.id === tabId) == null) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ["./socketio/socket.io.js"]
                })
                    .then(() => {
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ["./foreground.js"]
                    }).then(() => {
                        updatedTabs.tabs.push({ id: tabId, channelOpen: false, active: true });
                        setTabs(updatedTabs);
                        console.log(logMsg);
                    });
                }).catch(err => console.log(err));
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
                console.log(logMsg);
            }
            setTabs(updatedTabs);
        });
    });
};
//gone use this one for changing the tab b/w existing tabs (includes when u a close a tab and u auto go to another tab)
//technically this one is fired when creating a new tab too but its kinda useless since the url isnt ready at this point so cant inject script yet
chrome.tabs.onActivated.addListener(activeTabInfo => {
    tabChange(activeTabInfo.tabId, "onActivated");
});
//SPECIAL NOTE FOR BELOW METHOD:
//even if you change cur url to a chrome:// url, since the script has already been injected and tabid is not changing, nothing shuld really happen
//active stays true and no errors pop up
//gonna use this one for when u create a new tab, or when you change the url of the cur tab ur on
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        tabChange(tabId, "onUpdated");
    }
});
// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    chrome.storage.local.get(constants_1.TabsStorage, (data) => {
        let updatedTabs = data;
        if (request.message === constants_1.Messages.TOBG_CREATE_ROOM_IN_TAB) {
            updatedTabs.tabs.find(tab => tab.active = true).channelOpen = true;
        }
        else if (request.message === constants_1.Messages.TOBG_DISCONNECT) {
            updatedTabs.tabs.find(tab => tab.active = true).channelOpen = false;
        }
        setTabs(updatedTabs);
    });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q04sQ0FBQyxDQUFDLENBQUM7QUFFSCwyR0FBMkc7QUFDM0csdUNBQXVDO0FBQ3ZDLDRCQUE0QjtBQUM1QiwyQkFBMkI7QUFDM0IsaUNBQWlDO0FBQ2pDLElBQUk7QUFFSixnREFBZ0Q7QUFDaEQseURBQXlEO0FBQ3pELDhDQUE4QztBQUM5Qyx5QkFBeUI7QUFDekIsd0NBQXdDO0FBQ3hDLG9DQUFvQztBQUNwQyxhQUFhO0FBQ2IsZUFBZTtBQUNmLHlCQUF5QjtBQUN6Qix1Q0FBdUM7QUFDdkMsYUFBYTtBQUNiLFFBQVE7QUFDUixJQUFJIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi8uL21vZGVscy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leHRlbnRzaW9uLy4vYmFja2dyb3VuZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBQYWdle1xyXG4gICAgU1RBUlQsXHJcbiAgICBNQUlOXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIE1lc3NhZ2Vze1xyXG4gICAgVE9CR19WSURFT19PTl9TQ1JFRU4sXHJcbiAgICBTVUNDRVNTLFxyXG4gICAgRkFJTFVSRSxcclxuICAgIFRPQkdfQ1JFQVRFX1JPT01fSU5fVEFCLFxyXG4gICAgVE9GR19WSURFT19PTl9TQ1JFRU4sXHJcbiAgICBUT0ZHX0NSRUFURV9ST09NX0lOX1RBQixcclxuICAgIFRPQkdfRElTQ09OTkVDVCxcclxuICAgIFRPRkdfRElTQ09OTkVDVCxcclxuICAgIFRPRkdfUkVUUklFVkVfUk9PTV9EQVRBXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBUYWJzU3RvcmFnZSA9IFwiYWN0aXZlX3RhYnNfd2F0Y2hwYXJ0eVwiXHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJpbXBvcnQgeyBNZXNzYWdlcywgUGFnZSwgVGFic1N0b3JhZ2UgfSBmcm9tICcuL21vZGVscy9jb25zdGFudHMnXHJcbmltcG9ydCB7IFRhYnMsIFRhYiB9IGZyb20gJy4vbW9kZWxzL3RhYnMnXHJcbmltcG9ydCB7IE1lc3NhZ2VPYmplY3QgfSBmcm9tICcuL21vZGVscy9tZXNzYWdlcGFzc2luZydcclxuXHJcblxyXG5jaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcigoKSA9PiB7XHJcbiAgICAvLyBkZWZhdWx0IHN0YXRlIGdvZXMgaGVyZVxyXG4gICAgLy8gdGhpcyBydW5zIE9ORSBUSU1FIE9OTFkgKHVubGVzcyB0aGUgdXNlciByZWluc3RhbGxzIHlvdXIgZXh0ZW5zaW9uKVxyXG5cclxuICAgIGxldCBpbml0aWFsVGFiczogVGFic1xyXG4gICAgaW5pdGlhbFRhYnMgPSB7fSBhcyBUYWJzXHJcbiAgICBpbml0aWFsVGFicy50YWJzID0gW11cclxuXHJcbiAgICBzZXRUYWJzKGluaXRpYWxUYWJzKVxyXG59KTtcclxuXHJcbmNvbnN0IHNldFRhYnMgPSAodGFiczogVGFicykgPT4ge1xyXG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcclxuICAgICAgICBbVGFic1N0b3JhZ2VdOiB0YWJzXHJcbiAgICB9KTtcclxufVxyXG5cclxuY29uc3QgdGFiQ2hhbmdlID0gKHRhYklkOiBudW1iZXIsIGxvZ01zZzogc3RyaW5nKSA9PiB7XHJcbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoVGFic1N0b3JhZ2UsIChkYXRhKSA9PiB7XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVkVGFiczogVGFicyA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGFbVGFic1N0b3JhZ2VdKVxyXG5cclxuICAgICAgICAvL25lZWRzIHRvIGJlIG91dCBoZXJlIGluIGNhc2Ugc29tZW9uZSBoYXMgYSBub3JtYWwgdGFiIG9wZW4gYnV0IHRoZW4gb3BlbnMgYSBuZXcgY2hyb21lOi8vIHRhYiBhZnRlclxyXG4gICAgICAgIC8vdGhlIG5ldyB0YWIgd29udCBiZSBhZGRlZCB0byBvdXIgdGFicyBzdG9yYWdlIG9yIGluamVjdGVkIGJ1dCB3ZSBkbyBuZWVkIGFsbCBvdGhlcnMgdGFicyB0byBiZSBhY3RpdmUgZmFsc2Ugbm93XHJcbiAgICAgICAgdXBkYXRlZFRhYnMudGFicy5mb3JFYWNoKHRhYiA9PiB0YWIuYWN0aXZlID0gZmFsc2UpXHJcblxyXG4gICAgICAgIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCB0YWJzID0+IHtcclxuXHJcbiAgICAgICAgICAgIC8vcmVtb3Zpbmcgb2xkIHRhYnMgZnJvbSBvdXIgc3RvcmFnZSBvYmogaWYgaXQgaGFzIGJlZW4gY2xvc2VkXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSB1cGRhdGVkVGFicy50YWJzLmxlbmd0aC0xOyBpPj0wOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGxldCB0YWJTdG9yYWdlOiBUYWIgPSB1cGRhdGVkVGFicy50YWJzW2ldXHJcbiAgICAgICAgICAgICAgICBpZiAodGFicy5maW5kKHRhYiA9PiB0YWIuaWQgPT0gdGFiU3RvcmFnZS5pZCkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRUYWJzLnRhYnMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL25ldyB0YWIgbm90IGluIHN0b3JhZ2VcclxuICAgICAgICAgICAgaWYgKGRhdGFbVGFic1N0b3JhZ2VdLnRhYnMuZmluZCh0YWIgPT4gdGFiLmlkID09PSB0YWJJZCkgPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWJJZCB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzOiBbXCIuL3NvY2tldGlvL3NvY2tldC5pby5qc1wiXVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQ6IHRhYklkIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBbXCIuL2ZvcmVncm91bmQuanNcIl1cclxuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZFRhYnMudGFicy5wdXNoKHsgaWQ6IHRhYklkLCBjaGFubmVsT3BlbjogZmFsc2UsIGFjdGl2ZTogdHJ1ZSB9IGFzIFRhYilcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGFicyh1cGRhdGVkVGFicylcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cobG9nTXNnKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvL2V4aXN0aW5nIHRhYiBpbiBzdG9yYWdlXHJcbiAgICAgICAgICAgIH0gZWxzZSB7IFxyXG4gICAgICAgICAgICAgICAgdXBkYXRlZFRhYnMudGFicy5mb3JFYWNoKHRhYiA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhYi5pZCA9PSB0YWJJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWIuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWIuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGxvZ01zZylcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2V0VGFicyh1cGRhdGVkVGFicylcclxuICAgICAgICB9KTtcclxuICAgIH0pXHJcbn1cclxuXHJcbi8vZ29uZSB1c2UgdGhpcyBvbmUgZm9yIGNoYW5naW5nIHRoZSB0YWIgYi93IGV4aXN0aW5nIHRhYnMgKGluY2x1ZGVzIHdoZW4gdSBhIGNsb3NlIGEgdGFiIGFuZCB1IGF1dG8gZ28gdG8gYW5vdGhlciB0YWIpXHJcbi8vdGVjaG5pY2FsbHkgdGhpcyBvbmUgaXMgZmlyZWQgd2hlbiBjcmVhdGluZyBhIG5ldyB0YWIgdG9vIGJ1dCBpdHMga2luZGEgdXNlbGVzcyBzaW5jZSB0aGUgdXJsIGlzbnQgcmVhZHkgYXQgdGhpcyBwb2ludCBzbyBjYW50IGluamVjdCBzY3JpcHQgeWV0XHJcbmNocm9tZS50YWJzLm9uQWN0aXZhdGVkLmFkZExpc3RlbmVyKGFjdGl2ZVRhYkluZm8gPT4ge1xyXG5cclxuICAgIHRhYkNoYW5nZShhY3RpdmVUYWJJbmZvLnRhYklkLCBcIm9uQWN0aXZhdGVkXCIpO1xyXG59KVxyXG5cclxuLy9TUEVDSUFMIE5PVEUgRk9SIEJFTE9XIE1FVEhPRDpcclxuLy9ldmVuIGlmIHlvdSBjaGFuZ2UgY3VyIHVybCB0byBhIGNocm9tZTovLyB1cmwsIHNpbmNlIHRoZSBzY3JpcHQgaGFzIGFscmVhZHkgYmVlbiBpbmplY3RlZCBhbmQgdGFiaWQgaXMgbm90IGNoYW5naW5nLCBub3RoaW5nIHNodWxkIHJlYWxseSBoYXBwZW5cclxuLy9hY3RpdmUgc3RheXMgdHJ1ZSBhbmQgbm8gZXJyb3JzIHBvcCB1cFxyXG5cclxuLy9nb25uYSB1c2UgdGhpcyBvbmUgZm9yIHdoZW4gdSBjcmVhdGUgYSBuZXcgdGFiLCBvciB3aGVuIHlvdSBjaGFuZ2UgdGhlIHVybCBvZiB0aGUgY3VyIHRhYiB1ciBvblxyXG5jaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoKHRhYklkLCBjaGFuZ2VJbmZvLCB0YWIpID0+IHtcclxuICAgIGlmIChjaGFuZ2VJbmZvLnN0YXR1cyA9PT0gJ2NvbXBsZXRlJykge1xyXG4gICAgICAgIHRhYkNoYW5nZSh0YWJJZCwgXCJvblVwZGF0ZWRcIik7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuLy8gTWVzc2FnZSBoYW5kbGVyXHJcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigocmVxdWVzdDogTWVzc2FnZU9iamVjdDxhbnk+LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG5cclxuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChUYWJzU3RvcmFnZSwgKGRhdGE6IFRhYnMpID0+IHtcclxuICAgICAgICBsZXQgdXBkYXRlZFRhYnM6IFRhYnMgPSBkYXRhXHJcblxyXG4gICAgICAgIGlmIChyZXF1ZXN0Lm1lc3NhZ2UgPT09IE1lc3NhZ2VzLlRPQkdfQ1JFQVRFX1JPT01fSU5fVEFCKSB7XHJcbiAgICAgICAgICAgIHVwZGF0ZWRUYWJzLnRhYnMuZmluZCh0YWIgPT4gdGFiLmFjdGl2ZSA9IHRydWUpLmNoYW5uZWxPcGVuID0gdHJ1ZVxyXG4gICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5tZXNzYWdlID09PSBNZXNzYWdlcy5UT0JHX0RJU0NPTk5FQ1QpIHtcclxuICAgICAgICAgICAgdXBkYXRlZFRhYnMudGFicy5maW5kKHRhYiA9PiB0YWIuYWN0aXZlID0gdHJ1ZSkuY2hhbm5lbE9wZW4gPSBmYWxzZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2V0VGFicyh1cGRhdGVkVGFicyk7XHJcbiAgICB9KVxyXG59KTtcclxuXHJcbi8vIGNvbnN0IHN0YW5kYXJkTWVzc2FnZVRvRm9yZWdyb3VuZCA9ICh0YWJJZDogbnVtYmVyLCBtZXNzYWdlOiBNZXNzYWdlcywgcGF5bG9hZCwgY2FsbGJhY2s6IEZ1bmN0aW9uKSA9PiB7XHJcbi8vICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwge1xyXG4vLyAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXHJcbi8vICAgICAgICAgcGF5bG9hZDogcGF5bG9hZFxyXG4vLyAgICAgfSwgcmVzcCA9PiBjYWxsYmFjayhyZXNwKSlcclxuLy8gfVxyXG5cclxuLy8gLy9TZW5kIHN1Y2Nlc3Mgb3IgZmFpbHVyZSBhbmQgcGFzcyBvbiBwYXlsb2FkXHJcbi8vIGNvbnN0IHN0YW5kYXJkQ2FsbGJhY2sgPSAoc2VuZFJlc3BvbnNlKSA9PiAocmVzcCkgPT4ge1xyXG4vLyAgICAgaWYgKHJlc3Auc3RhdHVzID09PSBNZXNzYWdlcy5TVUNDRVNTKSB7XHJcbi8vICAgICAgICAgc2VuZFJlc3BvbnNlKHtcclxuLy8gICAgICAgICAgICAgc3RhdHVzOiBNZXNzYWdlcy5TVUNDRVNTLFxyXG4vLyAgICAgICAgICAgICBwYXlsb2FkOiByZXNwLnBheWxvYWRcclxuLy8gICAgICAgICB9KVxyXG4vLyAgICAgfSBlbHNlIHtcclxuLy8gICAgICAgICBzZW5kUmVzcG9uc2Uoe1xyXG4vLyAgICAgICAgICAgICBzdGF0dXM6IE1lc3NhZ2VzLkZBSUxVUkVcclxuLy8gICAgICAgICB9KVxyXG4vLyAgICAgfVxyXG4vLyB9XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==