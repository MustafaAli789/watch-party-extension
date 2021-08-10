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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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dUg7SUFDdkgsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBQyxJQUFJLEVBQUMsRUFBRSxJQUFJLENBQUMsRUFBRTs7UUFDekQsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDL0IsSUFBSSxhQUFNLENBQUMsR0FBRywwQ0FBRSxFQUFFLE1BQUssY0FBYyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssb0JBQVEsQ0FBQyxpQkFBaUIsRUFBRTtZQUNyRixJQUFJLE9BQU8sR0FBeUIsT0FBTyxDQUFDLE9BQU87WUFDbkQsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQ3RDO2FBQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLG9CQUFRLENBQUMsa0JBQWtCLEVBQUU7WUFDeEQsSUFBSSxXQUFXLEdBQWlDLE9BQU8sQ0FBQyxPQUFRLENBQUMsS0FBSztZQUN0RSxJQUFJLFdBQVcsS0FBSyxjQUFjLEVBQUU7Z0JBQ2hDLFNBQVMsRUFBRTthQUNkO1NBQ0o7SUFDTCxDQUFDLENBQUM7SUFDRixPQUFPLElBQUk7QUFDZixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2V4dGVudHNpb24vLi9tb2RlbHMvY29uc3RhbnRzLnRzIiwid2VicGFjazovL2V4dGVudHNpb24vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi8uL3BvcHVwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBlbnVtIFBhZ2V7XHJcbiAgICBTVEFSVCxcclxuICAgIE1BSU5cclxufVxyXG5cclxuZXhwb3J0IGVudW0gTWVzc2FnZXN7XHJcbiAgICBTVUNDRVNTLFxyXG4gICAgRkFJTFVSRSxcclxuICAgIFRPRkdfVklERU9fT05fU0NSRUVOLFxyXG4gICAgVE9GR19DUkVBVEVfUk9PTV9JTl9UQUIsXHJcbiAgICBUT0ZHX0pPSU5fUk9PTV9JTl9UQUIsXHJcbiAgICBUT0ZHX0RJU0NPTk5FQ1QsXHJcbiAgICBUT0ZHX1JFVFJJRVZFX1JPT01fREFUQSxcclxuICAgIFRPRkdfRE9fWU9VX0VYSVNULFxyXG4gICAgVE9GR19TWU5DX1ZJRCxcclxuICAgIFRPUE9QVVBfTEVBVkVfUk9PTSxcclxuICAgIFRPUE9QVVBfUk9PTV9EQVRBLFxyXG4gICAgVE9CR19VU0VSX0NPTk5FQ1RFRCxcclxuICAgIFRPRkdfSVNfQ0hBTk5FTF9PUEVOLFxyXG4gICAgVE9CR19VU0VSX0RJU0NPTk5FQ1RFRFxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgVGFic1N0b3JhZ2UgPSBcImFjdGl2ZV90YWJzX3dhdGNocGFydHlcIlxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgTWVzc2FnZXMsIFBhZ2UgfSBmcm9tICcuL21vZGVscy9jb25zdGFudHMnXHJcbmltcG9ydCB7IEV4dGVuc2lvbkpvaW5Sb29tUGF5bG9hZCwgRXh0ZW5zaW9uTmV3Um9vbVBheWxvYWQsIEV4dGVuc2lvblJvb21QYXlsb2FkLCBFeHRlbnNpb25TZW5kZXJUYWJJZFBheWxvYWQsIEV4dGVuc2lvblVzZXJDaGFuZ2VQYXlsb2FkIH0gZnJvbSAnLi9tb2RlbHMvcGF5bG9hZHMnO1xyXG5pbXBvcnQgeyBNZXNzYWdlT2JqZWN0LCBSZXNwb25zZU9iamVjdCwgIH0gZnJvbSAnLi9tb2RlbHMvbWVzc2FnZXBhc3NpbmcnO1xyXG5pbXBvcnQgeyBQYWdlTWV0YWRhdGEgfSBmcm9tICcuL21vZGVscy9wYWdlbWV0YWRhdGEnO1xyXG5cclxuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4uL3NoYXJlZG1vZGVscy91c2VyJ1xyXG5pbXBvcnQgeyAgfSBmcm9tICcuLi9zaGFyZWRtb2RlbHMvcGF5bG9hZHMnXHJcblxyXG5sZXQgbG9jYWxVc2VyczogVXNlcltdID0gW11cclxuXHJcbi8vQ29udGFpbmVyc1xyXG5jb25zdCBzdGFydFBhZ2U6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFBhZ2VcIik7XHJcbmNvbnN0IG1haW5QYWdlOiBIVE1MRGl2RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblBhZ2VcIik7XHJcbmNvbnN0IGhlYWRlcjogSFRNTERpdkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2hlYWRlclwiKTtcclxuY29uc3QgdXNlcnNMaXN0Q29udGFpbmVyOiBIVE1MRGl2RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblBhZ2UgLnVzZXJzIC51c2Vyc0xpc3RcIik7XHJcblxyXG4vL0J0dG9uc1xyXG5jb25zdCBuZXdSb29tQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UGFnZSAuYWRkSXRlbUNvbnRhaW5lciAubmV3Um9vbUJ0blwiKTtcclxuY29uc3Qgam9pblJvb21CdG46IEhUTUxCdXR0b25FbGVtZW50ID0gPEhUTUxCdXR0b25FbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRQYWdlIC5hZGRJdGVtQ29udGFpbmVyIC5qb2luUm9vbUJ0blwiKTtcclxuY29uc3QgbGVhdmVSb29tQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW5QYWdlIC5iYWNrQnRuXCIpO1xyXG5jb25zdCBjb3B5SW1nQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW5QYWdlIC5yb29tSWRDb250YWluZXIgLmNvcHlJbWdCdG5cIik7XHJcbmNvbnN0IHN5bmNCdG46IEhUTUxCdXR0b25FbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAuYWN0aW9ucyAuYWN0aW9uQnRucyAuc3luY0J0blwiKVxyXG5cclxuLy9JbnB1dHNcclxuY29uc3QgbmFtZUlucHV0OiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFBhZ2UgLmFkZEl0ZW1Db250YWluZXIgLm5hbWVJbnB1dFwiKTtcclxuY29uc3Qgcm9vbU5hbWVJbnB1dDogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRQYWdlIC5hZGRJdGVtQ29udGFpbmVyIC5yb29tSW5wdXRcIik7XHJcblxyXG4vL1RleHRcclxuY29uc3QgZXJyb3JNc2dFbGVtOiBIVE1MUGFyYWdyYXBoRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRQYWdlIC5hZGRJdGVtQ29udGFpbmVyIC5lcnJvclwiKTtcclxuY29uc3Qgcm9vbUlkRWxlbTogSFRNTFNwYW5FbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5QYWdlIC5yb29tSWRDb250YWluZXIgLnJvb21JZCcpO1xyXG5jb25zdCByb29tTmFtZUVsZW06IEhUTUxIZWFkaW5nRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblBhZ2UgLmhlYWQgLnJvb21OYW1lXCIpO1xyXG5cclxuXHJcbi8vSW5pdGlhbCBvcGVuIG9mIHBvcHVwXHJcbmNocm9tZS50YWJzLnF1ZXJ5KHthY3RpdmU6dHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZX0sIHRhYnMgPT4ge1xyXG4gICAgbGV0IGFjdGl2ZVRhYklkID0gdGFic1swXS5pZFxyXG4gICAgbGV0IHBhZ2VNZXRhZGF0YTogUGFnZU1ldGFkYXRhID0gPFBhZ2VNZXRhZGF0YT57cm9vbU5hbWU6IFwiXCIsIHBhZ2VUeXBlOiBQYWdlLlNUQVJUfVxyXG5cclxuICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XHJcbiAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19JU19DSEFOTkVMX09QRU5cclxuICAgIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPiwgKHJlc3A6IFJlc3BvbnNlT2JqZWN0PGJvb2xlYW4+KSA9PiB7XHJcbiAgICAgICAgaWYgKHJlc3Auc3RhdHVzID09IE1lc3NhZ2VzLlNVQ0NFU1MgJiYgcmVzcC5wYXlsb2FkKSB7XHJcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX1JFVFJJRVZFX1JPT01fREFUQVxyXG4gICAgICAgICAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIChyZXNwOiBSZXNwb25zZU9iamVjdDxFeHRlbnNpb25Sb29tUGF5bG9hZD4pID0+IHtcclxuICAgICAgICAgICAgICAgIHBhZ2VNZXRhZGF0YS5yb29tSWQgPSByZXNwLnBheWxvYWQucm9vbS5yb29tSWRcclxuICAgICAgICAgICAgICAgIHBhZ2VNZXRhZGF0YS5yb29tTmFtZSA9IHJlc3AucGF5bG9hZC5yb29tLnJvb21OYW1lXHJcbiAgICAgICAgICAgICAgICBwYWdlTWV0YWRhdGEucGFnZVR5cGUgPSBQYWdlLk1BSU5cclxuICAgICAgICAgICAgICAgIHVwZGF0ZU1haW5Vc2VycyhyZXNwLnBheWxvYWQucm9vbS51c2VycylcclxuICAgICAgICAgICAgICAgIGNoYW5nZVBhZ2UocGFnZU1ldGFkYXRhKVxyXG4gICAgICAgICAgICB9KSBcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIGNoYW5nZVBhZ2UocGFnZU1ldGFkYXRhKTtcclxufSlcclxuXHJcbmNvbnN0IHZhbGlkUm9vbUlucHV0ID0gKCkgPT4ge1xyXG4gICAgaWYocm9vbU5hbWVJbnB1dC52YWx1ZS50cmltKCkgPT09IFwiXCIpIHtcclxuICAgICAgICBlcnJvck1zZ0VsZW0uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgZXJyb3JNc2dFbGVtLmlubmVySFRNTCA9ICdQbGVhc2UgZW50ZXIgYSByb29tL2lkJztcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVycm9yTXNnRWxlbS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgICBlcnJvck1zZ0VsZW0uaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbm5ld1Jvb21CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfID0+IHtcclxuICAgIGNyZWF0ZU5ld1Jvb21XaXRoVmFsaWRhdGlvbigpO1xyXG59KVxyXG5cclxuam9pblJvb21CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcclxuICAgIGpvaW5Sb29tV2l0aFZhbGlkYXRpb24oKVxyXG59KVxyXG5cclxubGVhdmVSb29tQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXyA9PiB7XHJcbiAgICBsZWF2ZVJvb20oKVxyXG59KVxyXG5cclxuc3luY0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGlmIChsb2NhbFVzZXJzLmxlbmd0aCA9PT0gMSl7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOnRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICBsZXQgYWN0aXZlVGFiSWQgPSB0YWJzWzBdLmlkXHJcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19JU19DSEFOTkVMX09QRU5cclxuICAgICAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIChyZXNwOiBSZXNwb25zZU9iamVjdDxib29sZWFuPikgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT0gTWVzc2FnZXMuU1VDQ0VTUyAmJiByZXNwLnBheWxvYWQpIHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19TWU5DX1ZJRFxyXG4gICAgICAgICAgICAgICAgfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcbn0pXHJcblxyXG5jb25zdCBsZWF2ZVJvb20gPSAoKSA9PiB7XHJcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOnRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICBsZXQgYWN0aXZlVGFiSWQgPSB0YWJzWzBdLmlkXHJcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19JU19DSEFOTkVMX09QRU5cclxuICAgICAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIChyZXNwOiBSZXNwb25zZU9iamVjdDxib29sZWFuPikgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT0gTWVzc2FnZXMuU1VDQ0VTUyAmJiByZXNwLnBheWxvYWQpIHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19ESVNDT05ORUNUXHJcbiAgICAgICAgICAgICAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIGNoYW5nZVBhZ2UoeyBwYWdlVHlwZTogUGFnZS5TVEFSVCwgcm9vbUlkOiBudWxsLCByb29tTmFtZTogXCJcIiB9KVxyXG4gICAgfSlcclxufVxyXG5cclxuY29weUltZ0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGxldCByb29tSWRWYWwgPSByb29tSWRFbGVtLmlubmVySFRNTFxyXG4gICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQocm9vbUlkVmFsKS50aGVuKCgpID0+IHtcclxuICAgIH0sICgpID0+IHtcclxuICAgICAgICAvL0ZhaWxlZCB0byBjb3B5XHJcbiAgICB9KVxyXG59KVxyXG5cclxuY29uc3Qgam9pblJvb21XaXRoVmFsaWRhdGlvbiA9ICgpID0+IHtcclxuICAgIGxldCBtZXNzYWdlT2JqZWN0OiBNZXNzYWdlT2JqZWN0PEV4dGVuc2lvbkpvaW5Sb29tUGF5bG9hZD4gPSB7IFxyXG4gICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfSk9JTl9ST09NX0lOX1RBQiwgXHJcbiAgICAgICAgcGF5bG9hZDoge1xyXG4gICAgICAgICAgICByb29tSWQ6IHJvb21OYW1lSW5wdXQudmFsdWUudHJpbSgpLCBcclxuICAgICAgICAgICAgdXNlck5hbWU6IG5hbWVJbnB1dC52YWx1ZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdvSW50b1Jvb21XaXRoVmFsaWRhdGlvbihtZXNzYWdlT2JqZWN0KVxyXG59XHJcblxyXG5jb25zdCBjcmVhdGVOZXdSb29tV2l0aFZhbGlkYXRpb24gPSAoKSA9PiB7XHJcbiAgICBsZXQgbWVzc2FnZU9iamVjdDogTWVzc2FnZU9iamVjdDxFeHRlbnNpb25OZXdSb29tUGF5bG9hZD4gPSB7IFxyXG4gICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfQ1JFQVRFX1JPT01fSU5fVEFCLCBcclxuICAgICAgICBwYXlsb2FkOiB7XHJcbiAgICAgICAgICAgIHJvb21OYW1lOiByb29tTmFtZUlucHV0LnZhbHVlLnRyaW0oKSwgXHJcbiAgICAgICAgICAgIHVzZXJOYW1lOiBuYW1lSW5wdXQudmFsdWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnb0ludG9Sb29tV2l0aFZhbGlkYXRpb24obWVzc2FnZU9iamVjdClcclxufVxyXG5cclxuY29uc3QgZ29JbnRvUm9vbVdpdGhWYWxpZGF0aW9uID0gKG1lc3NhZ2VPYmplY3Q6IE1lc3NhZ2VPYmplY3Q8YW55PikgPT4ge1xyXG4gICAgY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTp0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlfSwgdGFicyA9PiB7XHJcbiAgICAgICAgbGV0IGFjdGl2ZVRhYklkOiBudW1iZXIgPSB0YWJzWzBdLmlkO1xyXG4gICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7IG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfVklERU9fT05fU0NSRUVOIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPiwgKHJlc3A6IFJlc3BvbnNlT2JqZWN0PGJvb2xlYW4+KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXNwLnN0YXR1cyA9PT0gTWVzc2FnZXMuU1VDQ0VTUyAmJiByZXNwLnBheWxvYWQgJiYgdmFsaWRSb29tSW5wdXQoKSkgeyBcclxuICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCBtZXNzYWdlT2JqZWN0LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8RXh0ZW5zaW9uUm9vbVBheWxvYWQ+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3Auc3RhdHVzID09PSBNZXNzYWdlcy5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZVBhZ2UoIHsgcGFnZVR5cGU6IFBhZ2UuTUFJTiwgcm9vbUlkOiByZXNwLnBheWxvYWQucm9vbS5yb29tSWQsIHJvb21OYW1lOiByZXNwLnBheWxvYWQucm9vbS5yb29tTmFtZSB9IGFzIFBhZ2VNZXRhZGF0YSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTWFpblVzZXJzKHJlc3AucGF5bG9hZC5yb29tLnVzZXJzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfSlcclxufVxyXG5cclxuY29uc3QgY2hhbmdlUGFnZSA9IChwYWdlTWV0YWRhdGE6IFBhZ2VNZXRhZGF0YSkgPT4ge1xyXG4gICAgaWYgKHBhZ2VNZXRhZGF0YS5wYWdlVHlwZSA9PT0gUGFnZS5TVEFSVCkge1xyXG4gICAgICAgIHN0YXJ0UGFnZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICBtYWluUGFnZS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgICBoZWFkZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgcm9vbU5hbWVJbnB1dC52YWx1ZSA9IHBhZ2VNZXRhZGF0YS5yb29tTmFtZTtcclxuICAgICAgICBuYW1lSW5wdXQudmFsdWUgPSBcIlwiO1xyXG4gICAgfSBlbHNlIGlmIChwYWdlTWV0YWRhdGEucGFnZVR5cGUgPT09IFBhZ2UuTUFJTikge1xyXG4gICAgICAgIHN0YXJ0UGFnZS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgICBtYWluUGFnZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICBoZWFkZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcblxyXG4gICAgICAgIHJvb21OYW1lRWxlbS5pbm5lckhUTUwgPSAgYCR7cGFnZU1ldGFkYXRhLnJvb21OYW1lfWA7XHJcbiAgICAgICAgcm9vbUlkRWxlbS5pbm5lckhUTUwgPSBgJHtwYWdlTWV0YWRhdGEucm9vbUlkfWA7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCB1cGRhdGVNYWluVXNlcnMgPSAodXNlcnM6IEFycmF5PFVzZXI+KSA9PiB7XHJcbiAgICBsb2NhbFVzZXJzID0gdXNlcnNcclxuICAgIFxyXG4gICAgaWYgKGxvY2FsVXNlcnMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgc3luY0J0bi5jbGFzc0xpc3QuYWRkKFwiZGlzYWJsZWRCdG5cIilcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc3luY0J0bi5jbGFzc0xpc3QucmVtb3ZlKFwiZGlzYWJsZWRCdG5cIilcclxuICAgIH1cclxuXHJcbiAgICB1c2Vyc0xpc3RDb250YWluZXIuaW5uZXJIVE1MID0gXCJcIlxyXG4gICAgdXNlcnMuZm9yRWFjaCh1c2VyID0+IHtcclxuICAgICAgICBsZXQgdXNlckVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiRElWXCIpO1xyXG4gICAgICAgIHVzZXJFbGVtLmNsYXNzTGlzdC5hZGQoXCJ1c2VyRWxlbVwiKTtcclxuICAgICAgICBpZiAoISF1c2VyLmN1cnJlbnQpIHtcclxuICAgICAgICAgICAgdXNlckVsZW0uY2xhc3NMaXN0LmFkZChcImN1cnJlbnRVc2VyXCIpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB1c2VySWNvbiA9ICh1c2VyLmFkbWluID8gXCI8aW1nIGNsYXNzPSd1c2VySWNvbicgc3JjPScuLi9pbWFnZXMvYWRtaW5Vc2VyLnBuZycgYWx0PSdhZG1pbnVzZXInPlwiIDogXCI8aW1nIGNsYXNzPSd1c2VySWNvbicgc3JjPScuLi9pbWFnZXMvdXNlci5wbmcnIGFsdD0nbm9ybWFsdXNlcic+XCIpXHJcbiAgICAgICAgbGV0IHVzZXJOYW1lID0gKCEhdXNlci5jdXJyZW50ID8gYDxzdHJvbmc+JHt1c2VyLnVzZXJOYW1lfTwvc3Ryb25nPmAgOiBgJHt1c2VyLnVzZXJOYW1lfWApXHJcbiAgICAgICAgdXNlckVsZW0uaW5uZXJIVE1MID0gdXNlckljb24rYDxzcGFuIHN0eWxlPVwibWFyZ2luLWxlZnQ6NXB4XCI+JHt1c2VyTmFtZX08L3NwYW4+YDtcclxuICAgICAgICB1c2Vyc0xpc3RDb250YWluZXIuYXBwZW5kKHVzZXJFbGVtKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vLyBNZXNzYWdlIGhhbmRsZXJcclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0OiBNZXNzYWdlT2JqZWN0PGFueT4sIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcbiAgICBcclxuICAgIC8vQ2hlY2sgYmVsb3cgaXMgaW1wb3J0YW50IGIvYyBpZiB3ZSBoYXZlIG11bHRpcGxlIHBvcHVwcyBvcGVuIGluIGRpZmYgd2luZG93cywgd2UgZG9udCB3YW50IGFsbCByZWFjdGluZyB0byBzYW1lIGV2ZW50XHJcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OnRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICBsZXQgY3VyQWN0aXZlVGFiSWQgPSB0YWJzWzBdLmlkXHJcbiAgICAgICAgaWYgKHNlbmRlci50YWI/LmlkID09PSBjdXJBY3RpdmVUYWJJZCAmJiByZXF1ZXN0Lm1lc3NhZ2UgPT09IE1lc3NhZ2VzLlRPUE9QVVBfUk9PTV9EQVRBKSB7XHJcbiAgICAgICAgICAgIGxldCByZXFEYXRhID0gPEV4dGVuc2lvblJvb21QYXlsb2FkPnJlcXVlc3QucGF5bG9hZFxyXG4gICAgICAgICAgICB1cGRhdGVNYWluVXNlcnMocmVxRGF0YS5yb29tLnVzZXJzKVxyXG4gICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5tZXNzYWdlID09PSBNZXNzYWdlcy5UT1BPUFVQX0xFQVZFX1JPT00pIHtcclxuICAgICAgICAgICAgbGV0IHNlbmRlclRhYklkID0gKDxFeHRlbnNpb25TZW5kZXJUYWJJZFBheWxvYWQ+cmVxdWVzdC5wYXlsb2FkKS50YWJJZFxyXG4gICAgICAgICAgICBpZiAoc2VuZGVyVGFiSWQgPT09IGN1ckFjdGl2ZVRhYklkKSB7XHJcbiAgICAgICAgICAgICAgICBsZWF2ZVJvb20oKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIHJldHVybiB0cnVlXHJcbn0pO1xyXG5cclxuXHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==