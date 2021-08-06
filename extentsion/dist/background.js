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
    Messages[Messages["TOPOPUP_LEAVE_ROOM"] = 8] = "TOPOPUP_LEAVE_ROOM";
    Messages[Messages["TOPOPUP_ROOM_DATA"] = 9] = "TOPOPUP_ROOM_DATA";
    Messages[Messages["TOPOPUP_USER_CONNECTED"] = 10] = "TOPOPUP_USER_CONNECTED";
    Messages[Messages["TOFG_IS_CHANNEL_OPEN"] = 11] = "TOFG_IS_CHANNEL_OPEN";
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
 * - Color ur user darker
 * - Actual synch functionality
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
                    files: ["./foreground.js"]
                }).then(() => {
                    if (event === "onUpdated") { //i.e url change on existing tab
                        setTimeout(() => {
                            chrome.runtime.sendMessage({ message: constants_1.Messages.TOPOPUP_LEAVE_ROOM });
                        }, 500);
                    }
                });
            }).catch(err => console.log(err));
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
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFHLENBQUMsRUFBRTtZQUMzQixTQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQztTQUNqRDtJQUNOLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQztBQUdGLGlHQUFpRztBQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3pELElBQUksVUFBVSxDQUFDLE1BQU0sSUFBSSxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDMUQsU0FBUyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztLQUNqQztBQUNMLENBQUMsQ0FBQyxDQUFDO0FBRUgsa0JBQWtCO0FBQ2xCLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQTJCLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxFQUFFO0FBQzNGLENBQUMsQ0FBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi8uL21vZGVscy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leHRlbnRzaW9uLy4vYmFja2dyb3VuZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBQYWdle1xyXG4gICAgU1RBUlQsXHJcbiAgICBNQUlOXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIE1lc3NhZ2Vze1xyXG4gICAgU1VDQ0VTUyxcclxuICAgIEZBSUxVUkUsXHJcbiAgICBUT0ZHX1ZJREVPX09OX1NDUkVFTixcclxuICAgIFRPRkdfQ1JFQVRFX1JPT01fSU5fVEFCLFxyXG4gICAgVE9GR19KT0lOX1JPT01fSU5fVEFCLFxyXG4gICAgVE9GR19ESVNDT05ORUNULFxyXG4gICAgVE9GR19SRVRSSUVWRV9ST09NX0RBVEEsXHJcbiAgICBUT0ZHX0RPX1lPVV9FWElTVCxcclxuICAgIFRPUE9QVVBfTEVBVkVfUk9PTSxcclxuICAgIFRPUE9QVVBfUk9PTV9EQVRBLFxyXG4gICAgVE9QT1BVUF9VU0VSX0NPTk5FQ1RFRCxcclxuICAgIFRPRkdfSVNfQ0hBTk5FTF9PUEVOXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBUYWJzU3RvcmFnZSA9IFwiYWN0aXZlX3RhYnNfd2F0Y2hwYXJ0eVwiXHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJpbXBvcnQgeyBNZXNzYWdlcyB9IGZyb20gJy4vbW9kZWxzL2NvbnN0YW50cydcclxuaW1wb3J0IHsgTWVzc2FnZU9iamVjdCwgUmVzcG9uc2VPYmplY3QgfSBmcm9tICcuL21vZGVscy9tZXNzYWdlcGFzc2luZydcclxuXHJcbi8vIFVwZGF0ZXMgbmVlZGVkXHJcbi8qKlxyXG4gKiAtIEFjdHVhbCBub3RpZnMgd2hlbiB1c2VyIGpvaW5zIG9yIGxlYXZlc1xyXG4gKiAtIENvbG9yIHVyIHVzZXIgZGFya2VyXHJcbiAqIC0gQWN0dWFsIHN5bmNoIGZ1bmN0aW9uYWxpdHlcclxuICogLSBmdXR1cmUgZmVhdHVyZTogY2hhdCBib3hcclxuICovXHJcblxyXG5jaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcigoKSA9PiB7XHJcbiAgICAvLyBkZWZhdWx0IHN0YXRlIGdvZXMgaGVyZVxyXG4gICAgLy8gdGhpcyBydW5zIE9ORSBUSU1FIE9OTFkgKHVubGVzcyB0aGUgdXNlciByZWluc3RhbGxzIHlvdXIgZXh0ZW5zaW9uKVxyXG59KTtcclxuXHJcbmNvbnN0IHRhYkNoYW5nZSA9ICh0YWJJZDogbnVtYmVyLCBldmVudDogc3RyaW5nKSA9PiB7XHJcbiAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwgeyBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0RPX1lPVV9FWElTVCB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIChyZXNwOiBSZXNwb25zZU9iamVjdDxib29sZWFuPikgPT4ge1xyXG4gICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIERPRVNOVCBFWElTVCBDQU4gSU5KRUNUIE5PV1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIklOSkVDVElORyBGT1JFR1JPVU5EIFdJVEggVEFCSUQ6IFwiICsgdGFiSWQpXHJcbiAgICAgICAgICAgIGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdCh7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQ6IHRhYklkIH0sXHJcbiAgICAgICAgICAgICAgICBmaWxlczogW1wiLi9zb2NrZXRpby9zb2NrZXQuaW8uanNcIl1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY2hyb21lLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQ6IHRhYklkIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZXM6IFtcIi4vZm9yZWdyb3VuZC5qc1wiXVxyXG4gICAgICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoZXZlbnQgPT09IFwib25VcGRhdGVkXCIpIHsgLy9pLmUgdXJsIGNoYW5nZSBvbiBleGlzdGluZyB0YWJcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7IG1lc3NhZ2U6IE1lc3NhZ2VzLlRPUE9QVVBfTEVBVkVfUk9PTSB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDUwMClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4gY29uc29sZS5sb2coZXJyKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSkgICAgICAgICAgICAgICAgXHJcbn1cclxuXHJcbi8vZ29uZSB1c2UgdGhpcyBvbmUgZm9yIGNoYW5naW5nIHRoZSB0YWIgYi93IGV4aXN0aW5nIHRhYnMgKGluY2x1ZGVzIHdoZW4gdSBhIGNsb3NlIGEgdGFiIGFuZCB1IGF1dG8gZ28gdG8gYW5vdGhlciB0YWIpXHJcbi8vdGVjaG5pY2FsbHkgdGhpcyBvbmUgaXMgZmlyZWQgd2hlbiBjcmVhdGluZyBhIG5ldyB0YWIgdG9vIGJ1dCBpdHMga2luZGEgdXNlbGVzcyBzaW5jZSB0aGUgdXJsIGlzbnQgcmVhZHkgYXQgdGhpcyBwb2ludCBzbyBjYW50IGluamVjdCBzY3JpcHQgeWV0XHJcbmNocm9tZS50YWJzLm9uQWN0aXZhdGVkLmFkZExpc3RlbmVyKGFjdGl2ZVRhYkluZm8gPT4ge1xyXG4gICAgY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZX0sIHRhYnMgPT4ge1xyXG4gICAgICAgIGlmICgvXmh0dHAvLnRlc3QodGFic1swXS51cmwpKSB7XHJcbiAgICAgICAgICAgIHRhYkNoYW5nZShhY3RpdmVUYWJJbmZvLnRhYklkLCBcIm9uQWN0aXZhdGVkXCIpO1xyXG4gICAgICAgIH1cclxuICAgfSlcclxufSlcclxuXHJcblxyXG4vL2dvbm5hIHVzZSB0aGlzIG9uZSBmb3Igd2hlbiB1IGNyZWF0ZSBhIG5ldyB0YWIsIG9yIHdoZW4geW91IGNoYW5nZSB0aGUgdXJsIG9mIHRoZSBjdXIgdGFiIHVyIG9uXHJcbmNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcigodGFiSWQsIGNoYW5nZUluZm8sIHRhYikgPT4ge1xyXG4gICAgaWYgKGNoYW5nZUluZm8uc3RhdHVzID09ICdjb21wbGV0ZScgJiYgL15odHRwLy50ZXN0KHRhYi51cmwpKSB7XHJcbiAgICAgICAgdGFiQ2hhbmdlKHRhYklkLCBcIm9uVXBkYXRlZFwiKTtcclxuICAgIH1cclxufSk7XHJcblxyXG4vLyBNZXNzYWdlIGhhbmRsZXJcclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0OiBNZXNzYWdlT2JqZWN0PGFueT4sIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbn0pO1xyXG5cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9