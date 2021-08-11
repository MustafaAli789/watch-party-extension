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
    Messages[Messages["TOBG_USER_CONNECTED"] = 11] = "TOBG_USER_CONNECTED";
    Messages[Messages["TOFG_IS_CHANNEL_OPEN"] = 12] = "TOFG_IS_CHANNEL_OPEN";
    Messages[Messages["TOBG_USER_DISCONNECTED"] = 13] = "TOBG_USER_DISCONNECTED";
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
                        chrome.scripting.executeScript({
                            target: { tabId: tabId },
                            files: ["./foreground.js"]
                        });
                    });
                });
            }).catch(err => console.log(err));
        }
        else if (event === "onUpdated") { //i.e url changes but script continues to exist (ex: on youtube)
            setTimeout(() => {
                chrome.runtime.sendMessage({ message: constants_1.Messages.TOPOPUP_LEAVE_ROOM, payload: { tabId: tabId } });
            }, 1000);
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
    // if (request.message === Messages.TOBG_USER_CONNECTED) {
    //     chrome.notifications.create(sender.id, {type:'basic', title: 'User Joined', message: request.payload.message, iconUrl:"../images/icon-16x16.png"})
    // } else if (request.message === Messages.TOBG_USER_DISCONNECTED) {
    //     chrome.notifications.create(sender.id, {type:'basic', title: 'User Left', message: request.payload.message, iconUrl:"../images/icon-16x16.png"})
    // }
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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YWNrOi8vZXh0ZW50c2lvbi8uL21vZGVscy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leHRlbnRzaW9uLy4vYmFja2dyb3VuZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBQYWdle1xyXG4gICAgU1RBUlQsXHJcbiAgICBNQUlOXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIE1lc3NhZ2Vze1xyXG4gICAgU1VDQ0VTUyxcclxuICAgIEZBSUxVUkUsXHJcbiAgICBUT0ZHX1ZJREVPX09OX1NDUkVFTixcclxuICAgIFRPRkdfQ1JFQVRFX1JPT01fSU5fVEFCLFxyXG4gICAgVE9GR19KT0lOX1JPT01fSU5fVEFCLFxyXG4gICAgVE9GR19ESVNDT05ORUNULFxyXG4gICAgVE9GR19SRVRSSUVWRV9ST09NX0RBVEEsXHJcbiAgICBUT0ZHX0RPX1lPVV9FWElTVCxcclxuICAgIFRPRkdfU1lOQ19WSUQsXHJcbiAgICBUT1BPUFVQX0xFQVZFX1JPT00sXHJcbiAgICBUT1BPUFVQX1JPT01fREFUQSxcclxuICAgIFRPQkdfVVNFUl9DT05ORUNURUQsXHJcbiAgICBUT0ZHX0lTX0NIQU5ORUxfT1BFTixcclxuICAgIFRPQkdfVVNFUl9ESVNDT05ORUNURURcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFRhYnNTdG9yYWdlID0gXCJhY3RpdmVfdGFic193YXRjaHBhcnR5XCJcclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IE1lc3NhZ2VzIH0gZnJvbSAnLi9tb2RlbHMvY29uc3RhbnRzJ1xyXG5pbXBvcnQgeyBNZXNzYWdlT2JqZWN0LCBSZXNwb25zZU9iamVjdCB9IGZyb20gJy4vbW9kZWxzL21lc3NhZ2VwYXNzaW5nJ1xyXG5pbXBvcnQgeyBUb0ZnU2VuZGVyVGFiSWRQYXlsb2FkIH0gZnJvbSAnLi9tb2RlbHMvcGF5bG9hZHMnO1xyXG5cclxuLy8gVXBkYXRlcyBuZWVkZWRcclxuLyoqXHJcbiAqIC0gQWN0dWFsIG5vdGlmcyB3aGVuIHVzZXIgam9pbnMgb3IgbGVhdmVzXHJcbiAqIC0gZnV0dXJlIGZlYXR1cmU6IGNoYXQgYm94XHJcbiAqL1xyXG5cclxuY2hyb21lLnJ1bnRpbWUub25JbnN0YWxsZWQuYWRkTGlzdGVuZXIoKCkgPT4ge1xyXG4gICAgLy8gZGVmYXVsdCBzdGF0ZSBnb2VzIGhlcmVcclxuICAgIC8vIHRoaXMgcnVucyBPTkUgVElNRSBPTkxZICh1bmxlc3MgdGhlIHVzZXIgcmVpbnN0YWxscyB5b3VyIGV4dGVuc2lvbilcclxufSk7XHJcblxyXG5jb25zdCB0YWJDaGFuZ2UgPSAodGFiSWQ6IG51bWJlciwgZXZlbnQ6IHN0cmluZykgPT4ge1xyXG4gICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiSWQsIHsgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19ET19ZT1VfRVhJU1QgfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8Ym9vbGVhbj4pID0+IHtcclxuICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBET0VTTlQgRVhJU1QgQ0FOIElOSkVDVCBOT1dcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJJTkpFQ1RJTkcgRk9SRUdST1VORCBXSVRIIFRBQklEOiBcIiArIHRhYklkKVxyXG4gICAgICAgICAgICBjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWJJZCB9LFxyXG4gICAgICAgICAgICAgICAgZmlsZXM6IFtcIi4vc29ja2V0aW8vc29ja2V0LmlvLmpzXCJdXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWJJZCB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzOiBbXCIuL2Jvb3RzdHJhcC9qcy9ib290c3RyYXAubWluLmpzXCJdXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNocm9tZS5zY3JpcHRpbmcuaW5zZXJ0Q1NTKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7dGFiSWQ6IHRhYklkfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IFtcIi4vYm9vdHN0cmFwL2Nzcy9ib290c3RyYXAubWluLmNzc1wiXVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWJJZCB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IFtcIi4vZm9yZWdyb3VuZC5qc1wiXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSk7XHJcbiAgICAgICAgfSBlbHNlIGlmKGV2ZW50ID09PSBcIm9uVXBkYXRlZFwiKSB7IC8vaS5lIHVybCBjaGFuZ2VzIGJ1dCBzY3JpcHQgY29udGludWVzIHRvIGV4aXN0IChleDogb24geW91dHViZSlcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7IG1lc3NhZ2U6IE1lc3NhZ2VzLlRPUE9QVVBfTEVBVkVfUk9PTSwgcGF5bG9hZDogeyB0YWJJZDogdGFiSWQgfSB9IGFzIE1lc3NhZ2VPYmplY3Q8VG9GZ1NlbmRlclRhYklkUGF5bG9hZD4pXHJcbiAgICAgICAgICAgIH0sIDEwMDApXHJcbiAgICAgICAgfVxyXG4gICAgfSkgICAgICAgICAgICAgICAgXHJcbn1cclxuXHJcbi8vZ29uZSB1c2UgdGhpcyBvbmUgZm9yIGNoYW5naW5nIHRoZSB0YWIgYi93IGV4aXN0aW5nIHRhYnMgKGluY2x1ZGVzIHdoZW4gdSBhIGNsb3NlIGEgdGFiIGFuZCB1IGF1dG8gZ28gdG8gYW5vdGhlciB0YWIpXHJcbi8vdGVjaG5pY2FsbHkgdGhpcyBvbmUgaXMgZmlyZWQgd2hlbiBjcmVhdGluZyBhIG5ldyB0YWIgdG9vIGJ1dCBpdHMga2luZGEgdXNlbGVzcyBzaW5jZSB0aGUgdXJsIGlzbnQgcmVhZHkgYXQgdGhpcyBwb2ludCBzbyBjYW50IGluamVjdCBzY3JpcHQgeWV0XHJcbmNocm9tZS50YWJzLm9uQWN0aXZhdGVkLmFkZExpc3RlbmVyKGFjdGl2ZVRhYkluZm8gPT4ge1xyXG4gICAgY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZX0sIHRhYnMgPT4ge1xyXG4gICAgICAgIGlmICgvXmh0dHAvLnRlc3QodGFic1swXS51cmwpKSB7XHJcbiAgICAgICAgICAgIHRhYkNoYW5nZShhY3RpdmVUYWJJbmZvLnRhYklkLCBcIm9uQWN0aXZhdGVkXCIpO1xyXG4gICAgICAgIH1cclxuICAgfSlcclxufSlcclxuXHJcblxyXG4vL2dvbm5hIHVzZSB0aGlzIG9uZSBmb3Igd2hlbiB1IGNyZWF0ZSBhIG5ldyB0YWIsIG9yIHdoZW4geW91IGNoYW5nZSB0aGUgdXJsIG9mIHRoZSBjdXIgdGFiIHVyIG9uXHJcbmNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcigodGFiSWQsIGNoYW5nZUluZm8sIHRhYikgPT4ge1xyXG4gICAgaWYgKGNoYW5nZUluZm8uc3RhdHVzID09ICdjb21wbGV0ZScgJiYgL15odHRwLy50ZXN0KHRhYi51cmwpKSB7XHJcbiAgICAgICAgdGFiQ2hhbmdlKHRhYklkLCBcIm9uVXBkYXRlZFwiKTtcclxuICAgIH1cclxufSk7XHJcblxyXG4vLyBNZXNzYWdlIGhhbmRsZXJcclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0OiBNZXNzYWdlT2JqZWN0PGFueT4sIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgICAvLyBpZiAocmVxdWVzdC5tZXNzYWdlID09PSBNZXNzYWdlcy5UT0JHX1VTRVJfQ09OTkVDVEVEKSB7XHJcbiAgICAvLyAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHNlbmRlci5pZCwge3R5cGU6J2Jhc2ljJywgdGl0bGU6ICdVc2VyIEpvaW5lZCcsIG1lc3NhZ2U6IHJlcXVlc3QucGF5bG9hZC5tZXNzYWdlLCBpY29uVXJsOlwiLi4vaW1hZ2VzL2ljb24tMTZ4MTYucG5nXCJ9KVxyXG4gICAgLy8gfSBlbHNlIGlmIChyZXF1ZXN0Lm1lc3NhZ2UgPT09IE1lc3NhZ2VzLlRPQkdfVVNFUl9ESVNDT05ORUNURUQpIHtcclxuICAgIC8vICAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoc2VuZGVyLmlkLCB7dHlwZTonYmFzaWMnLCB0aXRsZTogJ1VzZXIgTGVmdCcsIG1lc3NhZ2U6IHJlcXVlc3QucGF5bG9hZC5tZXNzYWdlLCBpY29uVXJsOlwiLi4vaW1hZ2VzL2ljb24tMTZ4MTYucG5nXCJ9KVxyXG4gICAgLy8gfVxyXG59KTtcclxuXHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==