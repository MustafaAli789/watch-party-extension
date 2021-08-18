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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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S0FBSyxvQkFBUSxDQUFDLHNCQUFzQixFQUFFO1FBQ3JELE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ2YsTUFBTSxFQUFDLElBQUk7WUFDWCxHQUFHLEVBQUUsT0FBTyxDQUFDLE9BQU87U0FDdkIsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leHRlbnRzaW9uLy4vbW9kZWxzL2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly9leHRlbnRzaW9uL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4dGVudHNpb24vLi9iYWNrZ3JvdW5kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBlbnVtIFBhZ2V7XHJcbiAgICBTVEFSVCxcclxuICAgIE1BSU5cclxufVxyXG5cclxuZXhwb3J0IGVudW0gTWVzc2FnZXN7XHJcbiAgICBTVUNDRVNTLFxyXG4gICAgRkFJTFVSRSxcclxuICAgIFRPRkdfVklERU9fT05fU0NSRUVOLFxyXG4gICAgVE9GR19DUkVBVEVfUk9PTV9JTl9UQUIsXHJcbiAgICBUT0ZHX0pPSU5fUk9PTV9JTl9UQUIsXHJcbiAgICBUT0ZHX0RJU0NPTk5FQ1QsXHJcbiAgICBUT0ZHX1JFVFJJRVZFX1JPT01fREFUQSxcclxuICAgIFRPRkdfRE9fWU9VX0VYSVNULFxyXG4gICAgVE9GR19TWU5DX1ZJRCxcclxuICAgIFRPUE9QVVBfTEVBVkVfUk9PTSxcclxuICAgIFRPUE9QVVBfUk9PTV9EQVRBLFxyXG4gICAgVE9GR19JU19DSEFOTkVMX09QRU4sXHJcbiAgICBUT0ZHX0NIQVRfVE9HR0xFLFxyXG4gICAgVE9GR19TRVRfT0ZGU0VULFxyXG4gICAgVE9CR19PUEVOX1RBQl9XSVRIX1VSTFxyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJpbXBvcnQgeyBNZXNzYWdlcyB9IGZyb20gJy4vbW9kZWxzL2NvbnN0YW50cydcclxuaW1wb3J0IHsgTWVzc2FnZU9iamVjdCwgUmVzcG9uc2VPYmplY3QgfSBmcm9tICcuL21vZGVscy9tZXNzYWdlcGFzc2luZydcclxuXHJcbi8vIFVwZGF0ZXMgbmVlZGVkXHJcbi8qKlxyXG4gKiAtIEFjdHVhbCBub3RpZnMgd2hlbiB1c2VyIGpvaW5zIG9yIGxlYXZlc1xyXG4gKiAtIGZ1dHVyZSBmZWF0dXJlOiBjaGF0IGJveFxyXG4gKi9cclxuXHJcbmNocm9tZS5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKCgpID0+IHtcclxuICAgIC8vIGRlZmF1bHQgc3RhdGUgZ29lcyBoZXJlXHJcbiAgICAvLyB0aGlzIHJ1bnMgT05FIFRJTUUgT05MWSAodW5sZXNzIHRoZSB1c2VyIHJlaW5zdGFsbHMgeW91ciBleHRlbnNpb24pXHJcbn0pO1xyXG5cclxuY29uc3QgdGFiQ2hhbmdlID0gKHRhYklkOiBudW1iZXIsIGV2ZW50OiBzdHJpbmcpID0+IHtcclxuICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCB7IG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfRE9fWU9VX0VYSVNUIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPiwgKHJlc3A6IFJlc3BvbnNlT2JqZWN0PGJvb2xlYW4+KSA9PiB7XHJcbiAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xyXG5cclxuICAgICAgICAgICAgLy8gRE9FU05UIEVYSVNUIENBTiBJTkpFQ1QgTk9XXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSU5KRUNUSU5HIEZPUkVHUk9VTkQgV0lUSCBUQUJJRDogXCIgKyB0YWJJZClcclxuICAgICAgICAgICAgY2hyb21lLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcclxuICAgICAgICAgICAgICAgIHRhcmdldDogeyB0YWJJZDogdGFiSWQgfSxcclxuICAgICAgICAgICAgICAgIGZpbGVzOiBbXCIuL3NvY2tldGlvL3NvY2tldC5pby5qc1wiXVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogeyB0YWJJZDogdGFiSWQgfSxcclxuICAgICAgICAgICAgICAgICAgICBmaWxlczogW1wiLi9ib290c3RyYXAvanMvYm9vdHN0cmFwLm1pbi5qc1wiXVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjaHJvbWUuc2NyaXB0aW5nLmluc2VydENTUyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDoge3RhYklkOiB0YWJJZH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBbXCIuL2Jvb3RzdHJhcC9jc3MvYm9vdHN0cmFwLm1pbi5jc3NcIl1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hyb21lLnNjcmlwdGluZy5pbnNlcnRDU1Moe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7dGFiSWQ6IHRhYklkfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBbXCIuL2Nzcy9mb3JlZ3JvdW5kLmNzc1wiXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDogeyB0YWJJZDogdGFiSWQgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogW1wiLi9mb3JlZ3JvdW5kLmpzXCJdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSk7XHJcbiAgICAgICAgfSBlbHNlIGlmKGV2ZW50ID09PSBcIm9uVXBkYXRlZFwiKSB7IC8vaS5lIHVybCBjaGFuZ2VzIGJ1dCBzY3JpcHQgY29udGludWVzIHRvIGV4aXN0IChleDogb24geW91dHViZSlcclxuICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiSWQsIHsgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19ESVNDT05ORUNUfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+KVxyXG4gICAgICAgIH1cclxuICAgIH0pICAgICAgICAgICAgICAgIFxyXG59XHJcblxyXG4vL2dvbmUgdXNlIHRoaXMgb25lIGZvciBjaGFuZ2luZyB0aGUgdGFiIGIvdyBleGlzdGluZyB0YWJzIChpbmNsdWRlcyB3aGVuIHUgYSBjbG9zZSBhIHRhYiBhbmQgdSBhdXRvIGdvIHRvIGFub3RoZXIgdGFiKVxyXG4vL3RlY2huaWNhbGx5IHRoaXMgb25lIGlzIGZpcmVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgdGFiIHRvbyBidXQgaXRzIGtpbmRhIHVzZWxlc3Mgc2luY2UgdGhlIHVybCBpc250IHJlYWR5IGF0IHRoaXMgcG9pbnQgc28gY2FudCBpbmplY3Qgc2NyaXB0IHlldFxyXG5jaHJvbWUudGFicy5vbkFjdGl2YXRlZC5hZGRMaXN0ZW5lcihhY3RpdmVUYWJJbmZvID0+IHtcclxuICAgIGNocm9tZS50YWJzLnF1ZXJ5KHthY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICBpZiAoL15odHRwLy50ZXN0KHRhYnNbMF0udXJsKSkge1xyXG4gICAgICAgICAgICB0YWJDaGFuZ2UoYWN0aXZlVGFiSW5mby50YWJJZCwgXCJvbkFjdGl2YXRlZFwiKTtcclxuICAgICAgICB9XHJcbiAgIH0pXHJcbn0pXHJcblxyXG5cclxuLy9nb25uYSB1c2UgdGhpcyBvbmUgZm9yIHdoZW4gdSBjcmVhdGUgYSBuZXcgdGFiLCBvciB3aGVuIHlvdSBjaGFuZ2UgdGhlIHVybCBvZiB0aGUgY3VyIHRhYiB1ciBvblxyXG5jaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoKHRhYklkLCBjaGFuZ2VJbmZvLCB0YWIpID0+IHtcclxuICAgIGlmIChjaGFuZ2VJbmZvLnN0YXR1cyA9PSAnY29tcGxldGUnICYmIC9eaHR0cC8udGVzdCh0YWIudXJsKSkge1xyXG4gICAgICAgIHRhYkNoYW5nZSh0YWJJZCwgXCJvblVwZGF0ZWRcIik7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuLy8gTWVzc2FnZSBoYW5kbGVyXHJcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigocmVxdWVzdDogTWVzc2FnZU9iamVjdDxhbnk+LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gICAgaWYgKHJlcXVlc3QubWVzc2FnZSA9PT0gTWVzc2FnZXMuVE9CR19PUEVOX1RBQl9XSVRIX1VSTCkge1xyXG4gICAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgIGFjdGl2ZTp0cnVlLFxyXG4gICAgICAgICAgICB1cmw6IHJlcXVlc3QucGF5bG9hZFxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn0pO1xyXG5cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9