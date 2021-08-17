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
    Messages[Messages["TOBG_OPEN_IMG_IN_TAB"] = 14] = "TOBG_OPEN_IMG_IN_TAB";
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
    if (request.message === constants_1.Messages.TOBG_OPEN_IMG_IN_TAB) {
        chrome.tabs.create({
            active: true,
            url: request.payload
        });
    }
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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S0FBSyxvQkFBUSxDQUFDLG9CQUFvQixFQUFFO1FBQ25ELE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ2YsTUFBTSxFQUFDLElBQUk7WUFDWCxHQUFHLEVBQUUsT0FBTyxDQUFDLE9BQU87U0FDdkIsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leHRlbnRzaW9uLy4vbW9kZWxzL2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly9leHRlbnRzaW9uL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4dGVudHNpb24vLi9iYWNrZ3JvdW5kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBlbnVtIFBhZ2V7XHJcbiAgICBTVEFSVCxcclxuICAgIE1BSU5cclxufVxyXG5cclxuZXhwb3J0IGVudW0gTWVzc2FnZXN7XHJcbiAgICBTVUNDRVNTLFxyXG4gICAgRkFJTFVSRSxcclxuICAgIFRPRkdfVklERU9fT05fU0NSRUVOLFxyXG4gICAgVE9GR19DUkVBVEVfUk9PTV9JTl9UQUIsXHJcbiAgICBUT0ZHX0pPSU5fUk9PTV9JTl9UQUIsXHJcbiAgICBUT0ZHX0RJU0NPTk5FQ1QsXHJcbiAgICBUT0ZHX1JFVFJJRVZFX1JPT01fREFUQSxcclxuICAgIFRPRkdfRE9fWU9VX0VYSVNULFxyXG4gICAgVE9GR19TWU5DX1ZJRCxcclxuICAgIFRPUE9QVVBfTEVBVkVfUk9PTSxcclxuICAgIFRPUE9QVVBfUk9PTV9EQVRBLFxyXG4gICAgVE9GR19JU19DSEFOTkVMX09QRU4sXHJcbiAgICBUT0ZHX0NIQVRfVE9HR0xFLFxyXG4gICAgVE9GR19TRVRfT0ZGU0VULFxyXG4gICAgVE9CR19PUEVOX0lNR19JTl9UQUJcclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgTWVzc2FnZXMgfSBmcm9tICcuL21vZGVscy9jb25zdGFudHMnXHJcbmltcG9ydCB7IE1lc3NhZ2VPYmplY3QsIFJlc3BvbnNlT2JqZWN0IH0gZnJvbSAnLi9tb2RlbHMvbWVzc2FnZXBhc3NpbmcnXHJcblxyXG4vLyBVcGRhdGVzIG5lZWRlZFxyXG4vKipcclxuICogLSBBY3R1YWwgbm90aWZzIHdoZW4gdXNlciBqb2lucyBvciBsZWF2ZXNcclxuICogLSBmdXR1cmUgZmVhdHVyZTogY2hhdCBib3hcclxuICovXHJcblxyXG5jaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcigoKSA9PiB7XHJcbiAgICAvLyBkZWZhdWx0IHN0YXRlIGdvZXMgaGVyZVxyXG4gICAgLy8gdGhpcyBydW5zIE9ORSBUSU1FIE9OTFkgKHVubGVzcyB0aGUgdXNlciByZWluc3RhbGxzIHlvdXIgZXh0ZW5zaW9uKVxyXG59KTtcclxuXHJcbmNvbnN0IHRhYkNoYW5nZSA9ICh0YWJJZDogbnVtYmVyLCBldmVudDogc3RyaW5nKSA9PiB7XHJcbiAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwgeyBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0RPX1lPVV9FWElTVCB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIChyZXNwOiBSZXNwb25zZU9iamVjdDxib29sZWFuPikgPT4ge1xyXG4gICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIERPRVNOVCBFWElTVCBDQU4gSU5KRUNUIE5PV1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIklOSkVDVElORyBGT1JFR1JPVU5EIFdJVEggVEFCSUQ6IFwiICsgdGFiSWQpXHJcbiAgICAgICAgICAgIGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdCh7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQ6IHRhYklkIH0sXHJcbiAgICAgICAgICAgICAgICBmaWxlczogW1wiLi9zb2NrZXRpby9zb2NrZXQuaW8uanNcIl1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2hyb21lLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQ6IHRhYklkIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZXM6IFtcIi4vYm9vdHN0cmFwL2pzL2Jvb3RzdHJhcC5taW4uanNcIl1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hyb21lLnNjcmlwdGluZy5pbnNlcnRDU1Moe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHt0YWJJZDogdGFiSWR9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogW1wiLi9ib290c3RyYXAvY3NzL2Jvb3RzdHJhcC5taW4uY3NzXCJdXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNocm9tZS5zY3JpcHRpbmcuaW5zZXJ0Q1NTKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDoge3RhYklkOiB0YWJJZH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogW1wiLi9jc3MvZm9yZWdyb3VuZC5jc3NcIl1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hyb21lLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQ6IHRhYklkIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IFtcIi4vZm9yZWdyb3VuZC5qc1wiXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xyXG4gICAgICAgIH0gZWxzZSBpZihldmVudCA9PT0gXCJvblVwZGF0ZWRcIikgeyAvL2kuZSB1cmwgY2hhbmdlcyBidXQgc2NyaXB0IGNvbnRpbnVlcyB0byBleGlzdCAoZXg6IG9uIHlvdXR1YmUpXHJcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCB7IG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfRElTQ09OTkVDVH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPilcclxuICAgICAgICB9XHJcbiAgICB9KSAgICAgICAgICAgICAgICBcclxufVxyXG5cclxuLy9nb25lIHVzZSB0aGlzIG9uZSBmb3IgY2hhbmdpbmcgdGhlIHRhYiBiL3cgZXhpc3RpbmcgdGFicyAoaW5jbHVkZXMgd2hlbiB1IGEgY2xvc2UgYSB0YWIgYW5kIHUgYXV0byBnbyB0byBhbm90aGVyIHRhYilcclxuLy90ZWNobmljYWxseSB0aGlzIG9uZSBpcyBmaXJlZCB3aGVuIGNyZWF0aW5nIGEgbmV3IHRhYiB0b28gYnV0IGl0cyBraW5kYSB1c2VsZXNzIHNpbmNlIHRoZSB1cmwgaXNudCByZWFkeSBhdCB0aGlzIHBvaW50IHNvIGNhbnQgaW5qZWN0IHNjcmlwdCB5ZXRcclxuY2hyb21lLnRhYnMub25BY3RpdmF0ZWQuYWRkTGlzdGVuZXIoYWN0aXZlVGFiSW5mbyA9PiB7XHJcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlfSwgdGFicyA9PiB7XHJcbiAgICAgICAgaWYgKC9eaHR0cC8udGVzdCh0YWJzWzBdLnVybCkpIHtcclxuICAgICAgICAgICAgdGFiQ2hhbmdlKGFjdGl2ZVRhYkluZm8udGFiSWQsIFwib25BY3RpdmF0ZWRcIik7XHJcbiAgICAgICAgfVxyXG4gICB9KVxyXG59KVxyXG5cclxuXHJcbi8vZ29ubmEgdXNlIHRoaXMgb25lIGZvciB3aGVuIHUgY3JlYXRlIGEgbmV3IHRhYiwgb3Igd2hlbiB5b3UgY2hhbmdlIHRoZSB1cmwgb2YgdGhlIGN1ciB0YWIgdXIgb25cclxuY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKCh0YWJJZCwgY2hhbmdlSW5mbywgdGFiKSA9PiB7XHJcbiAgICBpZiAoY2hhbmdlSW5mby5zdGF0dXMgPT0gJ2NvbXBsZXRlJyAmJiAvXmh0dHAvLnRlc3QodGFiLnVybCkpIHtcclxuICAgICAgICB0YWJDaGFuZ2UodGFiSWQsIFwib25VcGRhdGVkXCIpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbi8vIE1lc3NhZ2UgaGFuZGxlclxyXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKHJlcXVlc3Q6IE1lc3NhZ2VPYmplY3Q8YW55Piwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICAgIGlmIChyZXF1ZXN0Lm1lc3NhZ2UgPT09IE1lc3NhZ2VzLlRPQkdfT1BFTl9JTUdfSU5fVEFCKSB7XHJcbiAgICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHtcclxuICAgICAgICAgICAgYWN0aXZlOnRydWUsXHJcbiAgICAgICAgICAgIHVybDogcmVxdWVzdC5wYXlsb2FkXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufSk7XHJcblxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=