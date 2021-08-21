/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./models/constants.ts":
/*!*****************************!*\
  !*** ./models/constants.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Messages = exports.Page = void 0;
var Page;
(function (Page) {
    Page[Page["START"] = 0] = "START";
    Page[Page["MAIN"] = 1] = "MAIN";
})(Page = exports.Page || (exports.Page = {}));
var Messages;
(function (Messages) {
    Messages[Messages["SUCCESS"] = 0] = "SUCCESS";
    Messages[Messages["FAILURE"] = 1] = "FAILURE";
    Messages[Messages["TOFG_VIDEO_ON_SCREEN"] = 2] = "TOFG_VIDEO_ON_SCREEN";
    Messages[Messages["TOFG_CREATE_ROOM_IN_TAB"] = 3] = "TOFG_CREATE_ROOM_IN_TAB";
    Messages[Messages["TOFG_JOIN_ROOM_IN_TAB"] = 4] = "TOFG_JOIN_ROOM_IN_TAB";
    Messages[Messages["TOFG_DISCONNECT"] = 5] = "TOFG_DISCONNECT";
    Messages[Messages["TOFG_RETRIEVE_ROOM_DATA"] = 6] = "TOFG_RETRIEVE_ROOM_DATA";
    Messages[Messages["TOFG_DO_YOU_EXIST"] = 7] = "TOFG_DO_YOU_EXIST";
    Messages[Messages["TOFG_SYNC_VID"] = 8] = "TOFG_SYNC_VID";
    Messages[Messages["TOPOPUP_LEAVE_ROOM"] = 9] = "TOPOPUP_LEAVE_ROOM";
    Messages[Messages["TOPOPUP_ROOM_DATA"] = 10] = "TOPOPUP_ROOM_DATA";
    Messages[Messages["TOFG_IS_CHANNEL_OPEN"] = 11] = "TOFG_IS_CHANNEL_OPEN";
    Messages[Messages["TOFG_CHAT_TOGGLE"] = 12] = "TOFG_CHAT_TOGGLE";
    Messages[Messages["TOFG_SET_OFFSET"] = 13] = "TOFG_SET_OFFSET";
    Messages[Messages["TOBG_OPEN_TAB_WITH_URL"] = 14] = "TOBG_OPEN_TAB_WITH_URL";
    Messages[Messages["TOFG_GET_ADMIN_VID_TIME"] = 15] = "TOFG_GET_ADMIN_VID_TIME";
    Messages[Messages["TOPOPUP_ADMIN_VID_TIME_INFO"] = 16] = "TOPOPUP_ADMIN_VID_TIME_INFO";
})(Messages = exports.Messages || (exports.Messages = {}));


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
// Updates needed
/**
 * - Actual notifs when user joins or leaves
 * - future feature: chat box
 */
