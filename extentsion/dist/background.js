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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUMsYUFBYSxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQztTQUNqRDtJQUNOLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQztBQUdGLGlHQUFpRztBQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3pELElBQUksVUFBVSxDQUFDLE1BQU0sSUFBSSxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDMUQsU0FBUyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztLQUNqQztBQUNMLENBQUMsQ0FBQyxDQUFDO0FBRUgsa0JBQWtCO0FBQ2xCLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQTJCLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxFQUFFO0FBQzNGLENBQUMsQ0FBQyxDQUFDO0FBRUgsMkdBQTJHO0FBQzNHLHVDQUF1QztBQUN2Qyw0QkFBNEI7QUFDNUIsMkJBQTJCO0FBQzNCLGlDQUFpQztBQUNqQyxJQUFJO0FBRUosZ0RBQWdEO0FBQ2hELHlEQUF5RDtBQUN6RCw4Q0FBOEM7QUFDOUMseUJBQXlCO0FBQ3pCLHdDQUF3QztBQUN4QyxvQ0FBb0M7QUFDcEMsYUFBYTtBQUNiLGVBQWU7QUFDZix5QkFBeUI7QUFDekIsdUNBQXVDO0FBQ3ZDLGFBQWE7QUFDYixRQUFRO0FBQ1IsSUFBSSIsInNvdXJjZXMiOlsid2VicGFjazovL2V4dGVudHNpb24vLi9tb2RlbHMvY29uc3RhbnRzLnRzIiwid2VicGFjazovL2V4dGVudHNpb24vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi8uL2JhY2tncm91bmQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGVudW0gUGFnZXtcclxuICAgIFNUQVJULFxyXG4gICAgTUFJTlxyXG59XHJcblxyXG5leHBvcnQgZW51bSBNZXNzYWdlc3tcclxuICAgIFNVQ0NFU1MsXHJcbiAgICBGQUlMVVJFLFxyXG4gICAgVE9GR19WSURFT19PTl9TQ1JFRU4sXHJcbiAgICBUT0ZHX0NSRUFURV9ST09NX0lOX1RBQixcclxuICAgIFRPRkdfSk9JTl9ST09NX0lOX1RBQixcclxuICAgIFRPRkdfRElTQ09OTkVDVCxcclxuICAgIFRPRkdfUkVUUklFVkVfUk9PTV9EQVRBLFxyXG4gICAgVE9GR19ET19ZT1VfRVhJU1QsXHJcbiAgICBUT1BPUFVQX0xFQVZFX1JPT00sXHJcbiAgICBUT1BPUFVQX1JPT01fREFUQSxcclxuICAgIFRPUE9QVVBfVVNFUl9DT05ORUNURUQsXHJcbiAgICBUT0ZHX0lTX0NIQU5ORUxfT1BFTlxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgVGFic1N0b3JhZ2UgPSBcImFjdGl2ZV90YWJzX3dhdGNocGFydHlcIlxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgTWVzc2FnZXMgfSBmcm9tICcuL21vZGVscy9jb25zdGFudHMnXHJcbmltcG9ydCB7IE1lc3NhZ2VPYmplY3QsIFJlc3BvbnNlT2JqZWN0IH0gZnJvbSAnLi9tb2RlbHMvbWVzc2FnZXBhc3NpbmcnXHJcblxyXG5cclxuY2hyb21lLnJ1bnRpbWUub25JbnN0YWxsZWQuYWRkTGlzdGVuZXIoKCkgPT4ge1xyXG4gICAgLy8gZGVmYXVsdCBzdGF0ZSBnb2VzIGhlcmVcclxuICAgIC8vIHRoaXMgcnVucyBPTkUgVElNRSBPTkxZICh1bmxlc3MgdGhlIHVzZXIgcmVpbnN0YWxscyB5b3VyIGV4dGVuc2lvbilcclxufSk7XHJcblxyXG5jb25zdCB0YWJDaGFuZ2UgPSAodGFiSWQ6IG51bWJlciwgZXZlbnQ6IHN0cmluZykgPT4ge1xyXG4gICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiSWQsIHsgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19ET19ZT1VfRVhJU1QgfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8Ym9vbGVhbj4pID0+IHtcclxuICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBET0VTTlQgRVhJU1QgQ0FOIElOSkVDVCBOT1dcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJJTkpFQ1RJTkcgRk9SRUdST1VORCBXSVRIIFRBQklEOiBcIiArIHRhYklkKVxyXG4gICAgICAgICAgICBjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWJJZCB9LFxyXG4gICAgICAgICAgICAgICAgZmlsZXM6IFtcIi4vc29ja2V0aW8vc29ja2V0LmlvLmpzXCJdXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWJJZCB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzOiBbXCIuL2ZvcmVncm91bmQuanNcIl1cclxuICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKGV2ZW50ID09PSBcIm9uVXBkYXRlZFwiKSB7IC8vaS5lIHVybCBjaGFuZ2Ugb24gZXhpc3RpbmcgdGFiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBtZXNzYWdlOiBNZXNzYWdlcy5UT1BPUFVQX0xFQVZFX1JPT00gfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCA1MDApXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xyXG4gICAgICAgIH1cclxuICAgIH0pICAgICAgICAgICAgICAgIFxyXG59XHJcblxyXG4vL2dvbmUgdXNlIHRoaXMgb25lIGZvciBjaGFuZ2luZyB0aGUgdGFiIGIvdyBleGlzdGluZyB0YWJzIChpbmNsdWRlcyB3aGVuIHUgYSBjbG9zZSBhIHRhYiBhbmQgdSBhdXRvIGdvIHRvIGFub3RoZXIgdGFiKVxyXG4vL3RlY2huaWNhbGx5IHRoaXMgb25lIGlzIGZpcmVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgdGFiIHRvbyBidXQgaXRzIGtpbmRhIHVzZWxlc3Mgc2luY2UgdGhlIHVybCBpc250IHJlYWR5IGF0IHRoaXMgcG9pbnQgc28gY2FudCBpbmplY3Qgc2NyaXB0IHlldFxyXG5jaHJvbWUudGFicy5vbkFjdGl2YXRlZC5hZGRMaXN0ZW5lcihhY3RpdmVUYWJJbmZvID0+IHtcclxuICAgIGNocm9tZS50YWJzLnF1ZXJ5KHthY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICBpZiAoL15odHRwLy50ZXN0KHRhYnNbMF0udXJsKSkge1xyXG4gICAgICAgICAgICB0YWJDaGFuZ2UoYWN0aXZlVGFiSW5mby50YWJJZCwgXCJvbkFjdGl2YXRlZFwiKTtcclxuICAgICAgICB9XHJcbiAgIH0pXHJcbn0pXHJcblxyXG5cclxuLy9nb25uYSB1c2UgdGhpcyBvbmUgZm9yIHdoZW4gdSBjcmVhdGUgYSBuZXcgdGFiLCBvciB3aGVuIHlvdSBjaGFuZ2UgdGhlIHVybCBvZiB0aGUgY3VyIHRhYiB1ciBvblxyXG5jaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoKHRhYklkLCBjaGFuZ2VJbmZvLCB0YWIpID0+IHtcclxuICAgIGlmIChjaGFuZ2VJbmZvLnN0YXR1cyA9PSAnY29tcGxldGUnICYmIC9eaHR0cC8udGVzdCh0YWIudXJsKSkge1xyXG4gICAgICAgIHRhYkNoYW5nZSh0YWJJZCwgXCJvblVwZGF0ZWRcIik7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuLy8gTWVzc2FnZSBoYW5kbGVyXHJcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigocmVxdWVzdDogTWVzc2FnZU9iamVjdDxhbnk+LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG59KTtcclxuXHJcbi8vIGNvbnN0IHN0YW5kYXJkTWVzc2FnZVRvRm9yZWdyb3VuZCA9ICh0YWJJZDogbnVtYmVyLCBtZXNzYWdlOiBNZXNzYWdlcywgcGF5bG9hZCwgY2FsbGJhY2s6IEZ1bmN0aW9uKSA9PiB7XHJcbi8vICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwge1xyXG4vLyAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXHJcbi8vICAgICAgICAgcGF5bG9hZDogcGF5bG9hZFxyXG4vLyAgICAgfSwgcmVzcCA9PiBjYWxsYmFjayhyZXNwKSlcclxuLy8gfVxyXG5cclxuLy8gLy9TZW5kIHN1Y2Nlc3Mgb3IgZmFpbHVyZSBhbmQgcGFzcyBvbiBwYXlsb2FkXHJcbi8vIGNvbnN0IHN0YW5kYXJkQ2FsbGJhY2sgPSAoc2VuZFJlc3BvbnNlKSA9PiAocmVzcCkgPT4ge1xyXG4vLyAgICAgaWYgKHJlc3Auc3RhdHVzID09PSBNZXNzYWdlcy5TVUNDRVNTKSB7XHJcbi8vICAgICAgICAgc2VuZFJlc3BvbnNlKHtcclxuLy8gICAgICAgICAgICAgc3RhdHVzOiBNZXNzYWdlcy5TVUNDRVNTLFxyXG4vLyAgICAgICAgICAgICBwYXlsb2FkOiByZXNwLnBheWxvYWRcclxuLy8gICAgICAgICB9KVxyXG4vLyAgICAgfSBlbHNlIHtcclxuLy8gICAgICAgICBzZW5kUmVzcG9uc2Uoe1xyXG4vLyAgICAgICAgICAgICBzdGF0dXM6IE1lc3NhZ2VzLkZBSUxVUkVcclxuLy8gICAgICAgICB9KVxyXG4vLyAgICAgfVxyXG4vLyB9XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==