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
    Messages[Messages["TOFG_JOIN_ROOM_IN_TAB"] = 6] = "TOFG_JOIN_ROOM_IN_TAB";
    Messages[Messages["TOBG_DISCONNECT"] = 7] = "TOBG_DISCONNECT";
    Messages[Messages["TOFG_DISCONNECT"] = 8] = "TOFG_DISCONNECT";
    Messages[Messages["TOFG_RETRIEVE_ROOM_DATA"] = 9] = "TOFG_RETRIEVE_ROOM_DATA";
    Messages[Messages["TOFG_DO_YOU_EXIST"] = 10] = "TOFG_DO_YOU_EXIST";
    Messages[Messages["TOPOPUP_LEAVE_ROOM"] = 11] = "TOPOPUP_LEAVE_ROOM";
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
                                else { //i.e url change on existing tab
                                    setTimeout(() => {
                                        chrome.runtime.sendMessage({ message: constants_1.Messages.TOPOPUP_LEAVE_ROOM });
                                    }, 500);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsSUFBWSxJQUdYO0FBSEQsV0FBWSxJQUFJO0lBQ1osaUNBQUs7SUFDTCwrQkFBSTtBQUNSLENBQUMsRUFIVyxJQUFJLEdBQUosWUFBSSxLQUFKLFlBQUksUUFHZjtBQUVELElBQVksUUFhWDtBQWJELFdBQVksUUFBUTtJQUNoQix1RUFBb0I7SUFDcEIsNkNBQU87SUFDUCw2Q0FBTztJQUNQLDZFQUF1QjtJQUN2Qix1RUFBb0I7SUFDcEIsNkVBQXVCO0lBQ3ZCLHlFQUFxQjtJQUNyQiw2REFBZTtJQUNmLDZEQUFlO0lBQ2YsNkVBQXVCO0lBQ3ZCLGtFQUFpQjtJQUNqQixvRUFBa0I7QUFDdEIsQ0FBQyxFQWJXLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBYW5CO0FBRVksbUJBQVcsR0FBRyx3QkFBd0I7Ozs7Ozs7VUNwQm5EO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7Ozs7OztBQ3RCQSwyRkFBZ0U7QUFLaEUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRTtJQUN4QywwQkFBMEI7SUFDMUIsc0VBQXNFO0lBRXRFLElBQUksV0FBaUI7SUFDckIsV0FBVyxHQUFHLEVBQVU7SUFDeEIsV0FBVyxDQUFDLElBQUksR0FBRyxFQUFFO0lBRXJCLE9BQU8sQ0FBQyxXQUFXLENBQUM7QUFDeEIsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLE9BQU8sR0FBRyxDQUFDLElBQVUsRUFBRSxFQUFFO0lBQzNCLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUNyQixDQUFDLHVCQUFXLENBQUMsRUFBRSxJQUFJO0tBQ3RCLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxNQUFNLG9CQUFvQixHQUFHLEdBQUcsRUFBRTtJQUM5QixNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsdUJBQVcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO1FBQzNDLElBQUksV0FBVyxHQUFTLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyx1QkFBVyxDQUFDLENBQUM7UUFDNUQsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNuRCxPQUFPLENBQUMsV0FBVyxDQUFDO0lBQ3hCLENBQUMsQ0FBQztBQUNOLENBQUM7QUFFRCxNQUFNLFNBQVMsR0FBRyxDQUFDLEtBQWEsRUFBRSxLQUFhLEVBQUUsRUFBRTtJQUMvQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsdUJBQVcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO1FBRTNDLElBQUksV0FBVyxHQUFTLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyx1QkFBVyxDQUFDLENBQUM7UUFFNUQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO1lBRXpCLDhEQUE4RDtZQUM5RCxLQUFLLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsRUFBRSxDQUFDLElBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMvQyxJQUFJLFVBQVUsR0FBUSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDekMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFO29CQUNuRCxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ2pDO2FBQ0o7WUFFRCx3QkFBd0I7WUFDeEIsb0dBQW9HO1lBQ3BHLDJDQUEyQztZQUMzQyxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsdUJBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQztZQUN0RSxJQUFJLENBQUMsV0FBVyxJQUFJLEtBQUssS0FBSyxXQUFXLEVBQUU7Z0JBRXZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxvQkFBUSxDQUFDLGlCQUFpQixFQUF5QixFQUFFLENBQUMsSUFBNkIsRUFBRSxFQUFFO29CQUM3SCxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFO3dCQUUxQiw4QkFBOEI7d0JBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLEdBQUcsS0FBSyxDQUFDO3dCQUN4RCxNQUFNLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQzs0QkFDM0IsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRTs0QkFDeEIsS0FBSyxFQUFFLENBQUMseUJBQXlCLENBQUM7eUJBQ3JDLENBQUM7NkJBQ0QsSUFBSSxDQUFDLEdBQUcsRUFBRTs0QkFDUCxNQUFNLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQztnQ0FDM0IsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRTtnQ0FDeEIsS0FBSyxFQUFFLENBQUMsaUJBQWlCLENBQUM7NkJBQzdCLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dDQUNULElBQUksQ0FBQyxXQUFXLEVBQUU7b0NBQ2QsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBUyxDQUFDO29DQUM3RSxPQUFPLENBQUMsV0FBVyxDQUFDO2lDQUN2QjtxQ0FBTSxFQUFFLGdDQUFnQztvQ0FDckMsVUFBVSxDQUFDLEdBQUcsRUFBRTt3Q0FDWixNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxvQkFBUSxDQUFDLGtCQUFrQixFQUF5QixDQUFDO29DQUMvRixDQUFDLEVBQUUsR0FBRyxDQUFDO2lDQUNWOzRCQUNMLENBQUMsQ0FBQzt3QkFDTixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7cUJBQ3JDO2dCQUNMLENBQUMsQ0FBQztnQkFFTix5QkFBeUI7YUFDeEI7aUJBQU07Z0JBQ0gsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQzNCLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxLQUFLLEVBQUU7d0JBQ2pCLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO3FCQUNyQjt5QkFBTTt3QkFDSCxHQUFHLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztxQkFDdEI7Z0JBQ0wsQ0FBQyxDQUFDO2FBQ0w7WUFFRCxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQ3hCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQUVELHVIQUF1SDtBQUN2SCxrSkFBa0o7QUFDbEosTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxFQUFFO0lBQ2hELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUU7UUFDMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDakIsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUMzQixTQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQztTQUNqRDthQUFNLEVBQUUsY0FBYztZQUNuQixvQkFBb0IsRUFBRTtTQUN6QjtJQUNOLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQztBQUdGLGlHQUFpRztBQUNqRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3pELElBQUksVUFBVSxDQUFDLE1BQU0sSUFBSSxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDMUQsU0FBUyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztLQUNqQztTQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLGNBQWM7UUFDL0Msb0JBQW9CLEVBQUU7S0FDekI7QUFDTCxDQUFDLENBQUMsQ0FBQztBQUVILGtCQUFrQjtBQUNsQixNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUEyQixFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsRUFBRTtJQUV2RixNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsdUJBQVcsRUFBRSxDQUFDLElBQVUsRUFBRSxFQUFFO1FBQ2pELElBQUksV0FBVyxHQUFTLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyx1QkFBVyxDQUFDLENBQUM7UUFFNUQsSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLG9CQUFRLENBQUMsdUJBQXVCLEVBQUU7WUFDdEQsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxHQUFHLElBQUk7U0FDOUQ7YUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssb0JBQVEsQ0FBQyxlQUFlLEVBQUU7WUFDckQsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxHQUFHLEtBQUs7U0FDL0Q7UUFFRCxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDekIsQ0FBQyxDQUFDO0lBQ0YsT0FBTyxJQUFJO0FBQ2YsQ0FBQyxDQUFDLENBQUM7QUFFSCwyR0FBMkc7QUFDM0csdUNBQXVDO0FBQ3ZDLDRCQUE0QjtBQUM1QiwyQkFBMkI7QUFDM0IsaUNBQWlDO0FBQ2pDLElBQUk7QUFFSixnREFBZ0Q7QUFDaEQseURBQXlEO0FBQ3pELDhDQUE4QztBQUM5Qyx5QkFBeUI7QUFDekIsd0NBQXdDO0FBQ3hDLG9DQUFvQztBQUNwQyxhQUFhO0FBQ2IsZUFBZTtBQUNmLHlCQUF5QjtBQUN6Qix1Q0FBdUM7QUFDdkMsYUFBYTtBQUNiLFFBQVE7QUFDUixJQUFJIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi8uL21vZGVscy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leHRlbnRzaW9uLy4vYmFja2dyb3VuZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBQYWdle1xyXG4gICAgU1RBUlQsXHJcbiAgICBNQUlOXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIE1lc3NhZ2Vze1xyXG4gICAgVE9CR19WSURFT19PTl9TQ1JFRU4sXHJcbiAgICBTVUNDRVNTLFxyXG4gICAgRkFJTFVSRSxcclxuICAgIFRPQkdfQ1JFQVRFX1JPT01fSU5fVEFCLFxyXG4gICAgVE9GR19WSURFT19PTl9TQ1JFRU4sXHJcbiAgICBUT0ZHX0NSRUFURV9ST09NX0lOX1RBQixcclxuICAgIFRPRkdfSk9JTl9ST09NX0lOX1RBQixcclxuICAgIFRPQkdfRElTQ09OTkVDVCxcclxuICAgIFRPRkdfRElTQ09OTkVDVCxcclxuICAgIFRPRkdfUkVUUklFVkVfUk9PTV9EQVRBLFxyXG4gICAgVE9GR19ET19ZT1VfRVhJU1QsXHJcbiAgICBUT1BPUFVQX0xFQVZFX1JPT01cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFRhYnNTdG9yYWdlID0gXCJhY3RpdmVfdGFic193YXRjaHBhcnR5XCJcclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IE1lc3NhZ2VzLCBQYWdlLCBUYWJzU3RvcmFnZSB9IGZyb20gJy4vbW9kZWxzL2NvbnN0YW50cydcclxuaW1wb3J0IHsgVGFicywgVGFiIH0gZnJvbSAnLi9tb2RlbHMvdGFicydcclxuaW1wb3J0IHsgTWVzc2FnZU9iamVjdCwgUmVzcG9uc2VPYmplY3QgfSBmcm9tICcuL21vZGVscy9tZXNzYWdlcGFzc2luZydcclxuXHJcblxyXG5jaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcigoKSA9PiB7XHJcbiAgICAvLyBkZWZhdWx0IHN0YXRlIGdvZXMgaGVyZVxyXG4gICAgLy8gdGhpcyBydW5zIE9ORSBUSU1FIE9OTFkgKHVubGVzcyB0aGUgdXNlciByZWluc3RhbGxzIHlvdXIgZXh0ZW5zaW9uKVxyXG5cclxuICAgIGxldCBpbml0aWFsVGFiczogVGFic1xyXG4gICAgaW5pdGlhbFRhYnMgPSB7fSBhcyBUYWJzXHJcbiAgICBpbml0aWFsVGFicy50YWJzID0gW11cclxuXHJcbiAgICBzZXRUYWJzKGluaXRpYWxUYWJzKVxyXG59KTtcclxuXHJcbmNvbnN0IHNldFRhYnMgPSAodGFiczogVGFicykgPT4ge1xyXG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcclxuICAgICAgICBbVGFic1N0b3JhZ2VdOiB0YWJzXHJcbiAgICB9KTtcclxufVxyXG5cclxuY29uc3Qgc2V0QWxsVGFic1RvSW5hY3RpdmUgPSAoKSA9PiB7XHJcbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoVGFic1N0b3JhZ2UsIChkYXRhKSA9PiB7XHJcbiAgICAgICAgbGV0IHVwZGF0ZWRUYWJzOiBUYWJzID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YVtUYWJzU3RvcmFnZV0pXHJcbiAgICAgICAgdXBkYXRlZFRhYnMudGFicy5mb3JFYWNoKHRhYiA9PiB0YWIuYWN0aXZlID0gZmFsc2UpXHJcbiAgICAgICAgc2V0VGFicyh1cGRhdGVkVGFicylcclxuICAgIH0pXHJcbn1cclxuXHJcbmNvbnN0IHRhYkNoYW5nZSA9ICh0YWJJZDogbnVtYmVyLCBldmVudDogc3RyaW5nKSA9PiB7XHJcbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoVGFic1N0b3JhZ2UsIChkYXRhKSA9PiB7XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVkVGFiczogVGFicyA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGFbVGFic1N0b3JhZ2VdKVxyXG5cclxuICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7fSwgdGFicyA9PiB7XHJcblxyXG4gICAgICAgICAgICAvL3JlbW92aW5nIG9sZCB0YWJzIGZyb20gb3VyIHN0b3JhZ2Ugb2JqIGlmIGl0IGhhcyBiZWVuIGNsb3NlZFxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gdXBkYXRlZFRhYnMudGFicy5sZW5ndGgtMTsgaT49MDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGFiU3RvcmFnZTogVGFiID0gdXBkYXRlZFRhYnMudGFic1tpXVxyXG4gICAgICAgICAgICAgICAgaWYgKHRhYnMuZmluZCh0YWIgPT4gdGFiLmlkID09IHRhYlN0b3JhZ2UuaWQpID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkVGFicy50YWJzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9uZXcgdGFiIG5vdCBpbiBzdG9yYWdlXHJcbiAgICAgICAgICAgIC8vc3BlY2lhbCBjYXNlIHdoZXJlIGNoYW5naW5nIHVybHMgb2YgYSB0YWIgdGhhdCBwcmV2IGhhZCBzY3JpcHQgaW5qZWN0ZWQgbmVlZHMgdG8gYmUgaW5qZWN0ZWQgYWdhaW5cclxuICAgICAgICAgICAgLy9jYXVzZSB1cmwgY2hhbmdlIGNhdXNlcyBzY3JpcHQgdG8gYmUgbG9zdFxyXG4gICAgICAgICAgICBsZXQgZXhpc3RpbmdUYWIgPSBkYXRhW1RhYnNTdG9yYWdlXS50YWJzLmZpbmQodGFiID0+IHRhYi5pZCA9PT0gdGFiSWQpXHJcbiAgICAgICAgICAgIGlmICghZXhpc3RpbmdUYWIgfHwgZXZlbnQgPT09IFwib25VcGRhdGVkXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwgeyBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0RPX1lPVV9FWElTVCB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIChyZXNwOiBSZXNwb25zZU9iamVjdDxib29sZWFuPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIERPRVNOVCBFWElTVCBDQU4gSU5KRUNUIE5PV1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIklOSkVDVElORyBGT1JFR1JPVU5EIFdJVEggVEFCSUQ6IFwiICsgdGFiSWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNocm9tZS5zY3JpcHRpbmcuZXhlY3V0ZVNjcmlwdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQ6IHRhYklkIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlczogW1wiLi9zb2NrZXRpby9zb2NrZXQuaW8uanNcIl1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hyb21lLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQ6IHRhYklkIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXM6IFtcIi4vZm9yZWdyb3VuZC5qc1wiXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFleGlzdGluZ1RhYikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkVGFicy50YWJzLnB1c2goeyBpZDogdGFiSWQsIGNoYW5uZWxPcGVuOiBmYWxzZSwgYWN0aXZlOiB0cnVlIH0gYXMgVGFiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUYWJzKHVwZGF0ZWRUYWJzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vaS5lIHVybCBjaGFuZ2Ugb24gZXhpc3RpbmcgdGFiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBtZXNzYWdlOiBNZXNzYWdlcy5UT1BPUFVQX0xFQVZFX1JPT00gfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCA1MDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IGNvbnNvbGUubG9nKGVycikpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvL2V4aXN0aW5nIHRhYiBpbiBzdG9yYWdlXHJcbiAgICAgICAgICAgIH0gZWxzZSB7IFxyXG4gICAgICAgICAgICAgICAgdXBkYXRlZFRhYnMudGFicy5mb3JFYWNoKHRhYiA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhYi5pZCA9PSB0YWJJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWIuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWIuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2V0VGFicyh1cGRhdGVkVGFicylcclxuICAgICAgICB9KTtcclxuICAgIH0pXHJcbn1cclxuXHJcbi8vZ29uZSB1c2UgdGhpcyBvbmUgZm9yIGNoYW5naW5nIHRoZSB0YWIgYi93IGV4aXN0aW5nIHRhYnMgKGluY2x1ZGVzIHdoZW4gdSBhIGNsb3NlIGEgdGFiIGFuZCB1IGF1dG8gZ28gdG8gYW5vdGhlciB0YWIpXHJcbi8vdGVjaG5pY2FsbHkgdGhpcyBvbmUgaXMgZmlyZWQgd2hlbiBjcmVhdGluZyBhIG5ldyB0YWIgdG9vIGJ1dCBpdHMga2luZGEgdXNlbGVzcyBzaW5jZSB0aGUgdXJsIGlzbnQgcmVhZHkgYXQgdGhpcyBwb2ludCBzbyBjYW50IGluamVjdCBzY3JpcHQgeWV0XHJcbmNocm9tZS50YWJzLm9uQWN0aXZhdGVkLmFkZExpc3RlbmVyKGFjdGl2ZVRhYkluZm8gPT4ge1xyXG4gICAgY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZX0sIHRhYnMgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRhYnMpXHJcbiAgICAgICAgaWYgKC9eaHR0cC8udGVzdCh0YWJzWzBdLnVybCkpIHtcclxuICAgICAgICAgICAgdGFiQ2hhbmdlKGFjdGl2ZVRhYkluZm8udGFiSWQsIFwib25BY3RpdmF0ZWRcIik7XHJcbiAgICAgICAgfSBlbHNlIHsgLy9ub24gaHR0cCB1cmxcclxuICAgICAgICAgICAgc2V0QWxsVGFic1RvSW5hY3RpdmUoKVxyXG4gICAgICAgIH1cclxuICAgfSlcclxufSlcclxuXHJcblxyXG4vL2dvbm5hIHVzZSB0aGlzIG9uZSBmb3Igd2hlbiB1IGNyZWF0ZSBhIG5ldyB0YWIsIG9yIHdoZW4geW91IGNoYW5nZSB0aGUgdXJsIG9mIHRoZSBjdXIgdGFiIHVyIG9uXHJcbmNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcigodGFiSWQsIGNoYW5nZUluZm8sIHRhYikgPT4ge1xyXG4gICAgaWYgKGNoYW5nZUluZm8uc3RhdHVzID09ICdjb21wbGV0ZScgJiYgL15odHRwLy50ZXN0KHRhYi51cmwpKSB7XHJcbiAgICAgICAgdGFiQ2hhbmdlKHRhYklkLCBcIm9uVXBkYXRlZFwiKTtcclxuICAgIH0gZWxzZSBpZiAoIS9eaHR0cC8udGVzdCh0YWIudXJsKSkgeyAvL25vdCBodHRwIHVybFxyXG4gICAgICAgIHNldEFsbFRhYnNUb0luYWN0aXZlKClcclxuICAgIH1cclxufSk7XHJcblxyXG4vLyBNZXNzYWdlIGhhbmRsZXJcclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0OiBNZXNzYWdlT2JqZWN0PGFueT4sIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcblxyXG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFRhYnNTdG9yYWdlLCAoZGF0YTogVGFicykgPT4ge1xyXG4gICAgICAgIGxldCB1cGRhdGVkVGFiczogVGFicyA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGFbVGFic1N0b3JhZ2VdKVxyXG5cclxuICAgICAgICBpZiAocmVxdWVzdC5tZXNzYWdlID09PSBNZXNzYWdlcy5UT0JHX0NSRUFURV9ST09NX0lOX1RBQikge1xyXG4gICAgICAgICAgICB1cGRhdGVkVGFicy50YWJzLmZpbmQodGFiID0+IHRhYi5hY3RpdmUpLmNoYW5uZWxPcGVuID0gdHJ1ZVxyXG4gICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5tZXNzYWdlID09PSBNZXNzYWdlcy5UT0JHX0RJU0NPTk5FQ1QpIHtcclxuICAgICAgICAgICAgdXBkYXRlZFRhYnMudGFicy5maW5kKHRhYiA9PiB0YWIuYWN0aXZlKS5jaGFubmVsT3BlbiA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZXRUYWJzKHVwZGF0ZWRUYWJzKTtcclxuICAgIH0pXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG59KTtcclxuXHJcbi8vIGNvbnN0IHN0YW5kYXJkTWVzc2FnZVRvRm9yZWdyb3VuZCA9ICh0YWJJZDogbnVtYmVyLCBtZXNzYWdlOiBNZXNzYWdlcywgcGF5bG9hZCwgY2FsbGJhY2s6IEZ1bmN0aW9uKSA9PiB7XHJcbi8vICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwge1xyXG4vLyAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXHJcbi8vICAgICAgICAgcGF5bG9hZDogcGF5bG9hZFxyXG4vLyAgICAgfSwgcmVzcCA9PiBjYWxsYmFjayhyZXNwKSlcclxuLy8gfVxyXG5cclxuLy8gLy9TZW5kIHN1Y2Nlc3Mgb3IgZmFpbHVyZSBhbmQgcGFzcyBvbiBwYXlsb2FkXHJcbi8vIGNvbnN0IHN0YW5kYXJkQ2FsbGJhY2sgPSAoc2VuZFJlc3BvbnNlKSA9PiAocmVzcCkgPT4ge1xyXG4vLyAgICAgaWYgKHJlc3Auc3RhdHVzID09PSBNZXNzYWdlcy5TVUNDRVNTKSB7XHJcbi8vICAgICAgICAgc2VuZFJlc3BvbnNlKHtcclxuLy8gICAgICAgICAgICAgc3RhdHVzOiBNZXNzYWdlcy5TVUNDRVNTLFxyXG4vLyAgICAgICAgICAgICBwYXlsb2FkOiByZXNwLnBheWxvYWRcclxuLy8gICAgICAgICB9KVxyXG4vLyAgICAgfSBlbHNlIHtcclxuLy8gICAgICAgICBzZW5kUmVzcG9uc2Uoe1xyXG4vLyAgICAgICAgICAgICBzdGF0dXM6IE1lc3NhZ2VzLkZBSUxVUkVcclxuLy8gICAgICAgICB9KVxyXG4vLyAgICAgfVxyXG4vLyB9XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==