chrome.runtime.onInstalled.addListener(() => {
    // default state goes here
    // this runs ONE TIME ONLY (unless the user reinstalls your extension)
});
const tabChange = (tabId, event) => {
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
                    files: ["./bootstrap/js/bootstrap.min.js"]
                })
                    .then(() => {
                    chrome.scripting.insertCSS({
                        target: { tabId: tabId },
                        files: ["./bootstrap/css/bootstrap.min.css"]
                    })
                        .then(() => {
                        chrome.scripting.insertCSS({
                            target: { tabId: tabId },
                            files: ["./css/foreground.css"]
                        })
                            .then(() => {
                            chrome.scripting.executeScript({
                                target: { tabId: tabId },
                                files: ["./foreground.js"]
                            });
                        });
                    });
                });
            }).catch(err => console.log(err));
        }
        else if (event === "onUpdated") { //i.e url changes but script continues to exist (ex: on youtube)
            chrome.tabs.sendMessage(tabId, { message: constants_1.Messages.TOFG_DISCONNECT });
        }
    });
};
//gone use this one for changing the tab b/w existing tabs (includes when u a close a tab and u auto go to another tab)
//technically this one is fired when creating a new tab too but its kinda useless since the url isnt ready at this point so cant inject script yet
chrome.tabs.onActivated.addListener(activeTabInfo => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (/^http/.test(tabs[0].url)) {
            tabChange(activeTabInfo.tabId, "onActivated");
        }
    });
});
//gonna use this one for when u create a new tab, or when you change the url of the cur tab ur on
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status == 'complete' && /^http/.test(tab.url)) {
        tabChange(tabId, "onUpdated");
    }
});
// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === constants_1.Messages.TOBG_OPEN_TAB_WITH_URL) {
        chrome.tabs.create({
            active: true,
            url: request.payload
        });
    }
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SUFDdkYsSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLG9CQUFRLENBQUMsc0JBQXNCLEVBQUU7UUFDckQsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDZixNQUFNLEVBQUMsSUFBSTtZQUNYLEdBQUcsRUFBRSxPQUFPLENBQUMsT0FBTztTQUN2QixDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2V4dGVudHNpb24vLi9tb2RlbHMvY29uc3RhbnRzLnRzIiwid2VicGFjazovL2V4dGVudHNpb24vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi8uL2JhY2tncm91bmQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGVudW0gUGFnZXtcclxuICAgIFNUQVJULFxyXG4gICAgTUFJTlxyXG59XHJcblxyXG5leHBvcnQgZW51bSBNZXNzYWdlc3tcclxuICAgIFNVQ0NFU1MsXHJcbiAgICBGQUlMVVJFLFxyXG4gICAgVE9GR19WSURFT19PTl9TQ1JFRU4sXHJcbiAgICBUT0ZHX0NSRUFURV9ST09NX0lOX1RBQixcclxuICAgIFRPRkdfSk9JTl9ST09NX0lOX1RBQixcclxuICAgIFRPRkdfRElTQ09OTkVDVCxcclxuICAgIFRPRkdfUkVUUklFVkVfUk9PTV9EQVRBLFxyXG4gICAgVE9GR19ET19ZT1VfRVhJU1QsXHJcbiAgICBUT0ZHX1NZTkNfVklELFxyXG4gICAgVE9QT1BVUF9MRUFWRV9ST09NLFxyXG4gICAgVE9QT1BVUF9ST09NX0RBVEEsXHJcbiAgICBUT0ZHX0lTX0NIQU5ORUxfT1BFTixcclxuICAgIFRPRkdfQ0hBVF9UT0dHTEUsXHJcbiAgICBUT0ZHX1NFVF9PRkZTRVQsXHJcbiAgICBUT0JHX09QRU5fVEFCX1dJVEhfVVJMLFxyXG4gICAgVE9GR19HRVRfQURNSU5fVklEX1RJTUUsXHJcbiAgICBUT1BPUFVQX0FETUlOX1ZJRF9USU1FX0lORk9cclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgTWVzc2FnZXMgfSBmcm9tICcuL21vZGVscy9jb25zdGFudHMnXHJcbmltcG9ydCB7IE1lc3NhZ2VPYmplY3QsIFJlc3BvbnNlT2JqZWN0IH0gZnJvbSAnLi9tb2RlbHMvbWVzc2FnZXBhc3NpbmcnXHJcblxyXG4vLyBVcGRhdGVzIG5lZWRlZFxyXG4vKipcclxuICogLSBBY3R1YWwgbm90aWZzIHdoZW4gdXNlciBqb2lucyBvciBsZWF2ZXNcclxuICogLSBmdXR1cmUgZmVhdHVyZTogY2hhdCBib3hcclxuICovXHJcblxyXG5jaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcigoKSA9PiB7XHJcbiAgICAvLyBkZWZhdWx0IHN0YXRlIGdvZXMgaGVyZVxyXG4gICAgLy8gdGhpcyBydW5zIE9ORSBUSU1FIE9OTFkgKHVubGVzcyB0aGUgdXNlciByZWluc3RhbGxzIHlvdXIgZXh0ZW5zaW9uKVxyXG59KTtcclxuXHJcbmNvbnN0IHRhYkNoYW5nZSA9ICh0YWJJZDogbnVtYmVyLCBldmVudDogc3RyaW5nKSA9PiB7XHJcbiAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwgeyBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0RPX1lPVV9FWElTVCB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIChyZXNwOiBSZXNwb25zZU9iamVjdDxib29sZWFuPikgPT4ge1xyXG4gICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIERPRVNOVCBFWElTVCBDQU4gSU5KRUNUIE5PV1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIklOSkVDVElORyBGT1JFR1JPVU5EIFdJVEggVEFCSUQ6IFwiICsgdGFiSWQpXHJcbiAgICAgICAgICAgIGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdCh7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQ6IHRhYklkIH0sXHJcbiAgICAgICAgICAgICAgICBmaWxlczogW1wiLi9zb2NrZXRpby9zb2NrZXQuaW8uanNcIl1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2hyb21lLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQ6IHRhYklkIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZXM6IFtcIi4vYm9vdHN0cmFwL2pzL2Jvb3RzdHJhcC5taW4uanNcIl1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hyb21lLnNjcmlwdGluZy5pbnNlcnRDU1Moe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHt0YWJJZDogdGFiSWR9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogW1wiLi9ib290c3RyYXAvY3NzL2Jvb3RzdHJhcC5taW4uY3NzXCJdXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNocm9tZS5zY3JpcHRpbmcuaW5zZXJ0Q1NTKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDoge3RhYklkOiB0YWJJZH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogW1wiLi9jc3MvZm9yZWdyb3VuZC5jc3NcIl1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hyb21lLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQ6IHRhYklkIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IFtcIi4vZm9yZWdyb3VuZC5qc1wiXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xyXG4gICAgICAgIH0gZWxzZSBpZihldmVudCA9PT0gXCJvblVwZGF0ZWRcIikgeyAvL2kuZSB1cmwgY2hhbmdlcyBidXQgc2NyaXB0IGNvbnRpbnVlcyB0byBleGlzdCAoZXg6IG9uIHlvdXR1YmUpXHJcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCB7IG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfRElTQ09OTkVDVH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPilcclxuICAgICAgICB9XHJcbiAgICB9KSAgICAgICAgICAgICAgICBcclxufVxyXG5cclxuLy9nb25lIHVzZSB0aGlzIG9uZSBmb3IgY2hhbmdpbmcgdGhlIHRhYiBiL3cgZXhpc3RpbmcgdGFicyAoaW5jbHVkZXMgd2hlbiB1IGEgY2xvc2UgYSB0YWIgYW5kIHUgYXV0byBnbyB0byBhbm90aGVyIHRhYilcclxuLy90ZWNobmljYWxseSB0aGlzIG9uZSBpcyBmaXJlZCB3aGVuIGNyZWF0aW5nIGEgbmV3IHRhYiB0b28gYnV0IGl0cyBraW5kYSB1c2VsZXNzIHNpbmNlIHRoZSB1cmwgaXNudCByZWFkeSBhdCB0aGlzIHBvaW50IHNvIGNhbnQgaW5qZWN0IHNjcmlwdCB5ZXRcclxuY2hyb21lLnRhYnMub25BY3RpdmF0ZWQuYWRkTGlzdGVuZXIoYWN0aXZlVGFiSW5mbyA9PiB7XHJcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlfSwgdGFicyA9PiB7XHJcbiAgICAgICAgaWYgKC9eaHR0cC8udGVzdCh0YWJzWzBdLnVybCkpIHtcclxuICAgICAgICAgICAgdGFiQ2hhbmdlKGFjdGl2ZVRhYkluZm8udGFiSWQsIFwib25BY3RpdmF0ZWRcIik7XHJcbiAgICAgICAgfVxyXG4gICB9KVxyXG59KVxyXG5cclxuXHJcbi8vZ29ubmEgdXNlIHRoaXMgb25lIGZvciB3aGVuIHUgY3JlYXRlIGEgbmV3IHRhYiwgb3Igd2hlbiB5b3UgY2hhbmdlIHRoZSB1cmwgb2YgdGhlIGN1ciB0YWIgdXIgb25cclxuY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKCh0YWJJZCwgY2hhbmdlSW5mbywgdGFiKSA9PiB7XHJcbiAgICBpZiAoY2hhbmdlSW5mby5zdGF0dXMgPT0gJ2NvbXBsZXRlJyAmJiAvXmh0dHAvLnRlc3QodGFiLnVybCkpIHtcclxuICAgICAgICB0YWJDaGFuZ2UodGFiSWQsIFwib25VcGRhdGVkXCIpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbi8vIE1lc3NhZ2UgaGFuZGxlclxyXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKHJlcXVlc3Q6IE1lc3NhZ2VPYmplY3Q8YW55Piwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICAgIGlmIChyZXF1ZXN0Lm1lc3NhZ2UgPT09IE1lc3NhZ2VzLlRPQkdfT1BFTl9UQUJfV0lUSF9VUkwpIHtcclxuICAgICAgICBjaHJvbWUudGFicy5jcmVhdGUoe1xyXG4gICAgICAgICAgICBhY3RpdmU6dHJ1ZSxcclxuICAgICAgICAgICAgdXJsOiByZXF1ZXN0LnBheWxvYWRcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59KTtcclxuXHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==