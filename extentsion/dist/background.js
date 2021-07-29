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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LENBQUMsTUFBTSxLQUFLLG9CQUFRLENBQUMsT0FBTyxFQUFFO1FBQ2xDLFlBQVksQ0FBQztZQUNULE1BQU0sRUFBRSxvQkFBUSxDQUFDLE9BQU87WUFDeEIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO1NBQ3hCLENBQUM7S0FDTDtTQUFNO1FBQ0gsWUFBWSxDQUFDO1lBQ1QsTUFBTSxFQUFFLG9CQUFRLENBQUMsT0FBTztTQUMzQixDQUFDO0tBQ0w7QUFDTCxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi8uL21vZGVscy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leHRlbnRzaW9uLy4vYmFja2dyb3VuZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBQYWdle1xyXG4gICAgc3RhcnQsXHJcbiAgICBtYWluXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIE1lc3NhZ2Vze1xyXG4gICAgVE9CR19WSURFT19PTl9TQ1JFRU4sXHJcbiAgICBTVUNDRVNTLFxyXG4gICAgRkFJTFVSRSxcclxuICAgIFRPQkdfQ1JFQVRFX1JPT01fSU5fVEFCLFxyXG4gICAgVE9GR19WSURFT19PTl9TQ1JFRU4sXHJcbiAgICBUT0ZHX0NSRUFURV9ST09NX0lOX1RBQixcclxuICAgIFRPQkdfRElTQ09OTkVDVCxcclxuICAgIFRPRkdfRElTQ09OTkVDVFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgVGFic1N0b3JhZ2UgPSBcImFjdGl2ZV90YWJzX3dhdGNocGFydHlcIlxyXG5leHBvcnQgY29uc3QgUGFnZVN0b3JhZ2UgPSBcInBhZ2Vfd2F0Y2hwYXJ0eVwiXHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJpbXBvcnQgeyBNZXNzYWdlcywgUGFnZSwgVGFic1N0b3JhZ2UsIFBhZ2VTdG9yYWdlIH0gZnJvbSAnLi9tb2RlbHMvY29uc3RhbnRzJ1xyXG5pbXBvcnQgeyBUYWJzLCBUYWIgfSBmcm9tICcuL21vZGVscy9hY3RpdmVUYWInXHJcblxyXG5jaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcigoKSA9PiB7XHJcbiAgICAvLyBkZWZhdWx0IHN0YXRlIGdvZXMgaGVyZVxyXG4gICAgLy8gdGhpcyBydW5zIE9ORSBUSU1FIE9OTFkgKHVubGVzcyB0aGUgdXNlciByZWluc3RhbGxzIHlvdXIgZXh0ZW5zaW9uKVxyXG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcclxuICAgICAgICBbUGFnZVN0b3JhZ2VdOiBQYWdlLnN0YXJ0XHJcbiAgICB9KTtcclxuXHJcbiAgICBsZXQgaW5pdGlhbFRhYnM6IFRhYnNcclxuICAgIGluaXRpYWxUYWJzID0ge30gYXMgVGFic1xyXG4gICAgaW5pdGlhbFRhYnMudGFicyA9IFtdXHJcblxyXG4gICAgc2V0VGFicyhpbml0aWFsVGFicylcclxufSk7XHJcblxyXG5jb25zdCBzZXRUYWJzID0gKHRhYnM6IFRhYnMpID0+IHtcclxuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7XHJcbiAgICAgICAgW1RhYnNTdG9yYWdlXTogdGFic1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IHRhYkNoYW5nZSA9ICh0YWJJZDogbnVtYmVyLCBsb2dNc2c6IHN0cmluZykgPT4ge1xyXG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFRhYnNTdG9yYWdlLCAoZGF0YSkgPT4ge1xyXG5cclxuICAgICAgICBsZXQgdXBkYXRlZFRhYnM6IFRhYnMgPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhW1RhYnNTdG9yYWdlXSlcclxuXHJcbiAgICAgICAgLy9uZWVkcyB0byBiZSBvdXQgaGVyZSBpbiBjYXNlIHNvbWVvbmUgaGFzIGEgbm9ybWFsIHRhYiBvcGVuIGJ1dCB0aGVuIG9wZW5zIGEgbmV3IGNocm9tZTovLyB0YWIgYWZ0ZXJcclxuICAgICAgICAvL3RoZSBuZXcgdGFiIHdvbnQgYmUgYWRkZWQgdG8gb3VyIHRhYnMgc3RvcmFnZSBvciBpbmplY3RlZCBidXQgd2UgZG8gbmVlZCBhbGwgb3RoZXJzIHRhYnMgdG8gYmUgYWN0aXZlIGZhbHNlIG5vd1xyXG4gICAgICAgIHVwZGF0ZWRUYWJzLnRhYnMuZm9yRWFjaCh0YWIgPT4gdGFiLmFjdGl2ZSA9IGZhbHNlKVxyXG5cclxuICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7fSwgdGFicyA9PiB7XHJcblxyXG4gICAgICAgICAgICAvL3JlbW92aW5nIG9sZCB0YWJzIGZyb20gb3VyIHN0b3JhZ2Ugb2JqIGlmIGl0IGhhcyBiZWVuIGNsb3NlZFxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdXBkYXRlZFRhYnMudGFicy5sZW5ndGgtMTsgaT49MDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGFiU3RvcmFnZTogVGFiID0gdXBkYXRlZFRhYnMudGFic1tpXVxyXG4gICAgICAgICAgICAgICAgaWYgKHRhYnMuZmluZCh0YWIgPT4gdGFiLmlkID09IHRhYlN0b3JhZ2UuaWQpID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkVGFicy50YWJzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9uZXcgdGFiIG5vdCBpbiBzdG9yYWdlXHJcbiAgICAgICAgICAgIGlmIChkYXRhW1RhYnNTdG9yYWdlXS50YWJzLmZpbmQodGFiID0+IHRhYi5pZCA9PT0gdGFiSWQpID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogeyB0YWJJZDogdGFiSWQgfSxcclxuICAgICAgICAgICAgICAgICAgICBmaWxlczogW1wiLi9zb2NrZXRpby9zb2NrZXQuaW8uanNcIl1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hyb21lLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWJJZCB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogW1wiLi9mb3JlZ3JvdW5kLmpzXCJdXHJcbiAgICAgICAgICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRUYWJzLnRhYnMucHVzaCh7IGlkOiB0YWJJZCwgY2hhbm5lbE9wZW46IGZhbHNlLCBhY3RpdmU6IHRydWUgfSBhcyBUYWIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRhYnModXBkYXRlZFRhYnMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGxvZ01zZylcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy9leGlzdGluZyB0YWIgaW4gc3RvcmFnZVxyXG4gICAgICAgICAgICB9IGVsc2UgeyBcclxuICAgICAgICAgICAgICAgIHVwZGF0ZWRUYWJzLnRhYnMuZm9yRWFjaCh0YWIgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0YWIuaWQgPT0gdGFiSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFiLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFiLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhsb2dNc2cpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHNldFRhYnModXBkYXRlZFRhYnMpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9KVxyXG59XHJcblxyXG4vL2dvbmUgdXNlIHRoaXMgb25lIGZvciBjaGFuZ2luZyB0aGUgdGFiIGIvdyBleGlzdGluZyB0YWJzIChpbmNsdWRlcyB3aGVuIHUgYSBjbG9zZSBhIHRhYiBhbmQgdSBhdXRvIGdvIHRvIGFub3RoZXIgdGFiKVxyXG4vL3RlY2huaWNhbGx5IHRoaXMgb25lIGlzIGZpcmVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgdGFiIHRvbyBidXQgaXRzIGtpbmRhIHVzZWxlc3Mgc2luY2UgdGhlIHVybCBpc250IHJlYWR5IGF0IHRoaXMgcG9pbnQgc28gY2FudCBpbmplY3Qgc2NyaXB0IHlldFxyXG5jaHJvbWUudGFicy5vbkFjdGl2YXRlZC5hZGRMaXN0ZW5lcihhY3RpdmVUYWJJbmZvID0+IHtcclxuXHJcbiAgICB0YWJDaGFuZ2UoYWN0aXZlVGFiSW5mby50YWJJZCwgXCJvbkFjdGl2YXRlZFwiKTtcclxufSlcclxuXHJcbi8vU1BFQ0lBTCBOT1RFIEZPUiBCRUxPVyBNRVRIT0Q6XHJcbi8vZXZlbiBpZiB5b3UgY2hhbmdlIGN1ciB1cmwgdG8gYSBjaHJvbWU6Ly8gdXJsLCBzaW5jZSB0aGUgc2NyaXB0IGhhcyBhbHJlYWR5IGJlZW4gaW5qZWN0ZWQgYW5kIHRhYmlkIGlzIG5vdCBjaGFuZ2luZywgbm90aGluZyBzaHVsZCByZWFsbHkgaGFwcGVuXHJcbi8vYWN0aXZlIHN0YXlzIHRydWUgYW5kIG5vIGVycm9ycyBwb3AgdXBcclxuXHJcbi8vZ29ubmEgdXNlIHRoaXMgb25lIGZvciB3aGVuIHUgY3JlYXRlIGEgbmV3IHRhYiwgb3Igd2hlbiB5b3UgY2hhbmdlIHRoZSB1cmwgb2YgdGhlIGN1ciB0YWIgdXIgb25cclxuY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKCh0YWJJZCwgY2hhbmdlSW5mbywgdGFiKSA9PiB7XHJcbiAgICBpZiAoY2hhbmdlSW5mby5zdGF0dXMgPT09ICdjb21wbGV0ZScpIHtcclxuICAgICAgICB0YWJDaGFuZ2UodGFiSWQsIFwib25VcGRhdGVkXCIpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbi8vIE1lc3NhZ2UgaGFuZGxlclxyXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcblxyXG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFRhYnNTdG9yYWdlLCAoZGF0YTogVGFicykgPT4ge1xyXG4gICAgICAgIGxldCBhY3RpdmVUYWJJZDogbnVtYmVyID0gZGF0YS50YWJzLmZpbmQodGFiID0+IHRhYi5hY3RpdmUgPSB0cnVlKS5pZFxyXG5cclxuICAgICAgICBpZiAocmVxdWVzdC5tZXNzYWdlID09PSBNZXNzYWdlcy5UT0JHX1ZJREVPX09OX1NDUkVFTikge1xyXG4gICAgICAgICAgICBzdGFuZGFyZE1lc3NhZ2VUb0ZvcmVncm91bmQoYWN0aXZlVGFiSWQsIE1lc3NhZ2VzLlRPRkdfVklERU9fT05fU0NSRUVOLCBudWxsLCBzdGFuZGFyZENhbGxiYWNrKHNlbmRSZXNwb25zZSkpXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0Lm1lc3NhZ2UgPT09IE1lc3NhZ2VzLlRPQkdfQ1JFQVRFX1JPT01fSU5fVEFCKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgdXBkYXRlZFRhYnM6IFRhYnMgPSBkYXRhXHJcbiAgICAgICAgICAgIHVwZGF0ZWRUYWJzLnRhYnMuZmluZCh0YWIgPT4gdGFiLmFjdGl2ZSA9IHRydWUpLmNoYW5uZWxPcGVuID0gdHJ1ZVxyXG4gICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoe1xyXG4gICAgICAgICAgICAgICAgVGFic1N0b3JhZ2U6IHVwZGF0ZWRUYWJzXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc3RhbmRhcmRNZXNzYWdlVG9Gb3JlZ3JvdW5kKGFjdGl2ZVRhYklkLCBNZXNzYWdlcy5UT0ZHX0NSRUFURV9ST09NX0lOX1RBQiwgcmVxdWVzdC5wYXlsb2FkLCBzdGFuZGFyZENhbGxiYWNrKHNlbmRSZXNwb25zZSkpXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0Lm1lc3NhZ2UgPT09IE1lc3NhZ2VzLlRPQkdfRElTQ09OTkVDVCkge1xyXG4gICAgICAgICAgICBzdGFuZGFyZE1lc3NhZ2VUb0ZvcmVncm91bmQoYWN0aXZlVGFiSWQsIE1lc3NhZ2VzLlRPRkdfRElTQ09OTkVDVCwgcmVxdWVzdC5wYXlsb2FkLCBzdGFuZGFyZENhbGxiYWNrKHNlbmRSZXNwb25zZSkpXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufSk7XHJcblxyXG5jb25zdCBzdGFuZGFyZE1lc3NhZ2VUb0ZvcmVncm91bmQgPSAodGFiSWQ6IG51bWJlciwgbWVzc2FnZTogTWVzc2FnZXMsIHBheWxvYWQsIGNhbGxiYWNrOiBGdW5jdGlvbikgPT4ge1xyXG4gICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiSWQsIHtcclxuICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxyXG4gICAgICAgIHBheWxvYWQ6IHBheWxvYWRcclxuICAgIH0sIHJlc3AgPT4gY2FsbGJhY2socmVzcCkpXHJcbn1cclxuXHJcbi8vU2VuZCBzdWNjZXNzIG9yIGZhaWx1cmUgYW5kIHBhc3Mgb24gcGF5bG9hZFxyXG5jb25zdCBzdGFuZGFyZENhbGxiYWNrID0gKHNlbmRSZXNwb25zZSkgPT4gKHJlc3ApID0+IHtcclxuICAgIGlmIChyZXNwLnN0YXR1cyA9PT0gTWVzc2FnZXMuU1VDQ0VTUykge1xyXG4gICAgICAgIHNlbmRSZXNwb25zZSh7XHJcbiAgICAgICAgICAgIHN0YXR1czogTWVzc2FnZXMuU1VDQ0VTUyxcclxuICAgICAgICAgICAgcGF5bG9hZDogcmVzcC5wYXlsb2FkXHJcbiAgICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2VuZFJlc3BvbnNlKHtcclxuICAgICAgICAgICAgc3RhdHVzOiBNZXNzYWdlcy5GQUlMVVJFXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufVxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=