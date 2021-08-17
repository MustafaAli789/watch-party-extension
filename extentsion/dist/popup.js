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
    Messages[Messages["TOBG_USER_CONNECTED"] = 11] = "TOBG_USER_CONNECTED";
    Messages[Messages["TOFG_IS_CHANNEL_OPEN"] = 12] = "TOFG_IS_CHANNEL_OPEN";
    Messages[Messages["TOBG_USER_DISCONNECTED"] = 13] = "TOBG_USER_DISCONNECTED";
    Messages[Messages["TOFG_CHAT_TOGGLE"] = 14] = "TOFG_CHAT_TOGGLE";
    Messages[Messages["TOFG_SET_OFFSET"] = 15] = "TOFG_SET_OFFSET";
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
const negOffsetBtn = document.getElementById("negOffsetBtn");
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
                var _a;
                pageMetadata.roomId = resp.payload.room.roomId;
                pageMetadata.roomName = resp.payload.room.roomName;
                pageMetadata.pageType = constants_1.Page.MAIN;
                chatToggled = resp.payload.chatOpen;
                updateMainUsers(resp.payload.room.users);
                setChatOpenToggle(chatToggled);
                changePage(pageMetadata);
                if (!((_a = resp.payload.room.users.find(user => user.current)) === null || _a === void 0 ? void 0 : _a.admin)) {
                    setOffsetInput(resp.payload.offsetTime, resp.payload.videoLength);
                }
                else {
                    offsetContainer.style.display = "none";
                }
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
negOffsetBtn.addEventListener('click', () => {
    setOffset("DOWN");
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
    negOffsetBtn.classList.remove('toggledBtn');
    if (direction === "UP") {
        posOffsetBtn.classList.add('toggledBtn');
    }
    else if (direction === "DOWN") {
        negOffsetBtn.classList.add('toggledBtn');
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
                    var _a;
                    if (resp.status === constants_1.Messages.SUCCESS) {
                        changePage({ pageType: constants_1.Page.MAIN, roomId: resp.payload.room.roomId, roomName: resp.payload.room.roomName });
                        updateMainUsers(resp.payload.room.users);
                        setChatOpenToggle(resp.payload.chatOpen);
                        //cur user is not admin (admin doesnt see offset shenanigans)
                        if (!((_a = resp.payload.room.users.find(user => user.current)) === null || _a === void 0 ? void 0 : _a.admin)) {
                            setOffsetInput(resp.payload.offsetTime, resp.payload.videoLength);
                        }
                        else {
                            offsetContainer.style.display = "none";
                        }
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
    if (offsetTime > 0) {
        posOffsetBtn.classList.add('toggledBtn');
    }
    else if (offsetTime < 0) {
        negOffsetBtn.classList.add('toggledBtn');
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
        var _a, _b;
        let curActiveTabId = tabs[0].id;
        if (((_a = sender.tab) === null || _a === void 0 ? void 0 : _a.id) === curActiveTabId && request.message === constants_1.Messages.TOPOPUP_ROOM_DATA) {
            let reqData = request.payload;
            updateMainUsers(reqData.room.users);
            //cur user is not admin (admin doesnt see offset shenanigans)
            if (!((_b = reqData.room.users.find(user => user.current)) === null || _b === void 0 ? void 0 : _b.admin)) {
                setOffsetInput(reqData.offsetTime, reqData.videoLength);
            }
            else {
                offsetContainer.style.display = "none";
            }
        }
    });
    return true;
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QU8sQ0FBQyxPQUFPLEtBQUssb0JBQVEsQ0FBQyxpQkFBaUIsRUFBRTtZQUNyRixJQUFJLE9BQU8sR0FBdUIsT0FBTyxDQUFDLE9BQU87WUFDakQsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBRW5DLDZEQUE2RDtZQUM3RCxJQUFJLENBQUMsY0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQywwQ0FBRSxLQUFLLEdBQUU7Z0JBQ3ZELGNBQWMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUM7YUFDMUQ7aUJBQU07Z0JBQ0gsZUFBZSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTTthQUN6QztTQUNKO0lBQ0wsQ0FBQyxDQUFDO0lBQ0YsT0FBTyxJQUFJO0FBQ2YsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leHRlbnRzaW9uLy4vbW9kZWxzL2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly9leHRlbnRzaW9uL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4dGVudHNpb24vLi9wb3B1cC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBQYWdle1xyXG4gICAgU1RBUlQsXHJcbiAgICBNQUlOXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIE1lc3NhZ2Vze1xyXG4gICAgU1VDQ0VTUyxcclxuICAgIEZBSUxVUkUsXHJcbiAgICBUT0ZHX1ZJREVPX09OX1NDUkVFTixcclxuICAgIFRPRkdfQ1JFQVRFX1JPT01fSU5fVEFCLFxyXG4gICAgVE9GR19KT0lOX1JPT01fSU5fVEFCLFxyXG4gICAgVE9GR19ESVNDT05ORUNULFxyXG4gICAgVE9GR19SRVRSSUVWRV9ST09NX0RBVEEsXHJcbiAgICBUT0ZHX0RPX1lPVV9FWElTVCxcclxuICAgIFRPRkdfU1lOQ19WSUQsXHJcbiAgICBUT1BPUFVQX0xFQVZFX1JPT00sXHJcbiAgICBUT1BPUFVQX1JPT01fREFUQSxcclxuICAgIFRPQkdfVVNFUl9DT05ORUNURUQsXHJcbiAgICBUT0ZHX0lTX0NIQU5ORUxfT1BFTixcclxuICAgIFRPQkdfVVNFUl9ESVNDT05ORUNURUQsXHJcbiAgICBUT0ZHX0NIQVRfVE9HR0xFLFxyXG4gICAgVE9GR19TRVRfT0ZGU0VUXHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IE1lc3NhZ2VzLCBQYWdlIH0gZnJvbSAnLi9tb2RlbHMvY29uc3RhbnRzJ1xyXG5pbXBvcnQgeyBUb0ZnSm9pblJvb21QYXlsb2FkLCBUb0ZnTmV3Um9vbVBheWxvYWQsIFRvRmdPZmZzZXRQYXlsb2FkLCBUb1BvcHVwUm9vbVBheWxvYWQgfSBmcm9tICcuL21vZGVscy9wYXlsb2Fkcyc7XHJcbmltcG9ydCB7IE1lc3NhZ2VPYmplY3QsIFJlc3BvbnNlT2JqZWN0LCAgfSBmcm9tICcuL21vZGVscy9tZXNzYWdlcGFzc2luZyc7XHJcbmltcG9ydCB7IFBhZ2VNZXRhZGF0YSB9IGZyb20gJy4vbW9kZWxzL3BhZ2VtZXRhZGF0YSc7XHJcblxyXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi4vc2hhcmVkbW9kZWxzL3VzZXInXHJcbmltcG9ydCB7ICB9IGZyb20gJy4uL3NoYXJlZG1vZGVscy9wYXlsb2FkcydcclxuXHJcbmxldCBsb2NhbFVzZXJzOiBVc2VyW10gPSBbXVxyXG5sZXQgY2hhdFRvZ2dsZWQ6IEJvb2xlYW4gPSB0cnVlXHJcblxyXG4vL0NvbnRhaW5lcnNcclxuY29uc3Qgc3RhcnRQYWdlOiBIVE1MRGl2RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRQYWdlXCIpO1xyXG5jb25zdCBtYWluUGFnZTogSFRNTERpdkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW5QYWdlXCIpO1xyXG5jb25zdCBoZWFkZXI6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNoZWFkZXJcIik7XHJcbmNvbnN0IHVzZXJzTGlzdENvbnRhaW5lcjogSFRNTERpdkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW5QYWdlIC51c2VycyAudXNlcnNMaXN0XCIpO1xyXG5jb25zdCBvZmZzZXRDb250YWluZXI6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAub2Zmc2V0Q29udGFpbmVyXCIpXHJcblxyXG4vL0J0dG9uc1xyXG5jb25zdCBuZXdSb29tQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UGFnZSAuYWRkSXRlbUNvbnRhaW5lciAubmV3Um9vbUJ0blwiKTtcclxuY29uc3Qgam9pblJvb21CdG46IEhUTUxCdXR0b25FbGVtZW50ID0gPEhUTUxCdXR0b25FbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRQYWdlIC5hZGRJdGVtQ29udGFpbmVyIC5qb2luUm9vbUJ0blwiKTtcclxuY29uc3QgbGVhdmVSb29tQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW5QYWdlIC5iYWNrQnRuXCIpO1xyXG5jb25zdCBjb3B5SW1nQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW5QYWdlIC5yb29tSWRDb250YWluZXIgLmNvcHlJbWdCdG5cIik7XHJcbmNvbnN0IHN5bmNCdG46IEhUTUxCdXR0b25FbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAuYWN0aW9ucyAuYWN0aW9uQnRucyAuc3luY0J0blwiKVxyXG5jb25zdCBjaGF0VG9nZ2xlQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblBhZ2UgLmFjdGlvbnMgLmFjdGlvbkJ0bnMgLmNoYXRUb2dnbGVcIilcclxuY29uc3QgcG9zT2Zmc2V0QnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBvc09mZnNldEJ0blwiKVxyXG5jb25zdCBuZWdPZmZzZXRCdG46IEhUTUxCdXR0b25FbGVtZW50ID0gPEhUTUxCdXR0b25FbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmVnT2Zmc2V0QnRuXCIpXHJcbmNvbnN0IHJlc2V0T2Zmc2V0QnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc2V0T2Zmc2V0QnRuXCIpXHJcblxyXG5cclxuXHJcbi8vSW5wdXRzXHJcbmNvbnN0IG5hbWVJbnB1dDogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRQYWdlIC5hZGRJdGVtQ29udGFpbmVyIC5uYW1lSW5wdXRcIik7XHJcbmNvbnN0IHJvb21OYW1lSW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UGFnZSAuYWRkSXRlbUNvbnRhaW5lciAucm9vbUlucHV0XCIpO1xyXG5jb25zdCBvZmZzZXRJbnB1dDogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblBhZ2UgLm9mZnNldENvbnRhaW5lciAuaHRtbC1kdXJhdGlvbi1waWNrZXJcIilcclxuXHJcbi8vVGV4dFxyXG5jb25zdCBlcnJvck1zZ0VsZW06IEhUTUxQYXJhZ3JhcGhFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFBhZ2UgLmFkZEl0ZW1Db250YWluZXIgLmVycm9yXCIpO1xyXG5jb25zdCByb29tSWRFbGVtOiBIVE1MU3BhbkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpblBhZ2UgLnJvb21JZENvbnRhaW5lciAucm9vbUlkJyk7XHJcbmNvbnN0IHJvb21OYW1lRWxlbTogSFRNTEhlYWRpbmdFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAuaGVhZCAucm9vbU5hbWVcIik7XHJcblxyXG5cclxuLy9Jbml0aWFsIG9wZW4gb2YgcG9wdXBcclxuY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTp0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlfSwgdGFicyA9PiB7XHJcbiAgICBsZXQgYWN0aXZlVGFiSWQgPSB0YWJzWzBdLmlkXHJcbiAgICBsZXQgcGFnZU1ldGFkYXRhOiBQYWdlTWV0YWRhdGEgPSA8UGFnZU1ldGFkYXRhPntyb29tTmFtZTogXCJcIiwgcGFnZVR5cGU6IFBhZ2UuU1RBUlR9XHJcblxyXG4gICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0lTX0NIQU5ORUxfT1BFTlxyXG4gICAgfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8Ym9vbGVhbj4pID0+IHtcclxuICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT0gTWVzc2FnZXMuU1VDQ0VTUyAmJiByZXNwLnBheWxvYWQpIHtcclxuICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfUkVUUklFVkVfUk9PTV9EQVRBXHJcbiAgICAgICAgICAgIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPiwgKHJlc3A6IFJlc3BvbnNlT2JqZWN0PFRvUG9wdXBSb29tUGF5bG9hZD4pID0+IHtcclxuICAgICAgICAgICAgICAgIHBhZ2VNZXRhZGF0YS5yb29tSWQgPSByZXNwLnBheWxvYWQucm9vbS5yb29tSWRcclxuICAgICAgICAgICAgICAgIHBhZ2VNZXRhZGF0YS5yb29tTmFtZSA9IHJlc3AucGF5bG9hZC5yb29tLnJvb21OYW1lXHJcbiAgICAgICAgICAgICAgICBwYWdlTWV0YWRhdGEucGFnZVR5cGUgPSBQYWdlLk1BSU5cclxuICAgICAgICAgICAgICAgIGNoYXRUb2dnbGVkID0gcmVzcC5wYXlsb2FkLmNoYXRPcGVuXHJcblxyXG4gICAgICAgICAgICAgICAgdXBkYXRlTWFpblVzZXJzKHJlc3AucGF5bG9hZC5yb29tLnVzZXJzKVxyXG4gICAgICAgICAgICAgICAgc2V0Q2hhdE9wZW5Ub2dnbGUoY2hhdFRvZ2dsZWQpXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VQYWdlKHBhZ2VNZXRhZGF0YSlcclxuICAgICAgICAgICAgICAgIGlmICghcmVzcC5wYXlsb2FkLnJvb20udXNlcnMuZmluZCh1c2VyID0+IHVzZXIuY3VycmVudCk/LmFkbWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0T2Zmc2V0SW5wdXQocmVzcC5wYXlsb2FkLm9mZnNldFRpbWUsIHJlc3AucGF5bG9hZC52aWRlb0xlbmd0aClcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0Q29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSBcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIGNoYW5nZVBhZ2UocGFnZU1ldGFkYXRhKTtcclxufSlcclxuXHJcbmNvbnN0IHZhbGlkUm9vbUlucHV0ID0gKCkgPT4ge1xyXG4gICAgaWYocm9vbU5hbWVJbnB1dC52YWx1ZS50cmltKCkgPT09IFwiXCIpIHtcclxuICAgICAgICBlcnJvck1zZ0VsZW0uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgZXJyb3JNc2dFbGVtLmlubmVySFRNTCA9ICdQbGVhc2UgZW50ZXIgYSByb29tL2lkJztcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2UgaWYgKG5hbWVJbnB1dC52YWx1ZS50cmltKCkubGVuZ3RoIDwgMykge1xyXG4gICAgICAgIGVycm9yTXNnRWxlbS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICBlcnJvck1zZ0VsZW0uaW5uZXJIVE1MID0gJ1BsZWFzZSBlbnRlciBhIHVzZXJuYW1lIGxvbmdlciB0aGFuIDMgY2hhcnMnO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZXJyb3JNc2dFbGVtLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICAgIGVycm9yTXNnRWxlbS5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxubmV3Um9vbUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIF8gPT4ge1xyXG4gICAgY3JlYXRlTmV3Um9vbVdpdGhWYWxpZGF0aW9uKCk7XHJcbn0pXHJcblxyXG5qb2luUm9vbUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xyXG4gICAgam9pblJvb21XaXRoVmFsaWRhdGlvbigpXHJcbn0pXHJcblxyXG5sZWF2ZVJvb21CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfID0+IHtcclxuICAgIGxlYXZlUm9vbSgpXHJcbn0pXHJcblxyXG5zeW5jQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgaWYgKGxvY2FsVXNlcnMubGVuZ3RoID09PSAxKXtcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGNocm9tZS50YWJzLnF1ZXJ5KHthY3RpdmU6dHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZX0sIHRhYnMgPT4ge1xyXG4gICAgICAgIGxldCBhY3RpdmVUYWJJZCA9IHRhYnNbMF0uaWRcclxuICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwge1xyXG4gICAgICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0lTX0NIQU5ORUxfT1BFTlxyXG4gICAgICAgIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPiwgKHJlc3A6IFJlc3BvbnNlT2JqZWN0PGJvb2xlYW4+KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXNwLnN0YXR1cyA9PSBNZXNzYWdlcy5TVUNDRVNTICYmIHJlc3AucGF5bG9hZCkge1xyXG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX1NZTkNfVklEXHJcbiAgICAgICAgICAgICAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfSlcclxufSlcclxuY2hhdFRvZ2dsZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGNoYXRUb2dnbGVkID0gIWNoYXRUb2dnbGVkXHJcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOnRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICBsZXQgYWN0aXZlVGFiSWQgPSB0YWJzWzBdLmlkXHJcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19JU19DSEFOTkVMX09QRU5cclxuICAgICAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIChyZXNwOiBSZXNwb25zZU9iamVjdDxib29sZWFuPikgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT0gTWVzc2FnZXMuU1VDQ0VTUyAmJiByZXNwLnBheWxvYWQpIHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19DSEFUX1RPR0dMRSxcclxuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkOiBjaGF0VG9nZ2xlZFxyXG4gICAgICAgICAgICAgICAgfSBhcyBNZXNzYWdlT2JqZWN0PEJvb2xlYW4+LCByZXNwID0+e1xyXG4gICAgICAgICAgICAgICAgICAgIHNldENoYXRPcGVuVG9nZ2xlKGNoYXRUb2dnbGVkKVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9KVxyXG59KVxyXG5cclxuY29uc3QgbGVhdmVSb29tID0gKCkgPT4ge1xyXG4gICAgY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTp0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlfSwgdGFicyA9PiB7XHJcbiAgICAgICAgbGV0IGFjdGl2ZVRhYklkID0gdGFic1swXS5pZFxyXG4gICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XHJcbiAgICAgICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfSVNfQ0hBTk5FTF9PUEVOXHJcbiAgICAgICAgfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8Ym9vbGVhbj4pID0+IHtcclxuICAgICAgICAgICAgaWYgKHJlc3Auc3RhdHVzID09IE1lc3NhZ2VzLlNVQ0NFU1MgJiYgcmVzcC5wYXlsb2FkKSB7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfRElTQ09OTkVDVFxyXG4gICAgICAgICAgICAgICAgfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICBjaGFuZ2VQYWdlKHsgcGFnZVR5cGU6IFBhZ2UuU1RBUlQsIHJvb21JZDogbnVsbCwgcm9vbU5hbWU6IFwiXCIgfSlcclxuICAgIH0pXHJcbn1cclxuXHJcbmNvcHlJbWdCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBsZXQgcm9vbUlkVmFsID0gcm9vbUlkRWxlbS5pbm5lckhUTUxcclxuICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHJvb21JZFZhbCkudGhlbigoKSA9PiB7XHJcbiAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgLy9GYWlsZWQgdG8gY29weVxyXG4gICAgfSlcclxufSlcclxuXHJcbnBvc09mZnNldEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIHNldE9mZnNldChcIlVQXCIpXHJcbn0pXHJcblxyXG5uZWdPZmZzZXRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBzZXRPZmZzZXQoXCJET1dOXCIpXHJcbn0pXHJcblxyXG5yZXNldE9mZnNldEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGlmIChvZmZzZXRJbnB1dC52YWx1ZSAhPT0gXCIwMDowMDowMFwiKSB7XHJcbiAgICAgICAgb2Zmc2V0SW5wdXQudmFsdWUgPSBcIjAwOjAwOjAwXCJcclxuICAgICAgICBzZXRPZmZzZXQobnVsbClcclxuICAgIH1cclxufSlcclxuXHJcbmNvbnN0IHNldE9mZnNldCA9IChkaXJlY3Rpb246IFwiVVBcIiB8IFwiRE9XTlwiKSA9PiB7XHJcbiAgICBsZXQgdGltZSA9IG9mZnNldElucHV0LnZhbHVlLnNwbGl0KFwiOlwiKVxyXG4gICAgbGV0IGhvdXJzID0gcGFyc2VJbnQodGltZVswXSlcclxuICAgIGxldCBtaW5zID0gcGFyc2VJbnQodGltZVsxXSlcclxuICAgIGxldCBzZWNzID0gcGFyc2VJbnQodGltZVsyXSlcclxuXHJcbiAgICBsZXQgb2Zmc2V0VGltZSA9IGhvdXJzKjM2MDAgKyBtaW5zKjYwICsgc2Vjc1xyXG5cclxuICAgIC8vIHNldHRpbmcgYnV0dG9uIHN0eWxlc1xyXG4gICAgcG9zT2Zmc2V0QnRuLmNsYXNzTGlzdC5yZW1vdmUoJ3RvZ2dsZWRCdG4nKVxyXG4gICAgbmVnT2Zmc2V0QnRuLmNsYXNzTGlzdC5yZW1vdmUoJ3RvZ2dsZWRCdG4nKVxyXG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJVUFwiKSB7XHJcbiAgICAgICAgcG9zT2Zmc2V0QnRuLmNsYXNzTGlzdC5hZGQoJ3RvZ2dsZWRCdG4nKVxyXG4gICAgfSBlbHNlIGlmKGRpcmVjdGlvbiA9PT0gXCJET1dOXCIpIHtcclxuICAgICAgICBuZWdPZmZzZXRCdG4uY2xhc3NMaXN0LmFkZCgndG9nZ2xlZEJ0bicpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKChvZmZzZXRUaW1lID4gMCAmJiBkaXJlY3Rpb24gIT09IG51bGwpIHx8ICghZGlyZWN0aW9uICYmIG9mZnNldFRpbWUgPT09IDApKSB7XHJcbiAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTp0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlfSwgdGFicyA9PiB7XHJcbiAgICAgICAgICAgIGxldCBhY3RpdmVUYWJJZCA9IHRhYnNbMF0uaWRcclxuICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfSVNfQ0hBTk5FTF9PUEVOXHJcbiAgICAgICAgICAgIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPiwgKHJlc3A6IFJlc3BvbnNlT2JqZWN0PGJvb2xlYW4+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT0gTWVzc2FnZXMuU1VDQ0VTUyAmJiByZXNwLnBheWxvYWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX1NFVF9PRkZTRVQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgb2Zmc2V0VGltZTogb2Zmc2V0VGltZSwgZGlyZWN0aW9uOiBkaXJlY3Rpb24gfVxyXG4gICAgICAgICAgICAgICAgICAgIH0gYXMgTWVzc2FnZU9iamVjdDxUb0ZnT2Zmc2V0UGF5bG9hZD4pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufVxyXG5cclxuY29uc3Qgam9pblJvb21XaXRoVmFsaWRhdGlvbiA9ICgpID0+IHtcclxuICAgIGxldCBtZXNzYWdlT2JqZWN0OiBNZXNzYWdlT2JqZWN0PFRvRmdKb2luUm9vbVBheWxvYWQ+ID0geyBcclxuICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0pPSU5fUk9PTV9JTl9UQUIsIFxyXG4gICAgICAgIHBheWxvYWQ6IHtcclxuICAgICAgICAgICAgcm9vbUlkOiByb29tTmFtZUlucHV0LnZhbHVlLnRyaW0oKSwgXHJcbiAgICAgICAgICAgIHVzZXJOYW1lOiBuYW1lSW5wdXQudmFsdWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnb0ludG9Sb29tV2l0aFZhbGlkYXRpb24obWVzc2FnZU9iamVjdClcclxufVxyXG5cclxuY29uc3QgY3JlYXRlTmV3Um9vbVdpdGhWYWxpZGF0aW9uID0gKCkgPT4ge1xyXG4gICAgbGV0IG1lc3NhZ2VPYmplY3Q6IE1lc3NhZ2VPYmplY3Q8VG9GZ05ld1Jvb21QYXlsb2FkPiA9IHsgXHJcbiAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19DUkVBVEVfUk9PTV9JTl9UQUIsIFxyXG4gICAgICAgIHBheWxvYWQ6IHtcclxuICAgICAgICAgICAgcm9vbU5hbWU6IHJvb21OYW1lSW5wdXQudmFsdWUudHJpbSgpLCBcclxuICAgICAgICAgICAgdXNlck5hbWU6IG5hbWVJbnB1dC52YWx1ZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdvSW50b1Jvb21XaXRoVmFsaWRhdGlvbihtZXNzYWdlT2JqZWN0KVxyXG59XHJcblxyXG5jb25zdCBnb0ludG9Sb29tV2l0aFZhbGlkYXRpb24gPSAobWVzc2FnZU9iamVjdDogTWVzc2FnZU9iamVjdDxhbnk+KSA9PiB7XHJcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOnRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICBsZXQgYWN0aXZlVGFiSWQ6IG51bWJlciA9IHRhYnNbMF0uaWQ7XHJcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHsgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19WSURFT19PTl9TQ1JFRU4gfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8Ym9vbGVhbj4pID0+IHtcclxuICAgICAgICAgICAgaWYgKHJlc3Auc3RhdHVzID09PSBNZXNzYWdlcy5TVUNDRVNTICYmIHJlc3AucGF5bG9hZCAmJiB2YWxpZFJvb21JbnB1dCgpKSB7IFxyXG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIG1lc3NhZ2VPYmplY3QsIChyZXNwOiBSZXNwb25zZU9iamVjdDxUb1BvcHVwUm9vbVBheWxvYWQ+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3Auc3RhdHVzID09PSBNZXNzYWdlcy5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZVBhZ2UoIHsgcGFnZVR5cGU6IFBhZ2UuTUFJTiwgcm9vbUlkOiByZXNwLnBheWxvYWQucm9vbS5yb29tSWQsIHJvb21OYW1lOiByZXNwLnBheWxvYWQucm9vbS5yb29tTmFtZSB9IGFzIFBhZ2VNZXRhZGF0YSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTWFpblVzZXJzKHJlc3AucGF5bG9hZC5yb29tLnVzZXJzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRDaGF0T3BlblRvZ2dsZShyZXNwLnBheWxvYWQuY2hhdE9wZW4pXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2N1ciB1c2VyIGlzIG5vdCBhZG1pbiAoYWRtaW4gZG9lc250IHNlZSBvZmZzZXQgc2hlbmFuaWdhbnMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzcC5wYXlsb2FkLnJvb20udXNlcnMuZmluZCh1c2VyID0+IHVzZXIuY3VycmVudCk/LmFkbWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRPZmZzZXRJbnB1dChyZXNwLnBheWxvYWQub2Zmc2V0VGltZSwgcmVzcC5wYXlsb2FkLnZpZGVvTGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0Q29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9KVxyXG59XHJcblxyXG5jb25zdCBjaGFuZ2VQYWdlID0gKHBhZ2VNZXRhZGF0YTogUGFnZU1ldGFkYXRhKSA9PiB7XHJcbiAgICBpZiAocGFnZU1ldGFkYXRhLnBhZ2VUeXBlID09PSBQYWdlLlNUQVJUKSB7XHJcbiAgICAgICAgc3RhcnRQYWdlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIG1haW5QYWdlLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICAgIGhlYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICByb29tTmFtZUlucHV0LnZhbHVlID0gcGFnZU1ldGFkYXRhLnJvb21OYW1lO1xyXG4gICAgICAgIG5hbWVJbnB1dC52YWx1ZSA9IFwiXCI7XHJcbiAgICB9IGVsc2UgaWYgKHBhZ2VNZXRhZGF0YS5wYWdlVHlwZSA9PT0gUGFnZS5NQUlOKSB7XHJcbiAgICAgICAgc3RhcnRQYWdlLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICAgIG1haW5QYWdlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIGhlYWRlci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgcm9vbU5hbWVFbGVtLmlubmVySFRNTCA9ICBgJHtwYWdlTWV0YWRhdGEucm9vbU5hbWV9YDtcclxuICAgICAgICByb29tSWRFbGVtLmlubmVySFRNTCA9IGAke3BhZ2VNZXRhZGF0YS5yb29tSWR9YDtcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IHVwZGF0ZU1haW5Vc2VycyA9ICh1c2VyczogQXJyYXk8VXNlcj4pID0+IHtcclxuICAgIGxvY2FsVXNlcnMgPSB1c2Vyc1xyXG4gICAgXHJcbiAgICBpZiAobG9jYWxVc2Vycy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICBzeW5jQnRuLmNsYXNzTGlzdC5hZGQoXCJkaXNhYmxlZEJ0blwiKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBzeW5jQnRuLmNsYXNzTGlzdC5yZW1vdmUoXCJkaXNhYmxlZEJ0blwiKVxyXG4gICAgfVxyXG5cclxuICAgIHVzZXJzTGlzdENvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiXHJcbiAgICB1c2Vycy5mb3JFYWNoKHVzZXIgPT4ge1xyXG4gICAgICAgIGxldCB1c2VyRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJESVZcIik7XHJcbiAgICAgICAgdXNlckVsZW0uY2xhc3NMaXN0LmFkZChcInVzZXJFbGVtXCIpO1xyXG4gICAgICAgIGlmICghIXVzZXIuY3VycmVudCkge1xyXG4gICAgICAgICAgICB1c2VyRWxlbS5jbGFzc0xpc3QuYWRkKFwiY3VycmVudFVzZXJcIilcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHVzZXJJY29uID0gKHVzZXIuYWRtaW4gPyBcIjxpbWcgY2xhc3M9J3VzZXJJY29uJyBzcmM9Jy4uL2ltYWdlcy9hZG1pblVzZXIucG5nJyBhbHQ9J2FkbWludXNlcic+XCIgOiBcIjxpbWcgY2xhc3M9J3VzZXJJY29uJyBzcmM9Jy4uL2ltYWdlcy91c2VyLnBuZycgYWx0PSdub3JtYWx1c2VyJz5cIilcclxuICAgICAgICBsZXQgdXNlck5hbWUgPSAoISF1c2VyLmN1cnJlbnQgPyBgPHN0cm9uZz4ke3VzZXIudXNlck5hbWV9PC9zdHJvbmc+YCA6IGAke3VzZXIudXNlck5hbWV9YClcclxuICAgICAgICB1c2VyRWxlbS5pbm5lckhUTUwgPSB1c2VySWNvbitgPHNwYW4gc3R5bGU9XCJtYXJnaW4tbGVmdDo1cHg7IG1heC13aWR0aDogODAlOyB3b3JkLWJyZWFrOiBicmVhay1hbGxcIj4ke3VzZXJOYW1lfTwvc3Bhbj5gK2A8ZGl2IGNsYXNzPVwidXNlckNvbG9yQ2lyY2xlXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiR7dXNlci5jb2xvcn1cIj48L2Rpdj5gO1xyXG4gICAgICAgIHVzZXJzTGlzdENvbnRhaW5lci5hcHBlbmQodXNlckVsZW0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNvbnN0IHNldENoYXRPcGVuVG9nZ2xlID0gKGNoYXRPcGVuOiBCb29sZWFuKSA9PiB7XHJcbiAgICBpZiAoY2hhdE9wZW4pIHtcclxuICAgICAgICBjaGF0VG9nZ2xlQnRuLmNsYXNzTGlzdC5hZGQoJ3RvZ2dsZWRCdG4nKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjaGF0VG9nZ2xlQnRuLmNsYXNzTGlzdC5yZW1vdmUoJ3RvZ2dsZWRCdG4nKVxyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBzZXRPZmZzZXRJbnB1dCA9IChvZmZzZXRUaW1lOiBudW1iZXIsIHZpZGVvTGVuZ3RoOiBudW1iZXIpID0+IHtcclxuXHJcbiAgICBpZiAob2Zmc2V0VGltZSA+IDApIHtcclxuICAgICAgICBwb3NPZmZzZXRCdG4uY2xhc3NMaXN0LmFkZCgndG9nZ2xlZEJ0bicpXHJcbiAgICB9IGVsc2UgaWYgKG9mZnNldFRpbWUgPCAwKSB7XHJcbiAgICAgICAgbmVnT2Zmc2V0QnRuLmNsYXNzTGlzdC5hZGQoJ3RvZ2dsZWRCdG4nKVxyXG4gICAgfVxyXG5cclxuICAgIG9mZnNldFRpbWUgPCAwID8gb2Zmc2V0VGltZSo9LTEgOiBudWxsXHJcblxyXG4gICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTMyMjczMi9jb252ZXJ0LXNlY29uZHMtdG8taGgtbW0tc3Mtd2l0aC1qYXZhc2NyaXB0XHJcbiAgICBsZXQgbWF4VGltZSA9IG5ldyBEYXRlKHZpZGVvTGVuZ3RoICogMTAwMCkudG9JU09TdHJpbmcoKS5zdWJzdHIoMTEsIDgpXHJcbiAgICBsZXQgY3VyVGltZSA9IG5ldyBEYXRlKG9mZnNldFRpbWUgKiAxMDAwKS50b0lTT1N0cmluZygpLnN1YnN0cigxMSwgOClcclxuICAgIG9mZnNldElucHV0LnNldEF0dHJpYnV0ZShcImRhdGEtZHVyYXRpb24tbWF4XCIsIG1heFRpbWUpXHJcbiAgICBvZmZzZXRJbnB1dC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWR1cmF0aW9uLW1pblwiLCBcIjAwOjAwOjAwXCIpXHJcbiAgICBvZmZzZXRJbnB1dC52YWx1ZSA9IGN1clRpbWVcclxufVxyXG5cclxuLy8gTWVzc2FnZSBoYW5kbGVyXHJcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigocmVxdWVzdDogTWVzc2FnZU9iamVjdDxhbnk+LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG5cclxuICAgIC8vQ2hlY2sgYmVsb3cgaXMgaW1wb3J0YW50IGIvYyBpZiB3ZSBoYXZlIG11bHRpcGxlIHBvcHVwcyBvcGVuIGluIGRpZmYgd2luZG93cywgd2UgZG9udCB3YW50IGFsbCByZWFjdGluZyB0byBzYW1lIGV2ZW50XHJcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OnRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICBsZXQgY3VyQWN0aXZlVGFiSWQgPSB0YWJzWzBdLmlkXHJcbiAgICAgICAgaWYgKHNlbmRlci50YWI/LmlkID09PSBjdXJBY3RpdmVUYWJJZCAmJiByZXF1ZXN0Lm1lc3NhZ2UgPT09IE1lc3NhZ2VzLlRPUE9QVVBfUk9PTV9EQVRBKSB7XHJcbiAgICAgICAgICAgIGxldCByZXFEYXRhID0gPFRvUG9wdXBSb29tUGF5bG9hZD5yZXF1ZXN0LnBheWxvYWRcclxuICAgICAgICAgICAgdXBkYXRlTWFpblVzZXJzKHJlcURhdGEucm9vbS51c2VycylcclxuXHJcbiAgICAgICAgICAgIC8vY3VyIHVzZXIgaXMgbm90IGFkbWluIChhZG1pbiBkb2VzbnQgc2VlIG9mZnNldCBzaGVuYW5pZ2FucylcclxuICAgICAgICAgICAgaWYgKCFyZXFEYXRhLnJvb20udXNlcnMuZmluZCh1c2VyID0+IHVzZXIuY3VycmVudCk/LmFkbWluKSB7XHJcbiAgICAgICAgICAgICAgICBzZXRPZmZzZXRJbnB1dChyZXFEYXRhLm9mZnNldFRpbWUsIHJlcURhdGEudmlkZW9MZW5ndGgpXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBvZmZzZXRDb250YWluZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KVxyXG4gICAgcmV0dXJuIHRydWVcclxufSk7XHJcblxyXG5cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9