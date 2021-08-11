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
    Messages[Messages["TOBG_USER_CONNECTED"] = 11] = "TOBG_USER_CONNECTED";
    Messages[Messages["TOFG_IS_CHANNEL_OPEN"] = 12] = "TOFG_IS_CHANNEL_OPEN";
    Messages[Messages["TOBG_USER_DISCONNECTED"] = 13] = "TOBG_USER_DISCONNECTED";
    Messages[Messages["TOFG_CHAT_TOGGLE"] = 14] = "TOFG_CHAT_TOGGLE";
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
    // if (request.message === Messages.TOBG_USER_CONNECTED) {
    //     chrome.notifications.create(sender.id, {type:'basic', title: 'User Joined', message: request.payload.message, iconUrl:"../images/icon-16x16.png"})
    // } else if (request.message === Messages.TOBG_USER_DISCONNECTED) {
    //     chrome.notifications.create(sender.id, {type:'basic', title: 'User Left', message: request.payload.message, iconUrl:"../images/icon-16x16.png"})
    // }
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SjtJQUN6SixvRUFBb0U7SUFDcEUsdUpBQXVKO0lBQ3ZKLElBQUk7QUFDUixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2V4dGVudHNpb24vLi9tb2RlbHMvY29uc3RhbnRzLnRzIiwid2VicGFjazovL2V4dGVudHNpb24vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi8uL2JhY2tncm91bmQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGVudW0gUGFnZXtcclxuICAgIFNUQVJULFxyXG4gICAgTUFJTlxyXG59XHJcblxyXG5leHBvcnQgZW51bSBNZXNzYWdlc3tcclxuICAgIFNVQ0NFU1MsXHJcbiAgICBGQUlMVVJFLFxyXG4gICAgVE9GR19WSURFT19PTl9TQ1JFRU4sXHJcbiAgICBUT0ZHX0NSRUFURV9ST09NX0lOX1RBQixcclxuICAgIFRPRkdfSk9JTl9ST09NX0lOX1RBQixcclxuICAgIFRPRkdfRElTQ09OTkVDVCxcclxuICAgIFRPRkdfUkVUUklFVkVfUk9PTV9EQVRBLFxyXG4gICAgVE9GR19ET19ZT1VfRVhJU1QsXHJcbiAgICBUT0ZHX1NZTkNfVklELFxyXG4gICAgVE9QT1BVUF9MRUFWRV9ST09NLFxyXG4gICAgVE9QT1BVUF9ST09NX0RBVEEsXHJcbiAgICBUT0JHX1VTRVJfQ09OTkVDVEVELFxyXG4gICAgVE9GR19JU19DSEFOTkVMX09QRU4sXHJcbiAgICBUT0JHX1VTRVJfRElTQ09OTkVDVEVELFxyXG4gICAgVE9GR19DSEFUX1RPR0dMRVxyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJpbXBvcnQgeyBNZXNzYWdlcyB9IGZyb20gJy4vbW9kZWxzL2NvbnN0YW50cydcclxuaW1wb3J0IHsgTWVzc2FnZU9iamVjdCwgUmVzcG9uc2VPYmplY3QgfSBmcm9tICcuL21vZGVscy9tZXNzYWdlcGFzc2luZydcclxuXHJcbi8vIFVwZGF0ZXMgbmVlZGVkXHJcbi8qKlxyXG4gKiAtIEFjdHVhbCBub3RpZnMgd2hlbiB1c2VyIGpvaW5zIG9yIGxlYXZlc1xyXG4gKiAtIGZ1dHVyZSBmZWF0dXJlOiBjaGF0IGJveFxyXG4gKi9cclxuXHJcbmNocm9tZS5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKCgpID0+IHtcclxuICAgIC8vIGRlZmF1bHQgc3RhdGUgZ29lcyBoZXJlXHJcbiAgICAvLyB0aGlzIHJ1bnMgT05FIFRJTUUgT05MWSAodW5sZXNzIHRoZSB1c2VyIHJlaW5zdGFsbHMgeW91ciBleHRlbnNpb24pXHJcbn0pO1xyXG5cclxuY29uc3QgdGFiQ2hhbmdlID0gKHRhYklkOiBudW1iZXIsIGV2ZW50OiBzdHJpbmcpID0+IHtcclxuICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCB7IG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfRE9fWU9VX0VYSVNUIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPiwgKHJlc3A6IFJlc3BvbnNlT2JqZWN0PGJvb2xlYW4+KSA9PiB7XHJcbiAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xyXG5cclxuICAgICAgICAgICAgLy8gRE9FU05UIEVYSVNUIENBTiBJTkpFQ1QgTk9XXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSU5KRUNUSU5HIEZPUkVHUk9VTkQgV0lUSCBUQUJJRDogXCIgKyB0YWJJZClcclxuICAgICAgICAgICAgY2hyb21lLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcclxuICAgICAgICAgICAgICAgIHRhcmdldDogeyB0YWJJZDogdGFiSWQgfSxcclxuICAgICAgICAgICAgICAgIGZpbGVzOiBbXCIuL3NvY2tldGlvL3NvY2tldC5pby5qc1wiXVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogeyB0YWJJZDogdGFiSWQgfSxcclxuICAgICAgICAgICAgICAgICAgICBmaWxlczogW1wiLi9ib290c3RyYXAvanMvYm9vdHN0cmFwLm1pbi5qc1wiXVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjaHJvbWUuc2NyaXB0aW5nLmluc2VydENTUyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDoge3RhYklkOiB0YWJJZH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBbXCIuL2Jvb3RzdHJhcC9jc3MvYm9vdHN0cmFwLm1pbi5jc3NcIl1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hyb21lLnNjcmlwdGluZy5pbnNlcnRDU1Moe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7dGFiSWQ6IHRhYklkfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBbXCIuL2Nzcy9mb3JlZ3JvdW5kLmNzc1wiXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDogeyB0YWJJZDogdGFiSWQgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogW1wiLi9mb3JlZ3JvdW5kLmpzXCJdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSk7XHJcbiAgICAgICAgfSBlbHNlIGlmKGV2ZW50ID09PSBcIm9uVXBkYXRlZFwiKSB7IC8vaS5lIHVybCBjaGFuZ2VzIGJ1dCBzY3JpcHQgY29udGludWVzIHRvIGV4aXN0IChleDogb24geW91dHViZSlcclxuICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiSWQsIHsgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19ESVNDT05ORUNUfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+KVxyXG4gICAgICAgIH1cclxuICAgIH0pICAgICAgICAgICAgICAgIFxyXG59XHJcblxyXG4vL2dvbmUgdXNlIHRoaXMgb25lIGZvciBjaGFuZ2luZyB0aGUgdGFiIGIvdyBleGlzdGluZyB0YWJzIChpbmNsdWRlcyB3aGVuIHUgYSBjbG9zZSBhIHRhYiBhbmQgdSBhdXRvIGdvIHRvIGFub3RoZXIgdGFiKVxyXG4vL3RlY2huaWNhbGx5IHRoaXMgb25lIGlzIGZpcmVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgdGFiIHRvbyBidXQgaXRzIGtpbmRhIHVzZWxlc3Mgc2luY2UgdGhlIHVybCBpc250IHJlYWR5IGF0IHRoaXMgcG9pbnQgc28gY2FudCBpbmplY3Qgc2NyaXB0IHlldFxyXG5jaHJvbWUudGFicy5vbkFjdGl2YXRlZC5hZGRMaXN0ZW5lcihhY3RpdmVUYWJJbmZvID0+IHtcclxuICAgIGNocm9tZS50YWJzLnF1ZXJ5KHthY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICBpZiAoL15odHRwLy50ZXN0KHRhYnNbMF0udXJsKSkge1xyXG4gICAgICAgICAgICB0YWJDaGFuZ2UoYWN0aXZlVGFiSW5mby50YWJJZCwgXCJvbkFjdGl2YXRlZFwiKTtcclxuICAgICAgICB9XHJcbiAgIH0pXHJcbn0pXHJcblxyXG5cclxuLy9nb25uYSB1c2UgdGhpcyBvbmUgZm9yIHdoZW4gdSBjcmVhdGUgYSBuZXcgdGFiLCBvciB3aGVuIHlvdSBjaGFuZ2UgdGhlIHVybCBvZiB0aGUgY3VyIHRhYiB1ciBvblxyXG5jaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoKHRhYklkLCBjaGFuZ2VJbmZvLCB0YWIpID0+IHtcclxuICAgIGlmIChjaGFuZ2VJbmZvLnN0YXR1cyA9PSAnY29tcGxldGUnICYmIC9eaHR0cC8udGVzdCh0YWIudXJsKSkge1xyXG4gICAgICAgIHRhYkNoYW5nZSh0YWJJZCwgXCJvblVwZGF0ZWRcIik7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuLy8gTWVzc2FnZSBoYW5kbGVyXHJcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigocmVxdWVzdDogTWVzc2FnZU9iamVjdDxhbnk+LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gICAgLy8gaWYgKHJlcXVlc3QubWVzc2FnZSA9PT0gTWVzc2FnZXMuVE9CR19VU0VSX0NPTk5FQ1RFRCkge1xyXG4gICAgLy8gICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZShzZW5kZXIuaWQsIHt0eXBlOidiYXNpYycsIHRpdGxlOiAnVXNlciBKb2luZWQnLCBtZXNzYWdlOiByZXF1ZXN0LnBheWxvYWQubWVzc2FnZSwgaWNvblVybDpcIi4uL2ltYWdlcy9pY29uLTE2eDE2LnBuZ1wifSlcclxuICAgIC8vIH0gZWxzZSBpZiAocmVxdWVzdC5tZXNzYWdlID09PSBNZXNzYWdlcy5UT0JHX1VTRVJfRElTQ09OTkVDVEVEKSB7XHJcbiAgICAvLyAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHNlbmRlci5pZCwge3R5cGU6J2Jhc2ljJywgdGl0bGU6ICdVc2VyIExlZnQnLCBtZXNzYWdlOiByZXF1ZXN0LnBheWxvYWQubWVzc2FnZSwgaWNvblVybDpcIi4uL2ltYWdlcy9pY29uLTE2eDE2LnBuZ1wifSlcclxuICAgIC8vIH1cclxufSk7XHJcblxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=