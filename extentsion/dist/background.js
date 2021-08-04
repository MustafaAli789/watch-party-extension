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
    Messages[Messages["TOFG_DO_YOU_EXIST"] = 9] = "TOFG_DO_YOU_EXIST";
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
const setAllTabsToInactive = () => {
    chrome.storage.local.get(constants_1.TabsStorage, (data) => {
        let updatedTabs = Object.assign({}, data[constants_1.TabsStorage]);
        updatedTabs.tabs.forEach(tab => tab.active = false);
        setTabs(updatedTabs);
    });
};
const tabChange = (tabId, event) => {
    chrome.storage.local.get(constants_1.TabsStorage, (data) => {
        let updatedTabs = Object.assign({}, data[constants_1.TabsStorage]);
        chrome.tabs.query({}, tabs => {
            //removing old tabs from our storage obj if it has been closed
            for (let i = updatedTabs.tabs.length - 1; i >= 0; i--) {
                let tabStorage = updatedTabs.tabs[i];
                if (tabs.find(tab => tab.id == tabStorage.id) == null) {
                    updatedTabs.tabs.splice(i, 1);
                }
            }
            //new tab not in storage
            //special case where changing urls of a tab that prev had script injected needs to be injected again
            //cause url change causes script to be lost
            let existingTab = data[constants_1.TabsStorage].tabs.find(tab => tab.id === tabId);
            if (!existingTab || event === "onUpdated") {
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
                                if (!existingTab) {
                                    updatedTabs.tabs.push({ id: tabId, channelOpen: false, active: true });
                                    setTabs(updatedTabs);
                                }
                            });
                        }).catch(err => console.log(err));
                    }
                });
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
            }
            setTabs(updatedTabs);
        });
    });
};
//gone use this one for changing the tab b/w existing tabs (includes when u a close a tab and u auto go to another tab)
//technically this one is fired when creating a new tab too but its kinda useless since the url isnt ready at this point so cant inject script yet
chrome.tabs.onActivated.addListener(activeTabInfo => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        console.log(tabs);
        if (/^http/.test(tabs[0].url)) {
            tabChange(activeTabInfo.tabId, "onActivated");
        }
        else { //non http url
            setAllTabsToInactive();
        }
    });
});
//gonna use this one for when u create a new tab, or when you change the url of the cur tab ur on
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status == 'complete' && /^http/.test(tab.url)) {
        tabChange(tabId, "onUpdated");
    }
    else if (!/^http/.test(tab.url)) { //not http url
        setAllTabsToInactive();
    }
});
// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    chrome.storage.local.get(constants_1.TabsStorage, (data) => {
        let updatedTabs = Object.assign({}, data[constants_1.TabsStorage]);
        if (request.message === constants_1.Messages.TOBG_CREATE_ROOM_IN_TAB) {
            updatedTabs.tabs.find(tab => tab.active).channelOpen = true;
        }
        else if (request.message === constants_1.Messages.TOBG_DISCONNECT) {
            updatedTabs.tabs.find(tab => tab.active).channelOpen = false;
        }
        setTabs(updatedTabs);
    });
    return true;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsSUFBWSxJQUdYO0FBSEQsV0FBWSxJQUFJO0lBQ1osaUNBQUs7SUFDTCwrQkFBSTtBQUNSLENBQUMsRUFIVyxJQUFJLEdBQUosWUFBSSxLQUFKLFlBQUksUUFHZjtBQUVELElBQVksUUFXWDtBQVhELFdBQVksUUFBUTtJQUNoQix1RUFBb0I7SUFDcEIsNkNBQU87SUFDUCw2Q0FBTztJQUNQLDZFQUF1QjtJQUN2Qix1RUFBb0I7SUFDcEIsNkVBQXVCO0lBQ3ZCLDZEQUFlO0lBQ2YsNkRBQWU7SUFDZiw2RUFBdUI7SUFDdkIsaUVBQWlCO0FBQ3JCLENBQUMsRUFYVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQVduQjtBQUVZLG1CQUFXLEdBQUcsd0JBQXdCOzs7Ozs7O1VDbEJuRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7Ozs7Ozs7Ozs7QUN0QkEsMkZBQWdFO0FBS2hFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUU7SUFDeEMsMEJBQTBCO0lBQzFCLHNFQUFzRTtJQUV0RSxJQUFJLFdBQWlCO0lBQ3JCLFdBQVcsR0FBRyxFQUFVO0lBQ3hCLFdBQVcsQ0FBQyxJQUFJLEdBQUcsRUFBRTtJQUVyQixPQUFPLENBQUMsV0FBVyxDQUFDO0FBQ3hCLENBQUMsQ0FBQyxDQUFDO0FBRUgsTUFBTSxPQUFPLEdBQUcsQ0FBQyxJQUFVLEVBQUUsRUFBRTtJQUMzQixNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFDckIsQ0FBQyx1QkFBVyxDQUFDLEVBQUUsSUFBSTtLQUN0QixDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsTUFBTSxvQkFBb0IsR0FBRyxHQUFHLEVBQUU7SUFDOUIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLHVCQUFXLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUMzQyxJQUFJLFdBQVcsR0FBUyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsdUJBQVcsQ0FBQyxDQUFDO1FBQzVELFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDbkQsT0FBTyxDQUFDLFdBQVcsQ0FBQztJQUN4QixDQUFDLENBQUM7QUFDTixDQUFDO0FBRUQsTUFBTSxTQUFTLEdBQUcsQ0FBQyxLQUFhLEVBQUUsS0FBYSxFQUFFLEVBQUU7SUFDL0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLHVCQUFXLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUUzQyxJQUFJLFdBQVcsR0FBUyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsdUJBQVcsQ0FBQyxDQUFDO1FBRTVELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtZQUV6Qiw4REFBOEQ7WUFDOUQsS0FBSyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDL0MsSUFBSSxVQUFVLEdBQVEsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3pDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksVUFBVSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRTtvQkFDbkQsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUNqQzthQUNKO1lBRUQsd0JBQXdCO1lBQ3hCLG9HQUFvRztZQUNwRywyQ0FBMkM7WUFDM0MsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLHVCQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxLQUFLLENBQUM7WUFDdEUsSUFBSSxDQUFDLFdBQVcsSUFBSSxLQUFLLEtBQUssV0FBVyxFQUFFO2dCQUV2QyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsb0JBQVEsQ0FBQyxpQkFBaUIsRUFBeUIsRUFBRSxDQUFDLElBQTZCLEVBQUUsRUFBRTtvQkFDN0gsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTt3QkFFMUIsOEJBQThCO3dCQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxHQUFHLEtBQUssQ0FBQzt3QkFDeEQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7NEJBQzNCLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7NEJBQ3hCLEtBQUssRUFBRSxDQUFDLHlCQUF5QixDQUFDO3lCQUNyQyxDQUFDOzZCQUNELElBQUksQ0FBQyxHQUFHLEVBQUU7NEJBQ1AsTUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7Z0NBQzNCLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7Z0NBQ3hCLEtBQUssRUFBRSxDQUFDLGlCQUFpQixDQUFDOzZCQUM3QixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQ0FDVCxJQUFJLENBQUMsV0FBVyxFQUFFO29DQUNkLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQVMsQ0FBQztvQ0FDN0UsT0FBTyxDQUFDLFdBQVcsQ0FBQztpQ0FDdkI7NEJBQ0wsQ0FBQyxDQUFDO3dCQUNOLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDckM7Z0JBQ0wsQ0FBQyxDQUFDO2dCQUVOLHlCQUF5QjthQUN4QjtpQkFBTTtnQkFDSCxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDM0IsSUFBSSxHQUFHLENBQUMsRUFBRSxJQUFJLEtBQUssRUFBRTt3QkFDakIsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7cUJBQ3JCO3lCQUFNO3dCQUNILEdBQUcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO3FCQUN0QjtnQkFDTCxDQUFDLENBQUM7YUFDTDtZQUVELE9BQU8sQ0FBQyxXQUFXLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUM7QUFDTixDQUFDO0FBRUQsdUhBQXVIO0FBQ3ZILGtKQUFrSjtBQUNsSixNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLEVBQUU7SUFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUMsRUFBRSxJQUFJLENBQUMsRUFBRTtRQUMxRCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztRQUNqQixJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQzNCLFNBQVMsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1NBQ2pEO2FBQU0sRUFBRSxjQUFjO1lBQ25CLG9CQUFvQixFQUFFO1NBQ3pCO0lBQ04sQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBR0YsaUdBQWlHO0FBQ2pHLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDekQsSUFBSSxVQUFVLENBQUMsTUFBTSxJQUFJLFVBQVUsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUMxRCxTQUFTLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQ2pDO1NBQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsY0FBYztRQUMvQyxvQkFBb0IsRUFBRTtLQUN6QjtBQUNMLENBQUMsQ0FBQyxDQUFDO0FBRUgsa0JBQWtCO0FBQ2xCLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQTJCLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxFQUFFO0lBRXZGLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyx1QkFBVyxFQUFFLENBQUMsSUFBVSxFQUFFLEVBQUU7UUFDakQsSUFBSSxXQUFXLEdBQVMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLHVCQUFXLENBQUMsQ0FBQztRQUU1RCxJQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssb0JBQVEsQ0FBQyx1QkFBdUIsRUFBRTtZQUN0RCxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLEdBQUcsSUFBSTtTQUM5RDthQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sS0FBSyxvQkFBUSxDQUFDLGVBQWUsRUFBRTtZQUNyRCxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLEdBQUcsS0FBSztTQUMvRDtRQUVELE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN6QixDQUFDLENBQUM7SUFDRixPQUFPLElBQUk7QUFDZixDQUFDLENBQUMsQ0FBQztBQUVILDJHQUEyRztBQUMzRyx1Q0FBdUM7QUFDdkMsNEJBQTRCO0FBQzVCLDJCQUEyQjtBQUMzQixpQ0FBaUM7QUFDakMsSUFBSTtBQUVKLGdEQUFnRDtBQUNoRCx5REFBeUQ7QUFDekQsOENBQThDO0FBQzlDLHlCQUF5QjtBQUN6Qix3Q0FBd0M7QUFDeEMsb0NBQW9DO0FBQ3BDLGFBQWE7QUFDYixlQUFlO0FBQ2YseUJBQXlCO0FBQ3pCLHVDQUF1QztBQUN2QyxhQUFhO0FBQ2IsUUFBUTtBQUNSLElBQUkiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leHRlbnRzaW9uLy4vbW9kZWxzL2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly9leHRlbnRzaW9uL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4dGVudHNpb24vLi9iYWNrZ3JvdW5kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBlbnVtIFBhZ2V7XHJcbiAgICBTVEFSVCxcclxuICAgIE1BSU5cclxufVxyXG5cclxuZXhwb3J0IGVudW0gTWVzc2FnZXN7XHJcbiAgICBUT0JHX1ZJREVPX09OX1NDUkVFTixcclxuICAgIFNVQ0NFU1MsXHJcbiAgICBGQUlMVVJFLFxyXG4gICAgVE9CR19DUkVBVEVfUk9PTV9JTl9UQUIsXHJcbiAgICBUT0ZHX1ZJREVPX09OX1NDUkVFTixcclxuICAgIFRPRkdfQ1JFQVRFX1JPT01fSU5fVEFCLFxyXG4gICAgVE9CR19ESVNDT05ORUNULFxyXG4gICAgVE9GR19ESVNDT05ORUNULFxyXG4gICAgVE9GR19SRVRSSUVWRV9ST09NX0RBVEEsXHJcbiAgICBUT0ZHX0RPX1lPVV9FWElTVFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgVGFic1N0b3JhZ2UgPSBcImFjdGl2ZV90YWJzX3dhdGNocGFydHlcIlxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgTWVzc2FnZXMsIFBhZ2UsIFRhYnNTdG9yYWdlIH0gZnJvbSAnLi9tb2RlbHMvY29uc3RhbnRzJ1xyXG5pbXBvcnQgeyBUYWJzLCBUYWIgfSBmcm9tICcuL21vZGVscy90YWJzJ1xyXG5pbXBvcnQgeyBNZXNzYWdlT2JqZWN0LCBSZXNwb25zZU9iamVjdCB9IGZyb20gJy4vbW9kZWxzL21lc3NhZ2VwYXNzaW5nJ1xyXG5cclxuXHJcbmNocm9tZS5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKCgpID0+IHtcclxuICAgIC8vIGRlZmF1bHQgc3RhdGUgZ29lcyBoZXJlXHJcbiAgICAvLyB0aGlzIHJ1bnMgT05FIFRJTUUgT05MWSAodW5sZXNzIHRoZSB1c2VyIHJlaW5zdGFsbHMgeW91ciBleHRlbnNpb24pXHJcblxyXG4gICAgbGV0IGluaXRpYWxUYWJzOiBUYWJzXHJcbiAgICBpbml0aWFsVGFicyA9IHt9IGFzIFRhYnNcclxuICAgIGluaXRpYWxUYWJzLnRhYnMgPSBbXVxyXG5cclxuICAgIHNldFRhYnMoaW5pdGlhbFRhYnMpXHJcbn0pO1xyXG5cclxuY29uc3Qgc2V0VGFicyA9ICh0YWJzOiBUYWJzKSA9PiB7XHJcbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoe1xyXG4gICAgICAgIFtUYWJzU3RvcmFnZV06IHRhYnNcclxuICAgIH0pO1xyXG59XHJcblxyXG5jb25zdCBzZXRBbGxUYWJzVG9JbmFjdGl2ZSA9ICgpID0+IHtcclxuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChUYWJzU3RvcmFnZSwgKGRhdGEpID0+IHtcclxuICAgICAgICBsZXQgdXBkYXRlZFRhYnM6IFRhYnMgPSBPYmplY3QuYXNzaWduKHt9LCBkYXRhW1RhYnNTdG9yYWdlXSlcclxuICAgICAgICB1cGRhdGVkVGFicy50YWJzLmZvckVhY2godGFiID0+IHRhYi5hY3RpdmUgPSBmYWxzZSlcclxuICAgICAgICBzZXRUYWJzKHVwZGF0ZWRUYWJzKVxyXG4gICAgfSlcclxufVxyXG5cclxuY29uc3QgdGFiQ2hhbmdlID0gKHRhYklkOiBudW1iZXIsIGV2ZW50OiBzdHJpbmcpID0+IHtcclxuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChUYWJzU3RvcmFnZSwgKGRhdGEpID0+IHtcclxuXHJcbiAgICAgICAgbGV0IHVwZGF0ZWRUYWJzOiBUYWJzID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YVtUYWJzU3RvcmFnZV0pXHJcblxyXG4gICAgICAgIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCB0YWJzID0+IHtcclxuXHJcbiAgICAgICAgICAgIC8vcmVtb3Zpbmcgb2xkIHRhYnMgZnJvbSBvdXIgc3RvcmFnZSBvYmogaWYgaXQgaGFzIGJlZW4gY2xvc2VkXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSB1cGRhdGVkVGFicy50YWJzLmxlbmd0aC0xOyBpPj0wOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGxldCB0YWJTdG9yYWdlOiBUYWIgPSB1cGRhdGVkVGFicy50YWJzW2ldXHJcbiAgICAgICAgICAgICAgICBpZiAodGFicy5maW5kKHRhYiA9PiB0YWIuaWQgPT0gdGFiU3RvcmFnZS5pZCkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRUYWJzLnRhYnMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL25ldyB0YWIgbm90IGluIHN0b3JhZ2VcclxuICAgICAgICAgICAgLy9zcGVjaWFsIGNhc2Ugd2hlcmUgY2hhbmdpbmcgdXJscyBvZiBhIHRhYiB0aGF0IHByZXYgaGFkIHNjcmlwdCBpbmplY3RlZCBuZWVkcyB0byBiZSBpbmplY3RlZCBhZ2FpblxyXG4gICAgICAgICAgICAvL2NhdXNlIHVybCBjaGFuZ2UgY2F1c2VzIHNjcmlwdCB0byBiZSBsb3N0XHJcbiAgICAgICAgICAgIGxldCBleGlzdGluZ1RhYiA9IGRhdGFbVGFic1N0b3JhZ2VdLnRhYnMuZmluZCh0YWIgPT4gdGFiLmlkID09PSB0YWJJZClcclxuICAgICAgICAgICAgaWYgKCFleGlzdGluZ1RhYiB8fCBldmVudCA9PT0gXCJvblVwZGF0ZWRcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCB7IG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfRE9fWU9VX0VYSVNUIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPiwgKHJlc3A6IFJlc3BvbnNlT2JqZWN0PGJvb2xlYW4+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRE9FU05UIEVYSVNUIENBTiBJTkpFQ1QgTk9XXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSU5KRUNUSU5HIEZPUkVHUk9VTkQgV0lUSCBUQUJJRDogXCIgKyB0YWJJZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hyb21lLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDogeyB0YWJJZDogdGFiSWQgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBbXCIuL3NvY2tldGlvL3NvY2tldC5pby5qc1wiXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDogeyB0YWJJZDogdGFiSWQgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogW1wiLi9mb3JlZ3JvdW5kLmpzXCJdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWV4aXN0aW5nVGFiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRUYWJzLnRhYnMucHVzaCh7IGlkOiB0YWJJZCwgY2hhbm5lbE9wZW46IGZhbHNlLCBhY3RpdmU6IHRydWUgfSBhcyBUYWIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRhYnModXBkYXRlZFRhYnMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvL2V4aXN0aW5nIHRhYiBpbiBzdG9yYWdlXHJcbiAgICAgICAgICAgIH0gZWxzZSB7IFxyXG4gICAgICAgICAgICAgICAgdXBkYXRlZFRhYnMudGFicy5mb3JFYWNoKHRhYiA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhYi5pZCA9PSB0YWJJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWIuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWIuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2V0VGFicyh1cGRhdGVkVGFicylcclxuICAgICAgICB9KTtcclxuICAgIH0pXHJcbn1cclxuXHJcbi8vZ29uZSB1c2UgdGhpcyBvbmUgZm9yIGNoYW5naW5nIHRoZSB0YWIgYi93IGV4aXN0aW5nIHRhYnMgKGluY2x1ZGVzIHdoZW4gdSBhIGNsb3NlIGEgdGFiIGFuZCB1IGF1dG8gZ28gdG8gYW5vdGhlciB0YWIpXHJcbi8vdGVjaG5pY2FsbHkgdGhpcyBvbmUgaXMgZmlyZWQgd2hlbiBjcmVhdGluZyBhIG5ldyB0YWIgdG9vIGJ1dCBpdHMga2luZGEgdXNlbGVzcyBzaW5jZSB0aGUgdXJsIGlzbnQgcmVhZHkgYXQgdGhpcyBwb2ludCBzbyBjYW50IGluamVjdCBzY3JpcHQgeWV0XHJcbmNocm9tZS50YWJzLm9uQWN0aXZhdGVkLmFkZExpc3RlbmVyKGFjdGl2ZVRhYkluZm8gPT4ge1xyXG4gICAgY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZX0sIHRhYnMgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRhYnMpXHJcbiAgICAgICAgaWYgKC9eaHR0cC8udGVzdCh0YWJzWzBdLnVybCkpIHtcclxuICAgICAgICAgICAgdGFiQ2hhbmdlKGFjdGl2ZVRhYkluZm8udGFiSWQsIFwib25BY3RpdmF0ZWRcIik7XHJcbiAgICAgICAgfSBlbHNlIHsgLy9ub24gaHR0cCB1cmxcclxuICAgICAgICAgICAgc2V0QWxsVGFic1RvSW5hY3RpdmUoKVxyXG4gICAgICAgIH1cclxuICAgfSlcclxufSlcclxuXHJcblxyXG4vL2dvbm5hIHVzZSB0aGlzIG9uZSBmb3Igd2hlbiB1IGNyZWF0ZSBhIG5ldyB0YWIsIG9yIHdoZW4geW91IGNoYW5nZSB0aGUgdXJsIG9mIHRoZSBjdXIgdGFiIHVyIG9uXHJcbmNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcigodGFiSWQsIGNoYW5nZUluZm8sIHRhYikgPT4ge1xyXG4gICAgaWYgKGNoYW5nZUluZm8uc3RhdHVzID09ICdjb21wbGV0ZScgJiYgL15odHRwLy50ZXN0KHRhYi51cmwpKSB7XHJcbiAgICAgICAgdGFiQ2hhbmdlKHRhYklkLCBcIm9uVXBkYXRlZFwiKTtcclxuICAgIH0gZWxzZSBpZiAoIS9eaHR0cC8udGVzdCh0YWIudXJsKSkgeyAvL25vdCBodHRwIHVybFxyXG4gICAgICAgIHNldEFsbFRhYnNUb0luYWN0aXZlKClcclxuICAgIH1cclxufSk7XHJcblxyXG4vLyBNZXNzYWdlIGhhbmRsZXJcclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0OiBNZXNzYWdlT2JqZWN0PGFueT4sIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcblxyXG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFRhYnNTdG9yYWdlLCAoZGF0YTogVGFicykgPT4ge1xyXG4gICAgICAgIGxldCB1cGRhdGVkVGFiczogVGFicyA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGFbVGFic1N0b3JhZ2VdKVxyXG5cclxuICAgICAgICBpZiAocmVxdWVzdC5tZXNzYWdlID09PSBNZXNzYWdlcy5UT0JHX0NSRUFURV9ST09NX0lOX1RBQikge1xyXG4gICAgICAgICAgICB1cGRhdGVkVGFicy50YWJzLmZpbmQodGFiID0+IHRhYi5hY3RpdmUpLmNoYW5uZWxPcGVuID0gdHJ1ZVxyXG4gICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5tZXNzYWdlID09PSBNZXNzYWdlcy5UT0JHX0RJU0NPTk5FQ1QpIHtcclxuICAgICAgICAgICAgdXBkYXRlZFRhYnMudGFicy5maW5kKHRhYiA9PiB0YWIuYWN0aXZlKS5jaGFubmVsT3BlbiA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZXRUYWJzKHVwZGF0ZWRUYWJzKTtcclxuICAgIH0pXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG59KTtcclxuXHJcbi8vIGNvbnN0IHN0YW5kYXJkTWVzc2FnZVRvRm9yZWdyb3VuZCA9ICh0YWJJZDogbnVtYmVyLCBtZXNzYWdlOiBNZXNzYWdlcywgcGF5bG9hZCwgY2FsbGJhY2s6IEZ1bmN0aW9uKSA9PiB7XHJcbi8vICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwge1xyXG4vLyAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXHJcbi8vICAgICAgICAgcGF5bG9hZDogcGF5bG9hZFxyXG4vLyAgICAgfSwgcmVzcCA9PiBjYWxsYmFjayhyZXNwKSlcclxuLy8gfVxyXG5cclxuLy8gLy9TZW5kIHN1Y2Nlc3Mgb3IgZmFpbHVyZSBhbmQgcGFzcyBvbiBwYXlsb2FkXHJcbi8vIGNvbnN0IHN0YW5kYXJkQ2FsbGJhY2sgPSAoc2VuZFJlc3BvbnNlKSA9PiAocmVzcCkgPT4ge1xyXG4vLyAgICAgaWYgKHJlc3Auc3RhdHVzID09PSBNZXNzYWdlcy5TVUNDRVNTKSB7XHJcbi8vICAgICAgICAgc2VuZFJlc3BvbnNlKHtcclxuLy8gICAgICAgICAgICAgc3RhdHVzOiBNZXNzYWdlcy5TVUNDRVNTLFxyXG4vLyAgICAgICAgICAgICBwYXlsb2FkOiByZXNwLnBheWxvYWRcclxuLy8gICAgICAgICB9KVxyXG4vLyAgICAgfSBlbHNlIHtcclxuLy8gICAgICAgICBzZW5kUmVzcG9uc2Uoe1xyXG4vLyAgICAgICAgICAgICBzdGF0dXM6IE1lc3NhZ2VzLkZBSUxVUkVcclxuLy8gICAgICAgICB9KVxyXG4vLyAgICAgfVxyXG4vLyB9XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==