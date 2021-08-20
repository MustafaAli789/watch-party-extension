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
/*!******************!*\
  !*** ./popup.ts ***!
  \******************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const constants_1 = __webpack_require__(/*! ./models/constants */ "./models/constants.ts");
let localUsers = [];
let chatToggled = true;
//Containers
const startPage = document.querySelector("#startPage");
const mainPage = document.querySelector("#mainPage");
const header = document.querySelector("#header");
const usersListContainer = document.querySelector("#mainPage .users .usersList");
const offsetContainer = document.querySelector("#mainPage .offsetContainer");
//Bttons
const newRoomBtn = document.querySelector("#startPage .addItemContainer .newRoomBtn");
const joinRoomBtn = document.querySelector("#startPage .addItemContainer .joinRoomBtn");
const leaveRoomBtn = document.querySelector("#mainPage .backBtn");
const copyImgBtn = document.querySelector("#mainPage .roomIdContainer .copyImgBtn");
const syncBtn = document.querySelector("#mainPage .actions .actionBtns .syncBtn");
const chatToggleBtn = document.querySelector("#mainPage .actions .actionBtns .chatToggle");
const posOffsetBtn = document.getElementById("posOffsetBtn");
const resetOffsetBtn = document.getElementById("resetOffsetBtn");
//Inputs
const nameInput = document.querySelector("#startPage .addItemContainer .nameInput");
const roomNameInput = document.querySelector("#startPage .addItemContainer .roomInput");
const offsetInput = document.querySelector("#mainPage .offsetContainer .html-duration-picker");
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
                chatToggled = resp.payload.chatOpen;
                changePage(pageMetadata);
                updateMainUsers(resp.payload.room.users);
                setChatOpenToggle(chatToggled);
                setOffsetInput(resp.payload.offsetTime, resp.payload.videoLength);
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
    else if (nameInput.value.trim().length < 3) {
        errorMsgElem.classList.remove('hidden');
        errorMsgElem.innerHTML = 'Please enter a username longer than 3 chars';
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
chatToggleBtn.addEventListener('click', () => {
    chatToggled = !chatToggled;
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        let activeTabId = tabs[0].id;
        chrome.tabs.sendMessage(activeTabId, {
            message: constants_1.Messages.TOFG_IS_CHANNEL_OPEN
        }, (resp) => {
            if (resp.status == constants_1.Messages.SUCCESS && resp.payload) {
                chrome.tabs.sendMessage(activeTabId, {
                    message: constants_1.Messages.TOFG_CHAT_TOGGLE,
                    payload: chatToggled
                }, resp => {
                    setChatOpenToggle(chatToggled);
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
posOffsetBtn.addEventListener('click', () => {
    setOffset("UP");
});
resetOffsetBtn.addEventListener('click', () => {
    if (offsetInput.value !== "00:00:00") {
        offsetInput.value = "00:00:00";
        setOffset(null);
    }
});
const setOffset = (direction) => {
    let time = offsetInput.value.split(":");
    let hours = parseInt(time[0]);
    let mins = parseInt(time[1]);
    let secs = parseInt(time[2]);
    let offsetTime = hours * 3600 + mins * 60 + secs;
    // setting button styles
    posOffsetBtn.classList.remove('toggledBtn');
    if (direction === "UP") {
        posOffsetBtn.classList.add('toggledBtn');
    }
    if ((offsetTime > 0 && direction !== null) || (!direction && offsetTime === 0)) {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            let activeTabId = tabs[0].id;
            chrome.tabs.sendMessage(activeTabId, {
                message: constants_1.Messages.TOFG_IS_CHANNEL_OPEN
            }, (resp) => {
                if (resp.status == constants_1.Messages.SUCCESS && resp.payload) {
                    chrome.tabs.sendMessage(activeTabId, {
                        message: constants_1.Messages.TOFG_SET_OFFSET,
                        payload: { offsetTime: offsetTime, direction: direction }
                    });
                }
            });
        });
    }
};
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
                        setChatOpenToggle(resp.payload.chatOpen);
                        setOffsetInput(resp.payload.offsetTime, resp.payload.videoLength);
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
        userElem.innerHTML = userIcon + `<span style="margin-left:5px; max-width: 80%; word-break: break-all">${userName}</span>` + `<div class="userColorCircle" style="background-color:${user.color}"></div>`;
        usersListContainer.append(userElem);
    });
};
const setChatOpenToggle = (chatOpen) => {
    if (chatOpen) {
        chatToggleBtn.classList.add('toggledBtn');
    }
    else {
        chatToggleBtn.classList.remove('toggledBtn');
    }
};
const setOffsetInput = (offsetTime, videoLength) => {
    var _a;
    // Admin does not see offset input
    if ((_a = localUsers.find(user => user.current)) === null || _a === void 0 ? void 0 : _a.admin) {
        offsetContainer.style.display = "none";
        return;
    }
    if (offsetTime > 0) {
        posOffsetBtn.classList.add('toggledBtn');
    }
    offsetTime < 0 ? offsetTime *= -1 : null;
    // https://stackoverflow.com/questions/1322732/convert-seconds-to-hh-mm-ss-with-javascript
    let maxTime = new Date(videoLength * 1000).toISOString().substr(11, 8);
    let curTime = new Date(offsetTime * 1000).toISOString().substr(11, 8);
    offsetInput.setAttribute("data-duration-max", maxTime);
    offsetInput.setAttribute("data-duration-min", "00:00:00");
    offsetInput.value = curTime;
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
            setOffsetInput(reqData.offsetTime, reqData.videoLength);
        }
    });
    return true;
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QWtCO0FBQ2xCLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQTJCLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxFQUFFO0lBRXZGLHVIQUF1SDtJQUN2SCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFDLElBQUksRUFBQyxFQUFFLElBQUksQ0FBQyxFQUFFOztRQUN6RCxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUMvQixJQUFJLGFBQU0sQ0FBQyxHQUFHLDBDQUFFLEVBQUUsTUFBSyxjQUFjLElBQUksT0FBTyxDQUFDLE9BQU8sS0FBSyxvQkFBUSxDQUFDLGlCQUFpQixFQUFFO1lBQ3JGLElBQUksT0FBTyxHQUF1QixPQUFPLENBQUMsT0FBTztZQUNqRCxlQUFlLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDbkMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQztTQUMxRDtJQUNMLENBQUMsQ0FBQztJQUNGLE9BQU8sSUFBSTtBQUNmLENBQUMsQ0FBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi8uL21vZGVscy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leHRlbnRzaW9uLy4vcG9wdXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGVudW0gUGFnZXtcclxuICAgIFNUQVJULFxyXG4gICAgTUFJTlxyXG59XHJcblxyXG5leHBvcnQgZW51bSBNZXNzYWdlc3tcclxuICAgIFNVQ0NFU1MsXHJcbiAgICBGQUlMVVJFLFxyXG4gICAgVE9GR19WSURFT19PTl9TQ1JFRU4sXHJcbiAgICBUT0ZHX0NSRUFURV9ST09NX0lOX1RBQixcclxuICAgIFRPRkdfSk9JTl9ST09NX0lOX1RBQixcclxuICAgIFRPRkdfRElTQ09OTkVDVCxcclxuICAgIFRPRkdfUkVUUklFVkVfUk9PTV9EQVRBLFxyXG4gICAgVE9GR19ET19ZT1VfRVhJU1QsXHJcbiAgICBUT0ZHX1NZTkNfVklELFxyXG4gICAgVE9QT1BVUF9MRUFWRV9ST09NLFxyXG4gICAgVE9QT1BVUF9ST09NX0RBVEEsXHJcbiAgICBUT0ZHX0lTX0NIQU5ORUxfT1BFTixcclxuICAgIFRPRkdfQ0hBVF9UT0dHTEUsXHJcbiAgICBUT0ZHX1NFVF9PRkZTRVQsXHJcbiAgICBUT0JHX09QRU5fVEFCX1dJVEhfVVJMXHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IE1lc3NhZ2VzLCBQYWdlIH0gZnJvbSAnLi9tb2RlbHMvY29uc3RhbnRzJ1xyXG5pbXBvcnQgeyBUb0ZnSm9pblJvb21QYXlsb2FkLCBUb0ZnTmV3Um9vbVBheWxvYWQsIFRvRmdPZmZzZXRQYXlsb2FkLCBUb1BvcHVwUm9vbVBheWxvYWQgfSBmcm9tICcuL21vZGVscy9wYXlsb2Fkcyc7XHJcbmltcG9ydCB7IE1lc3NhZ2VPYmplY3QsIFJlc3BvbnNlT2JqZWN0LCAgfSBmcm9tICcuL21vZGVscy9tZXNzYWdlcGFzc2luZyc7XHJcbmltcG9ydCB7IFBhZ2VNZXRhZGF0YSB9IGZyb20gJy4vbW9kZWxzL01pc2NlbGxhbmVvdXMnO1xyXG5cclxuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4uL3NoYXJlZG1vZGVscy91c2VyJ1xyXG5pbXBvcnQgeyAgfSBmcm9tICcuLi9zaGFyZWRtb2RlbHMvcGF5bG9hZHMnXHJcblxyXG5sZXQgbG9jYWxVc2VyczogVXNlcltdID0gW11cclxubGV0IGNoYXRUb2dnbGVkOiBCb29sZWFuID0gdHJ1ZVxyXG5cclxuLy9Db250YWluZXJzXHJcbmNvbnN0IHN0YXJ0UGFnZTogSFRNTERpdkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UGFnZVwiKTtcclxuY29uc3QgbWFpblBhZ2U6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZVwiKTtcclxuY29uc3QgaGVhZGVyOiBIVE1MRGl2RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaGVhZGVyXCIpO1xyXG5jb25zdCB1c2Vyc0xpc3RDb250YWluZXI6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAudXNlcnMgLnVzZXJzTGlzdFwiKTtcclxuY29uc3Qgb2Zmc2V0Q29udGFpbmVyOiBIVE1MRGl2RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblBhZ2UgLm9mZnNldENvbnRhaW5lclwiKVxyXG5cclxuLy9CdHRvbnNcclxuY29uc3QgbmV3Um9vbUJ0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFBhZ2UgLmFkZEl0ZW1Db250YWluZXIgLm5ld1Jvb21CdG5cIik7XHJcbmNvbnN0IGpvaW5Sb29tQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UGFnZSAuYWRkSXRlbUNvbnRhaW5lciAuam9pblJvb21CdG5cIik7XHJcbmNvbnN0IGxlYXZlUm9vbUJ0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAuYmFja0J0blwiKTtcclxuY29uc3QgY29weUltZ0J0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAucm9vbUlkQ29udGFpbmVyIC5jb3B5SW1nQnRuXCIpO1xyXG5jb25zdCBzeW5jQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblBhZ2UgLmFjdGlvbnMgLmFjdGlvbkJ0bnMgLnN5bmNCdG5cIilcclxuY29uc3QgY2hhdFRvZ2dsZUJ0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW5QYWdlIC5hY3Rpb25zIC5hY3Rpb25CdG5zIC5jaGF0VG9nZ2xlXCIpXHJcbmNvbnN0IHBvc09mZnNldEJ0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb3NPZmZzZXRCdG5cIilcclxuY29uc3QgcmVzZXRPZmZzZXRCdG46IEhUTUxCdXR0b25FbGVtZW50ID0gPEhUTUxCdXR0b25FbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzZXRPZmZzZXRCdG5cIilcclxuXHJcbi8vSW5wdXRzXHJcbmNvbnN0IG5hbWVJbnB1dDogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRQYWdlIC5hZGRJdGVtQ29udGFpbmVyIC5uYW1lSW5wdXRcIik7XHJcbmNvbnN0IHJvb21OYW1lSW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UGFnZSAuYWRkSXRlbUNvbnRhaW5lciAucm9vbUlucHV0XCIpO1xyXG5jb25zdCBvZmZzZXRJbnB1dDogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblBhZ2UgLm9mZnNldENvbnRhaW5lciAuaHRtbC1kdXJhdGlvbi1waWNrZXJcIilcclxuXHJcbi8vVGV4dFxyXG5jb25zdCBlcnJvck1zZ0VsZW06IEhUTUxQYXJhZ3JhcGhFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFBhZ2UgLmFkZEl0ZW1Db250YWluZXIgLmVycm9yXCIpO1xyXG5jb25zdCByb29tSWRFbGVtOiBIVE1MU3BhbkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpblBhZ2UgLnJvb21JZENvbnRhaW5lciAucm9vbUlkJyk7XHJcbmNvbnN0IHJvb21OYW1lRWxlbTogSFRNTEhlYWRpbmdFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAuaGVhZCAucm9vbU5hbWVcIik7XHJcblxyXG5cclxuLy9Jbml0aWFsIG9wZW4gb2YgcG9wdXBcclxuY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTp0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlfSwgdGFicyA9PiB7XHJcbiAgICBsZXQgYWN0aXZlVGFiSWQgPSB0YWJzWzBdLmlkXHJcbiAgICBsZXQgcGFnZU1ldGFkYXRhOiBQYWdlTWV0YWRhdGEgPSA8UGFnZU1ldGFkYXRhPntyb29tTmFtZTogXCJcIiwgcGFnZVR5cGU6IFBhZ2UuU1RBUlR9XHJcblxyXG4gICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0lTX0NIQU5ORUxfT1BFTlxyXG4gICAgfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8Ym9vbGVhbj4pID0+IHtcclxuICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT0gTWVzc2FnZXMuU1VDQ0VTUyAmJiByZXNwLnBheWxvYWQpIHtcclxuICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfUkVUUklFVkVfUk9PTV9EQVRBXHJcbiAgICAgICAgICAgIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPiwgKHJlc3A6IFJlc3BvbnNlT2JqZWN0PFRvUG9wdXBSb29tUGF5bG9hZD4pID0+IHtcclxuICAgICAgICAgICAgICAgIHBhZ2VNZXRhZGF0YS5yb29tSWQgPSByZXNwLnBheWxvYWQucm9vbS5yb29tSWRcclxuICAgICAgICAgICAgICAgIHBhZ2VNZXRhZGF0YS5yb29tTmFtZSA9IHJlc3AucGF5bG9hZC5yb29tLnJvb21OYW1lXHJcbiAgICAgICAgICAgICAgICBwYWdlTWV0YWRhdGEucGFnZVR5cGUgPSBQYWdlLk1BSU5cclxuICAgICAgICAgICAgICAgIGNoYXRUb2dnbGVkID0gcmVzcC5wYXlsb2FkLmNoYXRPcGVuXHJcblxyXG4gICAgICAgICAgICAgICAgY2hhbmdlUGFnZShwYWdlTWV0YWRhdGEpXHJcbiAgICAgICAgICAgICAgICB1cGRhdGVNYWluVXNlcnMocmVzcC5wYXlsb2FkLnJvb20udXNlcnMpXHJcbiAgICAgICAgICAgICAgICBzZXRDaGF0T3BlblRvZ2dsZShjaGF0VG9nZ2xlZClcclxuICAgICAgICAgICAgICAgIHNldE9mZnNldElucHV0KHJlc3AucGF5bG9hZC5vZmZzZXRUaW1lLCByZXNwLnBheWxvYWQudmlkZW9MZW5ndGgpXHJcbiAgICAgICAgICAgIH0pIFxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgY2hhbmdlUGFnZShwYWdlTWV0YWRhdGEpO1xyXG59KVxyXG5cclxuY29uc3QgdmFsaWRSb29tSW5wdXQgPSAoKSA9PiB7XHJcbiAgICBpZihyb29tTmFtZUlucHV0LnZhbHVlLnRyaW0oKSA9PT0gXCJcIikge1xyXG4gICAgICAgIGVycm9yTXNnRWxlbS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICBlcnJvck1zZ0VsZW0uaW5uZXJIVE1MID0gJ1BsZWFzZSBlbnRlciBhIHJvb20vaWQnO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSBpZiAobmFtZUlucHV0LnZhbHVlLnRyaW0oKS5sZW5ndGggPCAzKSB7XHJcbiAgICAgICAgZXJyb3JNc2dFbGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIGVycm9yTXNnRWxlbS5pbm5lckhUTUwgPSAnUGxlYXNlIGVudGVyIGEgdXNlcm5hbWUgbG9uZ2VyIHRoYW4gMyBjaGFycyc7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBlcnJvck1zZ0VsZW0uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgZXJyb3JNc2dFbGVtLmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5uZXdSb29tQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXyA9PiB7XHJcbiAgICBjcmVhdGVOZXdSb29tV2l0aFZhbGlkYXRpb24oKTtcclxufSlcclxuXHJcbmpvaW5Sb29tQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XHJcbiAgICBqb2luUm9vbVdpdGhWYWxpZGF0aW9uKClcclxufSlcclxuXHJcbmxlYXZlUm9vbUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIF8gPT4ge1xyXG4gICAgbGVhdmVSb29tKClcclxufSlcclxuXHJcbnN5bmNCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBpZiAobG9jYWxVc2Vycy5sZW5ndGggPT09IDEpe1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTp0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlfSwgdGFicyA9PiB7XHJcbiAgICAgICAgbGV0IGFjdGl2ZVRhYklkID0gdGFic1swXS5pZFxyXG4gICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XHJcbiAgICAgICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfSVNfQ0hBTk5FTF9PUEVOXHJcbiAgICAgICAgfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8Ym9vbGVhbj4pID0+IHtcclxuICAgICAgICAgICAgaWYgKHJlc3Auc3RhdHVzID09IE1lc3NhZ2VzLlNVQ0NFU1MgJiYgcmVzcC5wYXlsb2FkKSB7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfU1lOQ19WSURcclxuICAgICAgICAgICAgICAgIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9KVxyXG59KVxyXG5jaGF0VG9nZ2xlQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgY2hhdFRvZ2dsZWQgPSAhY2hhdFRvZ2dsZWRcclxuICAgIGNocm9tZS50YWJzLnF1ZXJ5KHthY3RpdmU6dHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZX0sIHRhYnMgPT4ge1xyXG4gICAgICAgIGxldCBhY3RpdmVUYWJJZCA9IHRhYnNbMF0uaWRcclxuICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwge1xyXG4gICAgICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0lTX0NIQU5ORUxfT1BFTlxyXG4gICAgICAgIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPiwgKHJlc3A6IFJlc3BvbnNlT2JqZWN0PGJvb2xlYW4+KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXNwLnN0YXR1cyA9PSBNZXNzYWdlcy5TVUNDRVNTICYmIHJlc3AucGF5bG9hZCkge1xyXG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0NIQVRfVE9HR0xFLFxyXG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQ6IGNoYXRUb2dnbGVkXHJcbiAgICAgICAgICAgICAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8Qm9vbGVhbj4sIHJlc3AgPT57XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0Q2hhdE9wZW5Ub2dnbGUoY2hhdFRvZ2dsZWQpXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcbn0pXHJcblxyXG5jb25zdCBsZWF2ZVJvb20gPSAoKSA9PiB7XHJcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOnRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICBsZXQgYWN0aXZlVGFiSWQgPSB0YWJzWzBdLmlkXHJcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19JU19DSEFOTkVMX09QRU5cclxuICAgICAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIChyZXNwOiBSZXNwb25zZU9iamVjdDxib29sZWFuPikgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT0gTWVzc2FnZXMuU1VDQ0VTUyAmJiByZXNwLnBheWxvYWQpIHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19ESVNDT05ORUNUXHJcbiAgICAgICAgICAgICAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIGNoYW5nZVBhZ2UoeyBwYWdlVHlwZTogUGFnZS5TVEFSVCwgcm9vbUlkOiBudWxsLCByb29tTmFtZTogXCJcIiB9KVxyXG4gICAgfSlcclxufVxyXG5cclxuY29weUltZ0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGxldCByb29tSWRWYWwgPSByb29tSWRFbGVtLmlubmVySFRNTFxyXG4gICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQocm9vbUlkVmFsKS50aGVuKCgpID0+IHtcclxuICAgIH0sICgpID0+IHtcclxuICAgICAgICAvL0ZhaWxlZCB0byBjb3B5XHJcbiAgICB9KVxyXG59KVxyXG5cclxucG9zT2Zmc2V0QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgc2V0T2Zmc2V0KFwiVVBcIilcclxufSlcclxuXHJcbnJlc2V0T2Zmc2V0QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgaWYgKG9mZnNldElucHV0LnZhbHVlICE9PSBcIjAwOjAwOjAwXCIpIHtcclxuICAgICAgICBvZmZzZXRJbnB1dC52YWx1ZSA9IFwiMDA6MDA6MDBcIlxyXG4gICAgICAgIHNldE9mZnNldChudWxsKVxyXG4gICAgfVxyXG59KVxyXG5cclxuY29uc3Qgc2V0T2Zmc2V0ID0gKGRpcmVjdGlvbjogXCJVUFwiIHwgXCJET1dOXCIpID0+IHtcclxuICAgIGxldCB0aW1lID0gb2Zmc2V0SW5wdXQudmFsdWUuc3BsaXQoXCI6XCIpXHJcbiAgICBsZXQgaG91cnMgPSBwYXJzZUludCh0aW1lWzBdKVxyXG4gICAgbGV0IG1pbnMgPSBwYXJzZUludCh0aW1lWzFdKVxyXG4gICAgbGV0IHNlY3MgPSBwYXJzZUludCh0aW1lWzJdKVxyXG5cclxuICAgIGxldCBvZmZzZXRUaW1lID0gaG91cnMqMzYwMCArIG1pbnMqNjAgKyBzZWNzXHJcblxyXG4gICAgLy8gc2V0dGluZyBidXR0b24gc3R5bGVzXHJcbiAgICBwb3NPZmZzZXRCdG4uY2xhc3NMaXN0LnJlbW92ZSgndG9nZ2xlZEJ0bicpXHJcbiAgICBpZiAoZGlyZWN0aW9uID09PSBcIlVQXCIpIHtcclxuICAgICAgICBwb3NPZmZzZXRCdG4uY2xhc3NMaXN0LmFkZCgndG9nZ2xlZEJ0bicpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKChvZmZzZXRUaW1lID4gMCAmJiBkaXJlY3Rpb24gIT09IG51bGwpIHx8ICghZGlyZWN0aW9uICYmIG9mZnNldFRpbWUgPT09IDApKSB7XHJcbiAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTp0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlfSwgdGFicyA9PiB7XHJcbiAgICAgICAgICAgIGxldCBhY3RpdmVUYWJJZCA9IHRhYnNbMF0uaWRcclxuICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfSVNfQ0hBTk5FTF9PUEVOXHJcbiAgICAgICAgICAgIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPiwgKHJlc3A6IFJlc3BvbnNlT2JqZWN0PGJvb2xlYW4+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT0gTWVzc2FnZXMuU1VDQ0VTUyAmJiByZXNwLnBheWxvYWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX1NFVF9PRkZTRVQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgb2Zmc2V0VGltZTogb2Zmc2V0VGltZSwgZGlyZWN0aW9uOiBkaXJlY3Rpb24gfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gYXMgTWVzc2FnZU9iamVjdDxUb0ZnT2Zmc2V0UGF5bG9hZD4pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufVxyXG5cclxuY29uc3Qgam9pblJvb21XaXRoVmFsaWRhdGlvbiA9ICgpID0+IHtcclxuICAgIGxldCBtZXNzYWdlT2JqZWN0OiBNZXNzYWdlT2JqZWN0PFRvRmdKb2luUm9vbVBheWxvYWQ+ID0geyBcclxuICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0pPSU5fUk9PTV9JTl9UQUIsIFxyXG4gICAgICAgIHBheWxvYWQ6IHtcclxuICAgICAgICAgICAgcm9vbUlkOiByb29tTmFtZUlucHV0LnZhbHVlLnRyaW0oKSwgXHJcbiAgICAgICAgICAgIHVzZXJOYW1lOiBuYW1lSW5wdXQudmFsdWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnb0ludG9Sb29tV2l0aFZhbGlkYXRpb24obWVzc2FnZU9iamVjdClcclxufVxyXG5cclxuY29uc3QgY3JlYXRlTmV3Um9vbVdpdGhWYWxpZGF0aW9uID0gKCkgPT4ge1xyXG4gICAgbGV0IG1lc3NhZ2VPYmplY3Q6IE1lc3NhZ2VPYmplY3Q8VG9GZ05ld1Jvb21QYXlsb2FkPiA9IHsgXHJcbiAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19DUkVBVEVfUk9PTV9JTl9UQUIsIFxyXG4gICAgICAgIHBheWxvYWQ6IHtcclxuICAgICAgICAgICAgcm9vbU5hbWU6IHJvb21OYW1lSW5wdXQudmFsdWUudHJpbSgpLCBcclxuICAgICAgICAgICAgdXNlck5hbWU6IG5hbWVJbnB1dC52YWx1ZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdvSW50b1Jvb21XaXRoVmFsaWRhdGlvbihtZXNzYWdlT2JqZWN0KVxyXG59XHJcblxyXG5jb25zdCBnb0ludG9Sb29tV2l0aFZhbGlkYXRpb24gPSAobWVzc2FnZU9iamVjdDogTWVzc2FnZU9iamVjdDxhbnk+KSA9PiB7XHJcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOnRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICBsZXQgYWN0aXZlVGFiSWQ6IG51bWJlciA9IHRhYnNbMF0uaWQ7XHJcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHsgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19WSURFT19PTl9TQ1JFRU4gfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8Ym9vbGVhbj4pID0+IHtcclxuICAgICAgICAgICAgaWYgKHJlc3Auc3RhdHVzID09PSBNZXNzYWdlcy5TVUNDRVNTICYmIHJlc3AucGF5bG9hZCAmJiB2YWxpZFJvb21JbnB1dCgpKSB7IFxyXG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIG1lc3NhZ2VPYmplY3QsIChyZXNwOiBSZXNwb25zZU9iamVjdDxUb1BvcHVwUm9vbVBheWxvYWQ+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3Auc3RhdHVzID09PSBNZXNzYWdlcy5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZVBhZ2UoIHsgcGFnZVR5cGU6IFBhZ2UuTUFJTiwgcm9vbUlkOiByZXNwLnBheWxvYWQucm9vbS5yb29tSWQsIHJvb21OYW1lOiByZXNwLnBheWxvYWQucm9vbS5yb29tTmFtZSB9IGFzIFBhZ2VNZXRhZGF0YSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTWFpblVzZXJzKHJlc3AucGF5bG9hZC5yb29tLnVzZXJzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRDaGF0T3BlblRvZ2dsZShyZXNwLnBheWxvYWQuY2hhdE9wZW4pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldE9mZnNldElucHV0KHJlc3AucGF5bG9hZC5vZmZzZXRUaW1lLCByZXNwLnBheWxvYWQudmlkZW9MZW5ndGgpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9KVxyXG59XHJcblxyXG5jb25zdCBjaGFuZ2VQYWdlID0gKHBhZ2VNZXRhZGF0YTogUGFnZU1ldGFkYXRhKSA9PiB7XHJcbiAgICBpZiAocGFnZU1ldGFkYXRhLnBhZ2VUeXBlID09PSBQYWdlLlNUQVJUKSB7XHJcbiAgICAgICAgc3RhcnRQYWdlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIG1haW5QYWdlLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICAgIGhlYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICByb29tTmFtZUlucHV0LnZhbHVlID0gcGFnZU1ldGFkYXRhLnJvb21OYW1lO1xyXG4gICAgICAgIG5hbWVJbnB1dC52YWx1ZSA9IFwiXCI7XHJcbiAgICB9IGVsc2UgaWYgKHBhZ2VNZXRhZGF0YS5wYWdlVHlwZSA9PT0gUGFnZS5NQUlOKSB7XHJcbiAgICAgICAgc3RhcnRQYWdlLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICAgIG1haW5QYWdlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIGhlYWRlci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgcm9vbU5hbWVFbGVtLmlubmVySFRNTCA9ICBgJHtwYWdlTWV0YWRhdGEucm9vbU5hbWV9YDtcclxuICAgICAgICByb29tSWRFbGVtLmlubmVySFRNTCA9IGAke3BhZ2VNZXRhZGF0YS5yb29tSWR9YDtcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IHVwZGF0ZU1haW5Vc2VycyA9ICh1c2VyczogQXJyYXk8VXNlcj4pID0+IHtcclxuICAgIGxvY2FsVXNlcnMgPSB1c2Vyc1xyXG4gICAgXHJcbiAgICBpZiAobG9jYWxVc2Vycy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICBzeW5jQnRuLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlZEJ0blwiKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzeW5jQnRuLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlZEJ0blwiKVxyXG4gICAgfVxyXG5cclxuICAgIHVzZXJzTGlzdENvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiXHJcbiAgICB1c2Vycy5mb3JFYWNoKHVzZXIgPT4ge1xyXG4gICAgICAgIGxldCB1c2VyRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJESVZcIik7XHJcbiAgICAgICAgdXNlckVsZW0uY2xhc3NMaXN0LmFkZChcInVzZXJFbGVtXCIpO1xyXG4gICAgICAgIGlmICghIXVzZXIuY3VycmVudCkge1xyXG4gICAgICAgICAgICB1c2VyRWxlbS5jbGFzc0xpc3QuYWRkKFwiY3VycmVudFVzZXJcIilcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHVzZXJJY29uID0gKHVzZXIuYWRtaW4gPyBcIjxpbWcgY2xhc3M9J3VzZXJJY29uJyBzcmM9Jy4uL2ltYWdlcy9hZG1pblVzZXIucG5nJyBhbHQ9J2FkbWludXNlcic+XCIgOiBcIjxpbWcgY2xhc3M9J3VzZXJJY29uJyBzcmM9Jy4uL2ltYWdlcy91c2VyLnBuZycgYWx0PSdub3JtYWx1c2VyJz5cIilcclxuICAgICAgICBsZXQgdXNlck5hbWUgPSAoISF1c2VyLmN1cnJlbnQgPyBgPHN0cm9uZz4ke3VzZXIudXNlck5hbWV9PC9zdHJvbmc+YCA6IGAke3VzZXIudXNlck5hbWV9YClcclxuICAgICAgICB1c2VyRWxlbS5pbm5lckhUTUwgPSB1c2VySWNvbitgPHNwYW4gc3R5bGU9XCJtYXJnaW4tbGVmdDo1cHg7IG1heC13aWR0aDogODAlOyB3b3JkLWJyZWFrOiBicmVhay1hbGxcIj4ke3VzZXJOYW1lfTwvc3Bhbj5gK2A8ZGl2IGNsYXNzPVwidXNlckNvbG9yQ2lyY2xlXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiR7dXNlci5jb2xvcn1cIj48L2Rpdj5gO1xyXG4gICAgICAgIHVzZXJzTGlzdENvbnRhaW5lci5hcHBlbmQodXNlckVsZW0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IHNldENoYXRPcGVuVG9nZ2xlID0gKGNoYXRPcGVuOiBCb29sZWFuKSA9PiB7XHJcbiAgICBpZiAoY2hhdE9wZW4pIHtcclxuICAgICAgICBjaGF0VG9nZ2xlQnRuLmNsYXNzTGlzdC5hZGQoJ3RvZ2dsZWRCdG4nKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjaGF0VG9nZ2xlQnRuLmNsYXNzTGlzdC5yZW1vdmUoJ3RvZ2dsZWRCdG4nKVxyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBzZXRPZmZzZXRJbnB1dCA9IChvZmZzZXRUaW1lOiBudW1iZXIsIHZpZGVvTGVuZ3RoOiBudW1iZXIpID0+IHtcclxuXHJcbiAgICAvLyBBZG1pbiBkb2VzIG5vdCBzZWUgb2Zmc2V0IGlucHV0XHJcbiAgICBpZiAobG9jYWxVc2Vycy5maW5kKHVzZXIgPT4gdXNlci5jdXJyZW50KT8uYWRtaW4pIHtcclxuICAgICAgICBvZmZzZXRDb250YWluZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9mZnNldFRpbWUgPiAwKSB7XHJcbiAgICAgICAgcG9zT2Zmc2V0QnRuLmNsYXNzTGlzdC5hZGQoJ3RvZ2dsZWRCdG4nKVxyXG4gICAgfVxyXG5cclxuICAgIG9mZnNldFRpbWUgPCAwID8gb2Zmc2V0VGltZSo9LTEgOiBudWxsXHJcblxyXG4gICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTMyMjczMi9jb252ZXJ0LXNlY29uZHMtdG8taGgtbW0tc3Mtd2l0aC1qYXZhc2NyaXB0XHJcbiAgICBsZXQgbWF4VGltZSA9IG5ldyBEYXRlKHZpZGVvTGVuZ3RoICogMTAwMCkudG9JU09TdHJpbmcoKS5zdWJzdHIoMTEsIDgpXHJcbiAgICBsZXQgY3VyVGltZSA9IG5ldyBEYXRlKG9mZnNldFRpbWUgKiAxMDAwKS50b0lTT1N0cmluZygpLnN1YnN0cigxMSwgOClcclxuICAgIG9mZnNldElucHV0LnNldEF0dHJpYnV0ZShcImRhdGEtZHVyYXRpb24tbWF4XCIsIG1heFRpbWUpXHJcbiAgICBvZmZzZXRJbnB1dC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWR1cmF0aW9uLW1pblwiLCBcIjAwOjAwOjAwXCIpXHJcbiAgICBvZmZzZXRJbnB1dC52YWx1ZSA9IGN1clRpbWVcclxufVxyXG5cclxuLy8gTWVzc2FnZSBoYW5kbGVyXHJcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigocmVxdWVzdDogTWVzc2FnZU9iamVjdDxhbnk+LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG5cclxuICAgIC8vQ2hlY2sgYmVsb3cgaXMgaW1wb3J0YW50IGIvYyBpZiB3ZSBoYXZlIG11bHRpcGxlIHBvcHVwcyBvcGVuIGluIGRpZmYgd2luZG93cywgd2UgZG9udCB3YW50IGFsbCByZWFjdGluZyB0byBzYW1lIGV2ZW50XHJcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OnRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICBsZXQgY3VyQWN0aXZlVGFiSWQgPSB0YWJzWzBdLmlkXHJcbiAgICAgICAgaWYgKHNlbmRlci50YWI/LmlkID09PSBjdXJBY3RpdmVUYWJJZCAmJiByZXF1ZXN0Lm1lc3NhZ2UgPT09IE1lc3NhZ2VzLlRPUE9QVVBfUk9PTV9EQVRBKSB7XHJcbiAgICAgICAgICAgIGxldCByZXFEYXRhID0gPFRvUG9wdXBSb29tUGF5bG9hZD5yZXF1ZXN0LnBheWxvYWRcclxuICAgICAgICAgICAgdXBkYXRlTWFpblVzZXJzKHJlcURhdGEucm9vbS51c2VycylcclxuICAgICAgICAgICAgc2V0T2Zmc2V0SW5wdXQocmVxRGF0YS5vZmZzZXRUaW1lLCByZXFEYXRhLnZpZGVvTGVuZ3RoKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG59KTtcclxuXHJcblxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=