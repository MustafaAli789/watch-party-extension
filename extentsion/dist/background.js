/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./models/constants.ts":
/*!*****************************!*\
  !*** ./models/constants.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PageStorage = exports.TabsStorage = exports.Messages = exports.Page = void 0;
var Page;
(function (Page) {
    Page[Page["start"] = 0] = "start";
    Page[Page["main"] = 1] = "main";
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
})(Messages = exports.Messages || (exports.Messages = {}));
exports.TabsStorage = "active_tabs_watchparty";
exports.PageStorage = "page_watchparty";


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
    chrome.storage.local.set({
        [constants_1.PageStorage]: constants_1.Page.start
    });
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
chrome.tabs.onRemoved.addListener((tabid) => {
    chrome.storage.local.get(constants_1.TabsStorage, (data) => {
        let updatedTabs = data[constants_1.TabsStorage];
        updatedTabs.tabs.splice(updatedTabs.tabs.indexOf(updatedTabs.tabs.find(tab => tab.id === tabid)), 1);
        setTabs(updatedTabs);
    });
});
// chrome.windows.onRemoved.addListener((windowid) => {
//     alert("window closed")
// })
const tabChange = (tabId) => {
    chrome.storage.local.get(constants_1.TabsStorage, (data) => {
        if (data[constants_1.TabsStorage].tabs.find(tab => tab.id === tabId) == null) {
            console.log("working");
            console.log(data);
            let updatedTabs = data[constants_1.TabsStorage];
            updatedTabs.tabs.forEach(tab => tab.active = false);
            updatedTabs.tabs.push({ id: tabId, channelOpen: false, active: true });
            setTabs(updatedTabs);
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["./socketio/socket.io.js"]
            })
                .then(() => {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ["./foreground.js"]
                }).then(() => console.log("Injected foregroun"));
            }).catch(err => console.log(err));
        }
        else {
            let updatedTabs = data[constants_1.TabsStorage];
            updatedTabs.tabs.forEach(tab => {
                if (tab.id == tabId) {
                    tab.active = true;
                }
                else {
                    tab.active = false;
                }
            });
            console.log("NEW:");
            console.log(updatedTabs);
            setTabs(updatedTabs);
        }
    });
};
chrome.tabs.onActivated.addListener(activeTabInfo => {
    console.log("wassup");
    tabChange(activeTabInfo.tabId);
});
//Inject foreground into every tab that hasnt already been injected into
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
        console.log('yelloo');
        tabChange(tabId);
    }
});
// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    chrome.storage.local.get(constants_1.TabsStorage, (data) => {
        let activeTabId = data.tabs.find(tab => tab.active = true).id;
        if (request.message === constants_1.Messages.TOBG_VIDEO_ON_SCREEN) {
            standardMessageToForeground(activeTabId, constants_1.Messages.TOFG_VIDEO_ON_SCREEN, null, standardCallback(sendResponse));
            return true;
        }
        else if (request.message === constants_1.Messages.TOBG_CREATE_ROOM_IN_TAB) {
            let updatedTabs = data;
            updatedTabs.tabs.find(tab => tab.active = true).channelOpen = true;
            chrome.storage.local.set({
                TabsStorage: updatedTabs
            });
            standardMessageToForeground(activeTabId, constants_1.Messages.TOFG_CREATE_ROOM_IN_TAB, request.payload, standardCallback(sendResponse));
            return true;
        }
        else if (request.message === constants_1.Messages.TOBG_DISCONNECT) {
            standardMessageToForeground(activeTabId, constants_1.Messages.TOFG_DISCONNECT, request.payload, standardCallback(sendResponse));
            return true;
        }
    });
});
const standardMessageToForeground = (tabId, message, payload, callback) => {
    chrome.tabs.sendMessage(tabId, {
        message: message,
        payload: payload
    }, resp => callback(resp));
};
//Send success or failure and pass on payload
const standardCallback = (sendResponse) => (resp) => {
    if (resp.status === constants_1.Messages.SUCCESS) {
        sendResponse({
            status: constants_1.Messages.SUCCESS,
            payload: resp.payload
        });
    }
    else {
        sendResponse({
            status: constants_1.Messages.FAILURE
        });
    }
};

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QzdDLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7SUFDaEQsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLG9CQUFRLENBQUMsT0FBTyxFQUFFO1FBQ2xDLFlBQVksQ0FBQztZQUNULE1BQU0sRUFBRSxvQkFBUSxDQUFDLE9BQU87WUFDeEIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO1NBQ3hCLENBQUM7S0FDTDtTQUFNO1FBQ0gsWUFBWSxDQUFDO1lBQ1QsTUFBTSxFQUFFLG9CQUFRLENBQUMsT0FBTztTQUMzQixDQUFDO0tBQ0w7QUFDTCxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi8uL21vZGVscy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leHRlbnRzaW9uLy4vYmFja2dyb3VuZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBQYWdle1xyXG4gICAgc3RhcnQsXHJcbiAgICBtYWluXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIE1lc3NhZ2Vze1xyXG4gICAgVE9CR19WSURFT19PTl9TQ1JFRU4sXHJcbiAgICBTVUNDRVNTLFxyXG4gICAgRkFJTFVSRSxcclxuICAgIFRPQkdfQ1JFQVRFX1JPT01fSU5fVEFCLFxyXG4gICAgVE9GR19WSURFT19PTl9TQ1JFRU4sXHJcbiAgICBUT0ZHX0NSRUFURV9ST09NX0lOX1RBQixcclxuICAgIFRPQkdfRElTQ09OTkVDVCxcclxuICAgIFRPRkdfRElTQ09OTkVDVFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgVGFic1N0b3JhZ2UgPSBcImFjdGl2ZV90YWJzX3dhdGNocGFydHlcIlxyXG5leHBvcnQgY29uc3QgUGFnZVN0b3JhZ2UgPSBcInBhZ2Vfd2F0Y2hwYXJ0eVwiXHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJpbXBvcnQgeyBNZXNzYWdlcywgUGFnZSwgVGFic1N0b3JhZ2UsIFBhZ2VTdG9yYWdlIH0gZnJvbSAnLi9tb2RlbHMvY29uc3RhbnRzJ1xyXG5pbXBvcnQgeyBUYWJzLCBUYWIgfSBmcm9tICcuL21vZGVscy9hY3RpdmVUYWInXHJcblxyXG5jaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcigoKSA9PiB7XHJcbiAgICAvLyBkZWZhdWx0IHN0YXRlIGdvZXMgaGVyZVxyXG4gICAgLy8gdGhpcyBydW5zIE9ORSBUSU1FIE9OTFkgKHVubGVzcyB0aGUgdXNlciByZWluc3RhbGxzIHlvdXIgZXh0ZW5zaW9uKVxyXG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcclxuICAgICAgICBbUGFnZVN0b3JhZ2VdOiBQYWdlLnN0YXJ0XHJcbiAgICB9KTtcclxuXHJcbiAgICBsZXQgaW5pdGlhbFRhYnM6IFRhYnNcclxuICAgIGluaXRpYWxUYWJzID0ge30gYXMgVGFic1xyXG4gICAgaW5pdGlhbFRhYnMudGFicyA9IFtdXHJcblxyXG4gICAgc2V0VGFicyhpbml0aWFsVGFicylcclxufSk7XHJcblxyXG5jb25zdCBzZXRUYWJzID0gKHRhYnM6IFRhYnMpID0+IHtcclxuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7XHJcbiAgICAgICAgW1RhYnNTdG9yYWdlXTogdGFic1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNocm9tZS50YWJzLm9uUmVtb3ZlZC5hZGRMaXN0ZW5lcigodGFiaWQpID0+IHtcclxuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChUYWJzU3RvcmFnZSwgKGRhdGEpID0+IHtcclxuICAgICAgICBsZXQgdXBkYXRlZFRhYnM6IFRhYnMgPSBkYXRhW1RhYnNTdG9yYWdlXVxyXG4gICAgICAgIHVwZGF0ZWRUYWJzLnRhYnMuc3BsaWNlKHVwZGF0ZWRUYWJzLnRhYnMuaW5kZXhPZih1cGRhdGVkVGFicy50YWJzLmZpbmQodGFiID0+IHRhYi5pZCA9PT0gdGFiaWQpKSwgMSlcclxuICAgICAgICBzZXRUYWJzKHVwZGF0ZWRUYWJzKVxyXG4gICAgfSlcclxufSlcclxuICAgXHJcbi8vIGNocm9tZS53aW5kb3dzLm9uUmVtb3ZlZC5hZGRMaXN0ZW5lcigod2luZG93aWQpID0+IHtcclxuLy8gICAgIGFsZXJ0KFwid2luZG93IGNsb3NlZFwiKVxyXG4vLyB9KVxyXG5cclxuY29uc3QgdGFiQ2hhbmdlID0gKHRhYklkKSA9PiB7XHJcbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoVGFic1N0b3JhZ2UsIChkYXRhKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGFbVGFic1N0b3JhZ2VdLnRhYnMuZmluZCh0YWIgPT4gdGFiLmlkID09PSB0YWJJZCkgPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ3b3JraW5nXCIpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpXHJcblxyXG4gICAgICAgICAgICBsZXQgdXBkYXRlZFRhYnM6IFRhYnMgPSBkYXRhW1RhYnNTdG9yYWdlXVxyXG4gICAgICAgICAgICB1cGRhdGVkVGFicy50YWJzLmZvckVhY2godGFiID0+IHRhYi5hY3RpdmUgPSBmYWxzZSlcclxuICAgICAgICAgICAgdXBkYXRlZFRhYnMudGFicy5wdXNoKHsgaWQ6IHRhYklkLCBjaGFubmVsT3BlbjogZmFsc2UsIGFjdGl2ZTogdHJ1ZSB9IGFzIFRhYilcclxuXHJcbiAgICAgICAgICAgIHNldFRhYnModXBkYXRlZFRhYnMpXHJcblxyXG4gICAgICAgICAgICBjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWJJZCB9LFxyXG4gICAgICAgICAgICAgICAgZmlsZXM6IFtcIi4vc29ja2V0aW8vc29ja2V0LmlvLmpzXCJdXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWJJZCB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzOiBbXCIuL2ZvcmVncm91bmQuanNcIl1cclxuICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4gY29uc29sZS5sb2coXCJJbmplY3RlZCBmb3JlZ3JvdW5cIikpXHJcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiBjb25zb2xlLmxvZyhlcnIpKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IHVwZGF0ZWRUYWJzOiBUYWJzID0gZGF0YVtUYWJzU3RvcmFnZV1cclxuICAgICAgICAgICAgdXBkYXRlZFRhYnMudGFicy5mb3JFYWNoKHRhYiA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFiLmlkID09IHRhYklkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFiLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhYi5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJORVc6XCIpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHVwZGF0ZWRUYWJzKVxyXG4gICAgICAgICAgICBzZXRUYWJzKHVwZGF0ZWRUYWJzKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbn1cclxuXHJcbmNocm9tZS50YWJzLm9uQWN0aXZhdGVkLmFkZExpc3RlbmVyKGFjdGl2ZVRhYkluZm8gPT4ge1xyXG4gICAgY29uc29sZS5sb2coXCJ3YXNzdXBcIilcclxuICAgIHRhYkNoYW5nZShhY3RpdmVUYWJJbmZvLnRhYklkKTtcclxufSlcclxuXHJcbi8vSW5qZWN0IGZvcmVncm91bmQgaW50byBldmVyeSB0YWIgdGhhdCBoYXNudCBhbHJlYWR5IGJlZW4gaW5qZWN0ZWQgaW50b1xyXG5jaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoKHRhYklkLCBjaGFuZ2VJbmZvLCB0YWIpID0+IHtcclxuICAgIGlmIChjaGFuZ2VJbmZvLnN0YXR1cyA9PT0gJ2NvbXBsZXRlJyAmJiAvXmh0dHAvLnRlc3QodGFiLnVybCkpIHtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ3llbGxvbycpXHJcbiAgICAgICAgdGFiQ2hhbmdlKHRhYklkKTtcclxuICAgICAgICBcclxuICAgIH1cclxufSk7XHJcblxyXG4vLyBNZXNzYWdlIGhhbmRsZXJcclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG5cclxuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChUYWJzU3RvcmFnZSwgKGRhdGE6IFRhYnMpID0+IHtcclxuICAgICAgICBsZXQgYWN0aXZlVGFiSWQ6IG51bWJlciA9IGRhdGEudGFicy5maW5kKHRhYiA9PiB0YWIuYWN0aXZlID0gdHJ1ZSkuaWRcclxuXHJcbiAgICAgICAgaWYgKHJlcXVlc3QubWVzc2FnZSA9PT0gTWVzc2FnZXMuVE9CR19WSURFT19PTl9TQ1JFRU4pIHtcclxuICAgICAgICAgICAgc3RhbmRhcmRNZXNzYWdlVG9Gb3JlZ3JvdW5kKGFjdGl2ZVRhYklkLCBNZXNzYWdlcy5UT0ZHX1ZJREVPX09OX1NDUkVFTiwgbnVsbCwgc3RhbmRhcmRDYWxsYmFjayhzZW5kUmVzcG9uc2UpKVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5tZXNzYWdlID09PSBNZXNzYWdlcy5UT0JHX0NSRUFURV9ST09NX0lOX1RBQikge1xyXG5cclxuICAgICAgICAgICAgbGV0IHVwZGF0ZWRUYWJzOiBUYWJzID0gZGF0YVxyXG4gICAgICAgICAgICB1cGRhdGVkVGFicy50YWJzLmZpbmQodGFiID0+IHRhYi5hY3RpdmUgPSB0cnVlKS5jaGFubmVsT3BlbiA9IHRydWVcclxuICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcclxuICAgICAgICAgICAgICAgIFRhYnNTdG9yYWdlOiB1cGRhdGVkVGFic1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHN0YW5kYXJkTWVzc2FnZVRvRm9yZWdyb3VuZChhY3RpdmVUYWJJZCwgTWVzc2FnZXMuVE9GR19DUkVBVEVfUk9PTV9JTl9UQUIsIHJlcXVlc3QucGF5bG9hZCwgc3RhbmRhcmRDYWxsYmFjayhzZW5kUmVzcG9uc2UpKVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5tZXNzYWdlID09PSBNZXNzYWdlcy5UT0JHX0RJU0NPTk5FQ1QpIHtcclxuICAgICAgICAgICAgc3RhbmRhcmRNZXNzYWdlVG9Gb3JlZ3JvdW5kKGFjdGl2ZVRhYklkLCBNZXNzYWdlcy5UT0ZHX0RJU0NPTk5FQ1QsIHJlcXVlc3QucGF5bG9hZCwgc3RhbmRhcmRDYWxsYmFjayhzZW5kUmVzcG9uc2UpKVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbn0pO1xyXG5cclxuY29uc3Qgc3RhbmRhcmRNZXNzYWdlVG9Gb3JlZ3JvdW5kID0gKHRhYklkOiBudW1iZXIsIG1lc3NhZ2U6IE1lc3NhZ2VzLCBwYXlsb2FkLCBjYWxsYmFjazogRnVuY3Rpb24pID0+IHtcclxuICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCB7XHJcbiAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcclxuICAgICAgICBwYXlsb2FkOiBwYXlsb2FkXHJcbiAgICB9LCByZXNwID0+IGNhbGxiYWNrKHJlc3ApKVxyXG59XHJcblxyXG4vL1NlbmQgc3VjY2VzcyBvciBmYWlsdXJlIGFuZCBwYXNzIG9uIHBheWxvYWRcclxuY29uc3Qgc3RhbmRhcmRDYWxsYmFjayA9IChzZW5kUmVzcG9uc2UpID0+IChyZXNwKSA9PiB7XHJcbiAgICBpZiAocmVzcC5zdGF0dXMgPT09IE1lc3NhZ2VzLlNVQ0NFU1MpIHtcclxuICAgICAgICBzZW5kUmVzcG9uc2Uoe1xyXG4gICAgICAgICAgICBzdGF0dXM6IE1lc3NhZ2VzLlNVQ0NFU1MsXHJcbiAgICAgICAgICAgIHBheWxvYWQ6IHJlc3AucGF5bG9hZFxyXG4gICAgICAgIH0pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNlbmRSZXNwb25zZSh7XHJcbiAgICAgICAgICAgIHN0YXR1czogTWVzc2FnZXMuRkFJTFVSRVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9