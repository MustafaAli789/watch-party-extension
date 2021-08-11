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
/*!******************!*\
  !*** ./popup.ts ***!
  \******************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const constants_1 = __webpack_require__(/*! ./models/constants */ "./models/constants.ts");
let localUsers = [];
//Containers
const startPage = document.querySelector("#startPage");
const mainPage = document.querySelector("#mainPage");
const header = document.querySelector("#header");
const usersListContainer = document.querySelector("#mainPage .users .usersList");
//Bttons
const newRoomBtn = document.querySelector("#startPage .addItemContainer .newRoomBtn");
const joinRoomBtn = document.querySelector("#startPage .addItemContainer .joinRoomBtn");
const leaveRoomBtn = document.querySelector("#mainPage .backBtn");
const copyImgBtn = document.querySelector("#mainPage .roomIdContainer .copyImgBtn");
const syncBtn = document.querySelector("#mainPage .actions .actionBtns .syncBtn");
//Inputs
const nameInput = document.querySelector("#startPage .addItemContainer .nameInput");
const roomNameInput = document.querySelector("#startPage .addItemContainer .roomInput");
//Text
const errorMsgElem = document.querySelector("#startPage .addItemContainer .error");
const roomIdElem = document.querySelector('#mainPage .roomIdContainer .roomId');
const roomNameElem = document.querySelector("#mainPage .head .roomName");
//Initial open of popup
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    let activeTabId = tabs[0].id;
    let pageMetadata = { roomName: "", pageType: constants_1.Page.START };
    chrome.tabs.sendMessage(activeTabId, {
        message: constants_1.Messages.TOFG_IS_CHANNEL_OPEN
    }, (resp) => {
        if (resp.status == constants_1.Messages.SUCCESS && resp.payload) {
            chrome.tabs.sendMessage(activeTabId, {
                message: constants_1.Messages.TOFG_RETRIEVE_ROOM_DATA
            }, (resp) => {
                pageMetadata.roomId = resp.payload.room.roomId;
                pageMetadata.roomName = resp.payload.room.roomName;
                pageMetadata.pageType = constants_1.Page.MAIN;
                updateMainUsers(resp.payload.room.users);
                changePage(pageMetadata);
            });
        }
    });
    changePage(pageMetadata);
});
const validRoomInput = () => {
    if (roomNameInput.value.trim() === "") {
        errorMsgElem.classList.remove('hidden');
        errorMsgElem.innerHTML = 'Please enter a room/id';
        return false;
    }
    else {
        errorMsgElem.classList.add('hidden');
        errorMsgElem.innerHTML = '';
        return true;
    }
};
newRoomBtn.addEventListener('click', _ => {
    createNewRoomWithValidation();
});
joinRoomBtn.addEventListener('click', e => {
    joinRoomWithValidation();
});
leaveRoomBtn.addEventListener('click', _ => {
    leaveRoom();
});
syncBtn.addEventListener('click', () => {
    if (localUsers.length === 1) {
        return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        let activeTabId = tabs[0].id;
        chrome.tabs.sendMessage(activeTabId, {
            message: constants_1.Messages.TOFG_IS_CHANNEL_OPEN
        }, (resp) => {
            if (resp.status == constants_1.Messages.SUCCESS && resp.payload) {
                chrome.tabs.sendMessage(activeTabId, {
                    message: constants_1.Messages.TOFG_SYNC_VID
                });
            }
        });
    });
});
const leaveRoom = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        let activeTabId = tabs[0].id;
        chrome.tabs.sendMessage(activeTabId, {
            message: constants_1.Messages.TOFG_IS_CHANNEL_OPEN
        }, (resp) => {
            if (resp.status == constants_1.Messages.SUCCESS && resp.payload) {
                chrome.tabs.sendMessage(activeTabId, {
                    message: constants_1.Messages.TOFG_DISCONNECT
                });
            }
        });
        changePage({ pageType: constants_1.Page.START, roomId: null, roomName: "" });
    });
};
copyImgBtn.addEventListener('click', () => {
    let roomIdVal = roomIdElem.innerHTML;
    navigator.clipboard.writeText(roomIdVal).then(() => {
    }, () => {
        //Failed to copy
    });
});
const joinRoomWithValidation = () => {
    let messageObject = {
        message: constants_1.Messages.TOFG_JOIN_ROOM_IN_TAB,
        payload: {
            roomId: roomNameInput.value.trim(),
            userName: nameInput.value
        }
    };
    goIntoRoomWithValidation(messageObject);
};
const createNewRoomWithValidation = () => {
    let messageObject = {
        message: constants_1.Messages.TOFG_CREATE_ROOM_IN_TAB,
        payload: {
            roomName: roomNameInput.value.trim(),
            userName: nameInput.value
        }
    };
    goIntoRoomWithValidation(messageObject);
};
const goIntoRoomWithValidation = (messageObject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        let activeTabId = tabs[0].id;
        chrome.tabs.sendMessage(activeTabId, { message: constants_1.Messages.TOFG_VIDEO_ON_SCREEN }, (resp) => {
            if (resp.status === constants_1.Messages.SUCCESS && resp.payload && validRoomInput()) {
                chrome.tabs.sendMessage(activeTabId, messageObject, (resp) => {
                    if (resp.status === constants_1.Messages.SUCCESS) {
                        changePage({ pageType: constants_1.Page.MAIN, roomId: resp.payload.room.roomId, roomName: resp.payload.room.roomName });
                        updateMainUsers(resp.payload.room.users);
                    }
                });
            }
        });
    });
};
const changePage = (pageMetadata) => {
    if (pageMetadata.pageType === constants_1.Page.START) {
        startPage.classList.remove('hidden');
        mainPage.classList.add('hidden');
        header.classList.remove('hidden');
        roomNameInput.value = pageMetadata.roomName;
        nameInput.value = "";
    }
    else if (pageMetadata.pageType === constants_1.Page.MAIN) {
        startPage.classList.add('hidden');
        mainPage.classList.remove('hidden');
        header.classList.add('hidden');
        roomNameElem.innerHTML = `${pageMetadata.roomName}`;
        roomIdElem.innerHTML = `${pageMetadata.roomId}`;
    }
};
const updateMainUsers = (users) => {
    localUsers = users;
    if (localUsers.length === 1) {
        syncBtn.classList.add("disabledBtn");
    }
    else {
        syncBtn.classList.remove("disabledBtn");
    }
    usersListContainer.innerHTML = "";
    users.forEach(user => {
        let userElem = document.createElement("DIV");
        userElem.classList.add("userElem");
        if (!!user.current) {
            userElem.classList.add("currentUser");
        }
        let userIcon = (user.admin ? "<img class='userIcon' src='../images/adminUser.png' alt='adminuser'>" : "<img class='userIcon' src='../images/user.png' alt='normaluser'>");
        let userName = (!!user.current ? `<strong>${user.userName}</strong>` : `${user.userName}`);
        userElem.innerHTML = userIcon + `<span style="margin-left:5px">${userName}</span>`;
        usersListContainer.append(userElem);
    });
};
// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('getting request here');
    //Check below is important b/c if we have multiple popups open in diff windows, we dont want all reacting to same event
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        var _a;
        let curActiveTabId = tabs[0].id;
        if (((_a = sender.tab) === null || _a === void 0 ? void 0 : _a.id) === curActiveTabId && request.message === constants_1.Messages.TOPOPUP_ROOM_DATA) {
            let reqData = request.payload;
            updateMainUsers(reqData.room.users);
        }
        else if (request.message === constants_1.Messages.TOPOPUP_LEAVE_ROOM) {
            let senderTabId = request.payload.tabId;
            if (senderTabId === curActiveTabId) {
                leaveRoom();
            }
        }
    });
    return true;
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDO0lBQ25DLHVIQUF1SDtJQUN2SCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDLElBQUksRUFBQyxFQUFFLElBQUksQ0FBQyxFQUFFOztRQUN6RCxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUMvQixJQUFJLGFBQU0sQ0FBQyxHQUFHLDBDQUFFLEVBQUUsTUFBSyxjQUFjLElBQUksT0FBTyxDQUFDLE9BQU8sS0FBSyxvQkFBUSxDQUFDLGlCQUFpQixFQUFFO1lBQ3JGLElBQUksT0FBTyxHQUF1QixPQUFPLENBQUMsT0FBTztZQUNqRCxlQUFlLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7U0FDdEM7YUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssb0JBQVEsQ0FBQyxrQkFBa0IsRUFBRTtZQUN4RCxJQUFJLFdBQVcsR0FBNEIsT0FBTyxDQUFDLE9BQVEsQ0FBQyxLQUFLO1lBQ2pFLElBQUksV0FBVyxLQUFLLGNBQWMsRUFBRTtnQkFDaEMsU0FBUyxFQUFFO2FBQ2Q7U0FDSjtJQUNMLENBQUMsQ0FBQztJQUNGLE9BQU8sSUFBSTtBQUNmLENBQUMsQ0FBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi8uL21vZGVscy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leHRlbnRzaW9uLy4vcG9wdXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGVudW0gUGFnZXtcclxuICAgIFNUQVJULFxyXG4gICAgTUFJTlxyXG59XHJcblxyXG5leHBvcnQgZW51bSBNZXNzYWdlc3tcclxuICAgIFNVQ0NFU1MsXHJcbiAgICBGQUlMVVJFLFxyXG4gICAgVE9GR19WSURFT19PTl9TQ1JFRU4sXHJcbiAgICBUT0ZHX0NSRUFURV9ST09NX0lOX1RBQixcclxuICAgIFRPRkdfSk9JTl9ST09NX0lOX1RBQixcclxuICAgIFRPRkdfRElTQ09OTkVDVCxcclxuICAgIFRPRkdfUkVUUklFVkVfUk9PTV9EQVRBLFxyXG4gICAgVE9GR19ET19ZT1VfRVhJU1QsXHJcbiAgICBUT0ZHX1NZTkNfVklELFxyXG4gICAgVE9QT1BVUF9MRUFWRV9ST09NLFxyXG4gICAgVE9QT1BVUF9ST09NX0RBVEEsXHJcbiAgICBUT0JHX1VTRVJfQ09OTkVDVEVELFxyXG4gICAgVE9GR19JU19DSEFOTkVMX09QRU4sXHJcbiAgICBUT0JHX1VTRVJfRElTQ09OTkVDVEVEXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBUYWJzU3RvcmFnZSA9IFwiYWN0aXZlX3RhYnNfd2F0Y2hwYXJ0eVwiXHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJpbXBvcnQgeyBNZXNzYWdlcywgUGFnZSB9IGZyb20gJy4vbW9kZWxzL2NvbnN0YW50cydcclxuaW1wb3J0IHsgVG9GZ0pvaW5Sb29tUGF5bG9hZCwgVG9GZ05ld1Jvb21QYXlsb2FkLCBUb1BvcHVwUm9vbVBheWxvYWQsIFRvRmdTZW5kZXJUYWJJZFBheWxvYWQgfSBmcm9tICcuL21vZGVscy9wYXlsb2Fkcyc7XHJcbmltcG9ydCB7IE1lc3NhZ2VPYmplY3QsIFJlc3BvbnNlT2JqZWN0LCAgfSBmcm9tICcuL21vZGVscy9tZXNzYWdlcGFzc2luZyc7XHJcbmltcG9ydCB7IFBhZ2VNZXRhZGF0YSB9IGZyb20gJy4vbW9kZWxzL3BhZ2VtZXRhZGF0YSc7XHJcblxyXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi4vc2hhcmVkbW9kZWxzL3VzZXInXHJcbmltcG9ydCB7ICB9IGZyb20gJy4uL3NoYXJlZG1vZGVscy9wYXlsb2FkcydcclxuXHJcbmxldCBsb2NhbFVzZXJzOiBVc2VyW10gPSBbXVxyXG5cclxuLy9Db250YWluZXJzXHJcbmNvbnN0IHN0YXJ0UGFnZTogSFRNTERpdkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UGFnZVwiKTtcclxuY29uc3QgbWFpblBhZ2U6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZVwiKTtcclxuY29uc3QgaGVhZGVyOiBIVE1MRGl2RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaGVhZGVyXCIpO1xyXG5jb25zdCB1c2Vyc0xpc3RDb250YWluZXI6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAudXNlcnMgLnVzZXJzTGlzdFwiKTtcclxuXHJcbi8vQnR0b25zXHJcbmNvbnN0IG5ld1Jvb21CdG46IEhUTUxCdXR0b25FbGVtZW50ID0gPEhUTUxCdXR0b25FbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRQYWdlIC5hZGRJdGVtQ29udGFpbmVyIC5uZXdSb29tQnRuXCIpO1xyXG5jb25zdCBqb2luUm9vbUJ0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFBhZ2UgLmFkZEl0ZW1Db250YWluZXIgLmpvaW5Sb29tQnRuXCIpO1xyXG5jb25zdCBsZWF2ZVJvb21CdG46IEhUTUxCdXR0b25FbGVtZW50ID0gPEhUTUxCdXR0b25FbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblBhZ2UgLmJhY2tCdG5cIik7XHJcbmNvbnN0IGNvcHlJbWdCdG46IEhUTUxCdXR0b25FbGVtZW50ID0gPEhUTUxCdXR0b25FbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblBhZ2UgLnJvb21JZENvbnRhaW5lciAuY29weUltZ0J0blwiKTtcclxuY29uc3Qgc3luY0J0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW5QYWdlIC5hY3Rpb25zIC5hY3Rpb25CdG5zIC5zeW5jQnRuXCIpXHJcblxyXG4vL0lucHV0c1xyXG5jb25zdCBuYW1lSW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UGFnZSAuYWRkSXRlbUNvbnRhaW5lciAubmFtZUlucHV0XCIpO1xyXG5jb25zdCByb29tTmFtZUlucHV0OiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFBhZ2UgLmFkZEl0ZW1Db250YWluZXIgLnJvb21JbnB1dFwiKTtcclxuXHJcbi8vVGV4dFxyXG5jb25zdCBlcnJvck1zZ0VsZW06IEhUTUxQYXJhZ3JhcGhFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFBhZ2UgLmFkZEl0ZW1Db250YWluZXIgLmVycm9yXCIpO1xyXG5jb25zdCByb29tSWRFbGVtOiBIVE1MU3BhbkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpblBhZ2UgLnJvb21JZENvbnRhaW5lciAucm9vbUlkJyk7XHJcbmNvbnN0IHJvb21OYW1lRWxlbTogSFRNTEhlYWRpbmdFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAuaGVhZCAucm9vbU5hbWVcIik7XHJcblxyXG5cclxuLy9Jbml0aWFsIG9wZW4gb2YgcG9wdXBcclxuY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTp0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlfSwgdGFicyA9PiB7XHJcbiAgICBsZXQgYWN0aXZlVGFiSWQgPSB0YWJzWzBdLmlkXHJcbiAgICBsZXQgcGFnZU1ldGFkYXRhOiBQYWdlTWV0YWRhdGEgPSA8UGFnZU1ldGFkYXRhPntyb29tTmFtZTogXCJcIiwgcGFnZVR5cGU6IFBhZ2UuU1RBUlR9XHJcblxyXG4gICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0lTX0NIQU5ORUxfT1BFTlxyXG4gICAgfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8Ym9vbGVhbj4pID0+IHtcclxuICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT0gTWVzc2FnZXMuU1VDQ0VTUyAmJiByZXNwLnBheWxvYWQpIHtcclxuICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfUkVUUklFVkVfUk9PTV9EQVRBXHJcbiAgICAgICAgICAgIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPiwgKHJlc3A6IFJlc3BvbnNlT2JqZWN0PFRvUG9wdXBSb29tUGF5bG9hZD4pID0+IHtcclxuICAgICAgICAgICAgICAgIHBhZ2VNZXRhZGF0YS5yb29tSWQgPSByZXNwLnBheWxvYWQucm9vbS5yb29tSWRcclxuICAgICAgICAgICAgICAgIHBhZ2VNZXRhZGF0YS5yb29tTmFtZSA9IHJlc3AucGF5bG9hZC5yb29tLnJvb21OYW1lXHJcbiAgICAgICAgICAgICAgICBwYWdlTWV0YWRhdGEucGFnZVR5cGUgPSBQYWdlLk1BSU5cclxuICAgICAgICAgICAgICAgIHVwZGF0ZU1haW5Vc2VycyhyZXNwLnBheWxvYWQucm9vbS51c2VycylcclxuICAgICAgICAgICAgICAgIGNoYW5nZVBhZ2UocGFnZU1ldGFkYXRhKVxyXG4gICAgICAgICAgICB9KSBcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIGNoYW5nZVBhZ2UocGFnZU1ldGFkYXRhKTtcclxufSlcclxuXHJcbmNvbnN0IHZhbGlkUm9vbUlucHV0ID0gKCkgPT4ge1xyXG4gICAgaWYocm9vbU5hbWVJbnB1dC52YWx1ZS50cmltKCkgPT09IFwiXCIpIHtcclxuICAgICAgICBlcnJvck1zZ0VsZW0uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgZXJyb3JNc2dFbGVtLmlubmVySFRNTCA9ICdQbGVhc2UgZW50ZXIgYSByb29tL2lkJztcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVycm9yTXNnRWxlbS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgICBlcnJvck1zZ0VsZW0uaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbm5ld1Jvb21CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfID0+IHtcclxuICAgIGNyZWF0ZU5ld1Jvb21XaXRoVmFsaWRhdGlvbigpO1xyXG59KVxyXG5cclxuam9pblJvb21CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcclxuICAgIGpvaW5Sb29tV2l0aFZhbGlkYXRpb24oKVxyXG59KVxyXG5cclxubGVhdmVSb29tQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXyA9PiB7XHJcbiAgICBsZWF2ZVJvb20oKVxyXG59KVxyXG5cclxuc3luY0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGlmIChsb2NhbFVzZXJzLmxlbmd0aCA9PT0gMSl7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOnRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICBsZXQgYWN0aXZlVGFiSWQgPSB0YWJzWzBdLmlkXHJcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19JU19DSEFOTkVMX09QRU5cclxuICAgICAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIChyZXNwOiBSZXNwb25zZU9iamVjdDxib29sZWFuPikgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT0gTWVzc2FnZXMuU1VDQ0VTUyAmJiByZXNwLnBheWxvYWQpIHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19TWU5DX1ZJRFxyXG4gICAgICAgICAgICAgICAgfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcbn0pXHJcblxyXG5jb25zdCBsZWF2ZVJvb20gPSAoKSA9PiB7XHJcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOnRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICBsZXQgYWN0aXZlVGFiSWQgPSB0YWJzWzBdLmlkXHJcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19JU19DSEFOTkVMX09QRU5cclxuICAgICAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIChyZXNwOiBSZXNwb25zZU9iamVjdDxib29sZWFuPikgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT0gTWVzc2FnZXMuU1VDQ0VTUyAmJiByZXNwLnBheWxvYWQpIHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19ESVNDT05ORUNUXHJcbiAgICAgICAgICAgICAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIGNoYW5nZVBhZ2UoeyBwYWdlVHlwZTogUGFnZS5TVEFSVCwgcm9vbUlkOiBudWxsLCByb29tTmFtZTogXCJcIiB9KVxyXG4gICAgfSlcclxufVxyXG5cclxuY29weUltZ0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGxldCByb29tSWRWYWwgPSByb29tSWRFbGVtLmlubmVySFRNTFxyXG4gICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQocm9vbUlkVmFsKS50aGVuKCgpID0+IHtcclxuICAgIH0sICgpID0+IHtcclxuICAgICAgICAvL0ZhaWxlZCB0byBjb3B5XHJcbiAgICB9KVxyXG59KVxyXG5cclxuY29uc3Qgam9pblJvb21XaXRoVmFsaWRhdGlvbiA9ICgpID0+IHtcclxuICAgIGxldCBtZXNzYWdlT2JqZWN0OiBNZXNzYWdlT2JqZWN0PFRvRmdKb2luUm9vbVBheWxvYWQ+ID0geyBcclxuICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0pPSU5fUk9PTV9JTl9UQUIsIFxyXG4gICAgICAgIHBheWxvYWQ6IHtcclxuICAgICAgICAgICAgcm9vbUlkOiByb29tTmFtZUlucHV0LnZhbHVlLnRyaW0oKSwgXHJcbiAgICAgICAgICAgIHVzZXJOYW1lOiBuYW1lSW5wdXQudmFsdWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnb0ludG9Sb29tV2l0aFZhbGlkYXRpb24obWVzc2FnZU9iamVjdClcclxufVxyXG5cclxuY29uc3QgY3JlYXRlTmV3Um9vbVdpdGhWYWxpZGF0aW9uID0gKCkgPT4ge1xyXG4gICAgbGV0IG1lc3NhZ2VPYmplY3Q6IE1lc3NhZ2VPYmplY3Q8VG9GZ05ld1Jvb21QYXlsb2FkPiA9IHsgXHJcbiAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19DUkVBVEVfUk9PTV9JTl9UQUIsIFxyXG4gICAgICAgIHBheWxvYWQ6IHtcclxuICAgICAgICAgICAgcm9vbU5hbWU6IHJvb21OYW1lSW5wdXQudmFsdWUudHJpbSgpLCBcclxuICAgICAgICAgICAgdXNlck5hbWU6IG5hbWVJbnB1dC52YWx1ZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdvSW50b1Jvb21XaXRoVmFsaWRhdGlvbihtZXNzYWdlT2JqZWN0KVxyXG59XHJcblxyXG5jb25zdCBnb0ludG9Sb29tV2l0aFZhbGlkYXRpb24gPSAobWVzc2FnZU9iamVjdDogTWVzc2FnZU9iamVjdDxhbnk+KSA9PiB7XHJcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOnRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICBsZXQgYWN0aXZlVGFiSWQ6IG51bWJlciA9IHRhYnNbMF0uaWQ7XHJcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHsgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19WSURFT19PTl9TQ1JFRU4gfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8Ym9vbGVhbj4pID0+IHtcclxuICAgICAgICAgICAgaWYgKHJlc3Auc3RhdHVzID09PSBNZXNzYWdlcy5TVUNDRVNTICYmIHJlc3AucGF5bG9hZCAmJiB2YWxpZFJvb21JbnB1dCgpKSB7IFxyXG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIG1lc3NhZ2VPYmplY3QsIChyZXNwOiBSZXNwb25zZU9iamVjdDxUb1BvcHVwUm9vbVBheWxvYWQ+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3Auc3RhdHVzID09PSBNZXNzYWdlcy5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZVBhZ2UoIHsgcGFnZVR5cGU6IFBhZ2UuTUFJTiwgcm9vbUlkOiByZXNwLnBheWxvYWQucm9vbS5yb29tSWQsIHJvb21OYW1lOiByZXNwLnBheWxvYWQucm9vbS5yb29tTmFtZSB9IGFzIFBhZ2VNZXRhZGF0YSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTWFpblVzZXJzKHJlc3AucGF5bG9hZC5yb29tLnVzZXJzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfSlcclxufVxyXG5cclxuY29uc3QgY2hhbmdlUGFnZSA9IChwYWdlTWV0YWRhdGE6IFBhZ2VNZXRhZGF0YSkgPT4ge1xyXG4gICAgaWYgKHBhZ2VNZXRhZGF0YS5wYWdlVHlwZSA9PT0gUGFnZS5TVEFSVCkge1xyXG4gICAgICAgIHN0YXJ0UGFnZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICBtYWluUGFnZS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgICBoZWFkZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgcm9vbU5hbWVJbnB1dC52YWx1ZSA9IHBhZ2VNZXRhZGF0YS5yb29tTmFtZTtcclxuICAgICAgICBuYW1lSW5wdXQudmFsdWUgPSBcIlwiO1xyXG4gICAgfSBlbHNlIGlmIChwYWdlTWV0YWRhdGEucGFnZVR5cGUgPT09IFBhZ2UuTUFJTikge1xyXG4gICAgICAgIHN0YXJ0UGFnZS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgICBtYWluUGFnZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICBoZWFkZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgIHJvb21OYW1lRWxlbS5pbm5lckhUTUwgPSAgYCR7cGFnZU1ldGFkYXRhLnJvb21OYW1lfWA7XHJcbiAgICAgICAgcm9vbUlkRWxlbS5pbm5lckhUTUwgPSBgJHtwYWdlTWV0YWRhdGEucm9vbUlkfWA7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCB1cGRhdGVNYWluVXNlcnMgPSAodXNlcnM6IEFycmF5PFVzZXI+KSA9PiB7XHJcbiAgICBsb2NhbFVzZXJzID0gdXNlcnNcclxuICAgIFxyXG4gICAgaWYgKGxvY2FsVXNlcnMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgc3luY0J0bi5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZWRCdG5cIilcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc3luY0J0bi5jbGFzc0xpc3QucmVtb3ZlKFwiZGlzYWJsZWRCdG5cIilcclxuICAgIH1cclxuXHJcbiAgICB1c2Vyc0xpc3RDb250YWluZXIuaW5uZXJIVE1MID0gXCJcIlxyXG4gICAgdXNlcnMuZm9yRWFjaCh1c2VyID0+IHtcclxuICAgICAgICBsZXQgdXNlckVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiRElWXCIpO1xyXG4gICAgICAgIHVzZXJFbGVtLmNsYXNzTGlzdC5hZGQoXCJ1c2VyRWxlbVwiKTtcclxuICAgICAgICBpZiAoISF1c2VyLmN1cnJlbnQpIHtcclxuICAgICAgICAgICAgdXNlckVsZW0uY2xhc3NMaXN0LmFkZChcImN1cnJlbnRVc2VyXCIpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB1c2VySWNvbiA9ICh1c2VyLmFkbWluID8gXCI8aW1nIGNsYXNzPSd1c2VySWNvbicgc3JjPScuLi9pbWFnZXMvYWRtaW5Vc2VyLnBuZycgYWx0PSdhZG1pbnVzZXInPlwiIDogXCI8aW1nIGNsYXNzPSd1c2VySWNvbicgc3JjPScuLi9pbWFnZXMvdXNlci5wbmcnIGFsdD0nbm9ybWFsdXNlcic+XCIpXHJcbiAgICAgICAgbGV0IHVzZXJOYW1lID0gKCEhdXNlci5jdXJyZW50ID8gYDxzdHJvbmc+JHt1c2VyLnVzZXJOYW1lfTwvc3Ryb25nPmAgOiBgJHt1c2VyLnVzZXJOYW1lfWApXHJcbiAgICAgICAgdXNlckVsZW0uaW5uZXJIVE1MID0gdXNlckljb24rYDxzcGFuIHN0eWxlPVwibWFyZ2luLWxlZnQ6NXB4XCI+JHt1c2VyTmFtZX08L3NwYW4+YDtcclxuICAgICAgICB1c2Vyc0xpc3RDb250YWluZXIuYXBwZW5kKHVzZXJFbGVtKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vLyBNZXNzYWdlIGhhbmRsZXJcclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0OiBNZXNzYWdlT2JqZWN0PGFueT4sIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnZ2V0dGluZyByZXF1ZXN0IGhlcmUnKVxyXG4gICAgLy9DaGVjayBiZWxvdyBpcyBpbXBvcnRhbnQgYi9jIGlmIHdlIGhhdmUgbXVsdGlwbGUgcG9wdXBzIG9wZW4gaW4gZGlmZiB3aW5kb3dzLCB3ZSBkb250IHdhbnQgYWxsIHJlYWN0aW5nIHRvIHNhbWUgZXZlbnRcclxuICAgIGNocm9tZS50YWJzLnF1ZXJ5KHthY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6dHJ1ZX0sIHRhYnMgPT4ge1xyXG4gICAgICAgIGxldCBjdXJBY3RpdmVUYWJJZCA9IHRhYnNbMF0uaWRcclxuICAgICAgICBpZiAoc2VuZGVyLnRhYj8uaWQgPT09IGN1ckFjdGl2ZVRhYklkICYmIHJlcXVlc3QubWVzc2FnZSA9PT0gTWVzc2FnZXMuVE9QT1BVUF9ST09NX0RBVEEpIHtcclxuICAgICAgICAgICAgbGV0IHJlcURhdGEgPSA8VG9Qb3B1cFJvb21QYXlsb2FkPnJlcXVlc3QucGF5bG9hZFxyXG4gICAgICAgICAgICB1cGRhdGVNYWluVXNlcnMocmVxRGF0YS5yb29tLnVzZXJzKVxyXG4gICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5tZXNzYWdlID09PSBNZXNzYWdlcy5UT1BPUFVQX0xFQVZFX1JPT00pIHtcclxuICAgICAgICAgICAgbGV0IHNlbmRlclRhYklkID0gKDxUb0ZnU2VuZGVyVGFiSWRQYXlsb2FkPnJlcXVlc3QucGF5bG9hZCkudGFiSWRcclxuICAgICAgICAgICAgaWYgKHNlbmRlclRhYklkID09PSBjdXJBY3RpdmVUYWJJZCkge1xyXG4gICAgICAgICAgICAgICAgbGVhdmVSb29tKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG59KTtcclxuXHJcblxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=