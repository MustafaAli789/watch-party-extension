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
        var _a;
        let curActiveTabId = tabs[0].id;
        if (((_a = sender.tab) === null || _a === void 0 ? void 0 : _a.id) === curActiveTabId && request.message === constants_1.Messages.TOPOPUP_ROOM_DATA) {
            let reqData = request.payload;
            updateMainUsers(reqData.room.users);
        }
    });
    return true;
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFLLG9CQUFRLENBQUMsaUJBQWlCLEVBQUU7WUFDckYsSUFBSSxPQUFPLEdBQXVCLE9BQU8sQ0FBQyxPQUFPO1lBQ2pELGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztTQUN0QztJQUNMLENBQUMsQ0FBQztJQUNGLE9BQU8sSUFBSTtBQUNmLENBQUMsQ0FBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi8uL21vZGVscy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leHRlbnRzaW9uLy4vcG9wdXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGVudW0gUGFnZXtcclxuICAgIFNUQVJULFxyXG4gICAgTUFJTlxyXG59XHJcblxyXG5leHBvcnQgZW51bSBNZXNzYWdlc3tcclxuICAgIFNVQ0NFU1MsXHJcbiAgICBGQUlMVVJFLFxyXG4gICAgVE9GR19WSURFT19PTl9TQ1JFRU4sXHJcbiAgICBUT0ZHX0NSRUFURV9ST09NX0lOX1RBQixcclxuICAgIFRPRkdfSk9JTl9ST09NX0lOX1RBQixcclxuICAgIFRPRkdfRElTQ09OTkVDVCxcclxuICAgIFRPRkdfUkVUUklFVkVfUk9PTV9EQVRBLFxyXG4gICAgVE9GR19ET19ZT1VfRVhJU1QsXHJcbiAgICBUT0ZHX1NZTkNfVklELFxyXG4gICAgVE9QT1BVUF9MRUFWRV9ST09NLFxyXG4gICAgVE9QT1BVUF9ST09NX0RBVEEsXHJcbiAgICBUT0JHX1VTRVJfQ09OTkVDVEVELFxyXG4gICAgVE9GR19JU19DSEFOTkVMX09QRU4sXHJcbiAgICBUT0JHX1VTRVJfRElTQ09OTkVDVEVELFxyXG4gICAgVE9GR19DSEFUX1RPR0dMRSxcclxuICAgIFRPRkdfU0VUX09GRlNFVFxyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJpbXBvcnQgeyBNZXNzYWdlcywgUGFnZSB9IGZyb20gJy4vbW9kZWxzL2NvbnN0YW50cydcclxuaW1wb3J0IHsgVG9GZ0pvaW5Sb29tUGF5bG9hZCwgVG9GZ05ld1Jvb21QYXlsb2FkLCBUb0ZnT2Zmc2V0UGF5bG9hZCwgVG9Qb3B1cFJvb21QYXlsb2FkIH0gZnJvbSAnLi9tb2RlbHMvcGF5bG9hZHMnO1xyXG5pbXBvcnQgeyBNZXNzYWdlT2JqZWN0LCBSZXNwb25zZU9iamVjdCwgIH0gZnJvbSAnLi9tb2RlbHMvbWVzc2FnZXBhc3NpbmcnO1xyXG5pbXBvcnQgeyBQYWdlTWV0YWRhdGEgfSBmcm9tICcuL21vZGVscy9wYWdlbWV0YWRhdGEnO1xyXG5cclxuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4uL3NoYXJlZG1vZGVscy91c2VyJ1xyXG5pbXBvcnQgeyAgfSBmcm9tICcuLi9zaGFyZWRtb2RlbHMvcGF5bG9hZHMnXHJcblxyXG5sZXQgbG9jYWxVc2VyczogVXNlcltdID0gW11cclxubGV0IGNoYXRUb2dnbGVkOiBCb29sZWFuID0gdHJ1ZVxyXG5cclxuLy9Db250YWluZXJzXHJcbmNvbnN0IHN0YXJ0UGFnZTogSFRNTERpdkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UGFnZVwiKTtcclxuY29uc3QgbWFpblBhZ2U6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZVwiKTtcclxuY29uc3QgaGVhZGVyOiBIVE1MRGl2RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaGVhZGVyXCIpO1xyXG5jb25zdCB1c2Vyc0xpc3RDb250YWluZXI6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAudXNlcnMgLnVzZXJzTGlzdFwiKTtcclxuY29uc3Qgb2Zmc2V0Q29udGFpbmVyOiBIVE1MRGl2RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblBhZ2UgLm9mZnNldENvbnRhaW5lclwiKVxyXG5cclxuLy9CdHRvbnNcclxuY29uc3QgbmV3Um9vbUJ0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFBhZ2UgLmFkZEl0ZW1Db250YWluZXIgLm5ld1Jvb21CdG5cIik7XHJcbmNvbnN0IGpvaW5Sb29tQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UGFnZSAuYWRkSXRlbUNvbnRhaW5lciAuam9pblJvb21CdG5cIik7XHJcbmNvbnN0IGxlYXZlUm9vbUJ0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAuYmFja0J0blwiKTtcclxuY29uc3QgY29weUltZ0J0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAucm9vbUlkQ29udGFpbmVyIC5jb3B5SW1nQnRuXCIpO1xyXG5jb25zdCBzeW5jQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblBhZ2UgLmFjdGlvbnMgLmFjdGlvbkJ0bnMgLnN5bmNCdG5cIilcclxuY29uc3QgY2hhdFRvZ2dsZUJ0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW5QYWdlIC5hY3Rpb25zIC5hY3Rpb25CdG5zIC5jaGF0VG9nZ2xlXCIpXHJcbmNvbnN0IHBvc09mZnNldEJ0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb3NPZmZzZXRCdG5cIilcclxuY29uc3QgbmVnT2Zmc2V0QnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5lZ09mZnNldEJ0blwiKVxyXG5jb25zdCByZXNldE9mZnNldEJ0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXNldE9mZnNldEJ0blwiKVxyXG5cclxuXHJcblxyXG4vL0lucHV0c1xyXG5jb25zdCBuYW1lSW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UGFnZSAuYWRkSXRlbUNvbnRhaW5lciAubmFtZUlucHV0XCIpO1xyXG5jb25zdCByb29tTmFtZUlucHV0OiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFBhZ2UgLmFkZEl0ZW1Db250YWluZXIgLnJvb21JbnB1dFwiKTtcclxuY29uc3Qgb2Zmc2V0SW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW5QYWdlIC5vZmZzZXRDb250YWluZXIgLmh0bWwtZHVyYXRpb24tcGlja2VyXCIpXHJcblxyXG4vL1RleHRcclxuY29uc3QgZXJyb3JNc2dFbGVtOiBIVE1MUGFyYWdyYXBoRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRQYWdlIC5hZGRJdGVtQ29udGFpbmVyIC5lcnJvclwiKTtcclxuY29uc3Qgcm9vbUlkRWxlbTogSFRNTFNwYW5FbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21haW5QYWdlIC5yb29tSWRDb250YWluZXIgLnJvb21JZCcpO1xyXG5jb25zdCByb29tTmFtZUVsZW06IEhUTUxIZWFkaW5nRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblBhZ2UgLmhlYWQgLnJvb21OYW1lXCIpO1xyXG5cclxuXHJcbi8vSW5pdGlhbCBvcGVuIG9mIHBvcHVwXHJcbmNocm9tZS50YWJzLnF1ZXJ5KHthY3RpdmU6dHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZX0sIHRhYnMgPT4ge1xyXG4gICAgbGV0IGFjdGl2ZVRhYklkID0gdGFic1swXS5pZFxyXG4gICAgbGV0IHBhZ2VNZXRhZGF0YTogUGFnZU1ldGFkYXRhID0gPFBhZ2VNZXRhZGF0YT57cm9vbU5hbWU6IFwiXCIsIHBhZ2VUeXBlOiBQYWdlLlNUQVJUfVxyXG5cclxuICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XHJcbiAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19JU19DSEFOTkVMX09QRU5cclxuICAgIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPiwgKHJlc3A6IFJlc3BvbnNlT2JqZWN0PGJvb2xlYW4+KSA9PiB7XHJcbiAgICAgICAgaWYgKHJlc3Auc3RhdHVzID09IE1lc3NhZ2VzLlNVQ0NFU1MgJiYgcmVzcC5wYXlsb2FkKSB7XHJcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX1JFVFJJRVZFX1JPT01fREFUQVxyXG4gICAgICAgICAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIChyZXNwOiBSZXNwb25zZU9iamVjdDxUb1BvcHVwUm9vbVBheWxvYWQ+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBwYWdlTWV0YWRhdGEucm9vbUlkID0gcmVzcC5wYXlsb2FkLnJvb20ucm9vbUlkXHJcbiAgICAgICAgICAgICAgICBwYWdlTWV0YWRhdGEucm9vbU5hbWUgPSByZXNwLnBheWxvYWQucm9vbS5yb29tTmFtZVxyXG4gICAgICAgICAgICAgICAgcGFnZU1ldGFkYXRhLnBhZ2VUeXBlID0gUGFnZS5NQUlOXHJcbiAgICAgICAgICAgICAgICBjaGF0VG9nZ2xlZCA9IHJlc3AucGF5bG9hZC5jaGF0T3BlblxyXG5cclxuICAgICAgICAgICAgICAgIHVwZGF0ZU1haW5Vc2VycyhyZXNwLnBheWxvYWQucm9vbS51c2VycylcclxuICAgICAgICAgICAgICAgIHNldENoYXRPcGVuVG9nZ2xlKGNoYXRUb2dnbGVkKVxyXG4gICAgICAgICAgICAgICAgY2hhbmdlUGFnZShwYWdlTWV0YWRhdGEpXHJcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3AucGF5bG9hZC5yb29tLnVzZXJzLmZpbmQodXNlciA9PiB1c2VyLmN1cnJlbnQpPy5hZG1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHNldE9mZnNldElucHV0KHJlc3AucGF5bG9hZC5vZmZzZXRUaW1lLCByZXNwLnBheWxvYWQudmlkZW9MZW5ndGgpXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldENvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkgXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICBjaGFuZ2VQYWdlKHBhZ2VNZXRhZGF0YSk7XHJcbn0pXHJcblxyXG5jb25zdCB2YWxpZFJvb21JbnB1dCA9ICgpID0+IHtcclxuICAgIGlmKHJvb21OYW1lSW5wdXQudmFsdWUudHJpbSgpID09PSBcIlwiKSB7XHJcbiAgICAgICAgZXJyb3JNc2dFbGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIGVycm9yTXNnRWxlbS5pbm5lckhUTUwgPSAnUGxlYXNlIGVudGVyIGEgcm9vbS9pZCc7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIGlmIChuYW1lSW5wdXQudmFsdWUudHJpbSgpLmxlbmd0aCA8IDMpIHtcclxuICAgICAgICBlcnJvck1zZ0VsZW0uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgZXJyb3JNc2dFbGVtLmlubmVySFRNTCA9ICdQbGVhc2UgZW50ZXIgYSB1c2VybmFtZSBsb25nZXIgdGhhbiAzIGNoYXJzJztcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVycm9yTXNnRWxlbS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgICBlcnJvck1zZ0VsZW0uaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbm5ld1Jvb21CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfID0+IHtcclxuICAgIGNyZWF0ZU5ld1Jvb21XaXRoVmFsaWRhdGlvbigpO1xyXG59KVxyXG5cclxuam9pblJvb21CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcclxuICAgIGpvaW5Sb29tV2l0aFZhbGlkYXRpb24oKVxyXG59KVxyXG5cclxubGVhdmVSb29tQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXyA9PiB7XHJcbiAgICBsZWF2ZVJvb20oKVxyXG59KVxyXG5cclxuc3luY0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGlmIChsb2NhbFVzZXJzLmxlbmd0aCA9PT0gMSl7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOnRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICBsZXQgYWN0aXZlVGFiSWQgPSB0YWJzWzBdLmlkXHJcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19JU19DSEFOTkVMX09QRU5cclxuICAgICAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIChyZXNwOiBSZXNwb25zZU9iamVjdDxib29sZWFuPikgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT0gTWVzc2FnZXMuU1VDQ0VTUyAmJiByZXNwLnBheWxvYWQpIHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19TWU5DX1ZJRFxyXG4gICAgICAgICAgICAgICAgfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcbn0pXHJcbmNoYXRUb2dnbGVCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBjaGF0VG9nZ2xlZCA9ICFjaGF0VG9nZ2xlZFxyXG4gICAgY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTp0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlfSwgdGFicyA9PiB7XHJcbiAgICAgICAgbGV0IGFjdGl2ZVRhYklkID0gdGFic1swXS5pZFxyXG4gICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XHJcbiAgICAgICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfSVNfQ0hBTk5FTF9PUEVOXHJcbiAgICAgICAgfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8Ym9vbGVhbj4pID0+IHtcclxuICAgICAgICAgICAgaWYgKHJlc3Auc3RhdHVzID09IE1lc3NhZ2VzLlNVQ0NFU1MgJiYgcmVzcC5wYXlsb2FkKSB7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfQ0hBVF9UT0dHTEUsXHJcbiAgICAgICAgICAgICAgICAgICAgcGF5bG9hZDogY2hhdFRvZ2dsZWRcclxuICAgICAgICAgICAgICAgIH0gYXMgTWVzc2FnZU9iamVjdDxCb29sZWFuPiwgcmVzcCA9PntcclxuICAgICAgICAgICAgICAgICAgICBzZXRDaGF0T3BlblRvZ2dsZShjaGF0VG9nZ2xlZClcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfSlcclxufSlcclxuXHJcbmNvbnN0IGxlYXZlUm9vbSA9ICgpID0+IHtcclxuICAgIGNocm9tZS50YWJzLnF1ZXJ5KHthY3RpdmU6dHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZX0sIHRhYnMgPT4ge1xyXG4gICAgICAgIGxldCBhY3RpdmVUYWJJZCA9IHRhYnNbMF0uaWRcclxuICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwge1xyXG4gICAgICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0lTX0NIQU5ORUxfT1BFTlxyXG4gICAgICAgIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPiwgKHJlc3A6IFJlc3BvbnNlT2JqZWN0PGJvb2xlYW4+KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXNwLnN0YXR1cyA9PSBNZXNzYWdlcy5TVUNDRVNTICYmIHJlc3AucGF5bG9hZCkge1xyXG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0RJU0NPTk5FQ1RcclxuICAgICAgICAgICAgICAgIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgY2hhbmdlUGFnZSh7IHBhZ2VUeXBlOiBQYWdlLlNUQVJULCByb29tSWQ6IG51bGwsIHJvb21OYW1lOiBcIlwiIH0pXHJcbiAgICB9KVxyXG59XHJcblxyXG5jb3B5SW1nQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgbGV0IHJvb21JZFZhbCA9IHJvb21JZEVsZW0uaW5uZXJIVE1MXHJcbiAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChyb29tSWRWYWwpLnRoZW4oKCkgPT4ge1xyXG4gICAgfSwgKCkgPT4ge1xyXG4gICAgICAgIC8vRmFpbGVkIHRvIGNvcHlcclxuICAgIH0pXHJcbn0pXHJcblxyXG5wb3NPZmZzZXRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBzZXRPZmZzZXQoXCJVUFwiKVxyXG59KVxyXG5cclxubmVnT2Zmc2V0QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgc2V0T2Zmc2V0KFwiRE9XTlwiKVxyXG59KVxyXG5cclxucmVzZXRPZmZzZXRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBpZiAob2Zmc2V0SW5wdXQudmFsdWUgIT09IFwiMDA6MDA6MDBcIikge1xyXG4gICAgICAgIG9mZnNldElucHV0LnZhbHVlID0gXCIwMDowMDowMFwiXHJcbiAgICAgICAgc2V0T2Zmc2V0KG51bGwpXHJcbiAgICB9XHJcbn0pXHJcblxyXG5jb25zdCBzZXRPZmZzZXQgPSAoZGlyZWN0aW9uOiBcIlVQXCIgfCBcIkRPV05cIikgPT4ge1xyXG4gICAgbGV0IHRpbWUgPSBvZmZzZXRJbnB1dC52YWx1ZS5zcGxpdChcIjpcIilcclxuICAgIGxldCBob3VycyA9IHBhcnNlSW50KHRpbWVbMF0pXHJcbiAgICBsZXQgbWlucyA9IHBhcnNlSW50KHRpbWVbMV0pXHJcbiAgICBsZXQgc2VjcyA9IHBhcnNlSW50KHRpbWVbMl0pXHJcblxyXG4gICAgbGV0IG9mZnNldFRpbWUgPSBob3VycyozNjAwICsgbWlucyo2MCArIHNlY3NcclxuXHJcbiAgICAvLyBzZXR0aW5nIGJ1dHRvbiBzdHlsZXNcclxuICAgIHBvc09mZnNldEJ0bi5jbGFzc0xpc3QucmVtb3ZlKCd0b2dnbGVkQnRuJylcclxuICAgIG5lZ09mZnNldEJ0bi5jbGFzc0xpc3QucmVtb3ZlKCd0b2dnbGVkQnRuJylcclxuICAgIGlmIChkaXJlY3Rpb24gPT09IFwiVVBcIikge1xyXG4gICAgICAgIHBvc09mZnNldEJ0bi5jbGFzc0xpc3QuYWRkKCd0b2dnbGVkQnRuJylcclxuICAgIH0gZWxzZSBpZihkaXJlY3Rpb24gPT09IFwiRE9XTlwiKSB7XHJcbiAgICAgICAgbmVnT2Zmc2V0QnRuLmNsYXNzTGlzdC5hZGQoJ3RvZ2dsZWRCdG4nKVxyXG4gICAgfVxyXG5cclxuICAgIGlmICgob2Zmc2V0VGltZSA+IDAgJiYgZGlyZWN0aW9uICE9PSBudWxsKSB8fCAoIWRpcmVjdGlvbiAmJiBvZmZzZXRUaW1lID09PSAwKSkge1xyXG4gICAgICAgIGNocm9tZS50YWJzLnF1ZXJ5KHthY3RpdmU6dHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZX0sIHRhYnMgPT4ge1xyXG4gICAgICAgICAgICBsZXQgYWN0aXZlVGFiSWQgPSB0YWJzWzBdLmlkXHJcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0lTX0NIQU5ORUxfT1BFTlxyXG4gICAgICAgICAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIChyZXNwOiBSZXNwb25zZU9iamVjdDxib29sZWFuPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3Auc3RhdHVzID09IE1lc3NhZ2VzLlNVQ0NFU1MgJiYgcmVzcC5wYXlsb2FkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19TRVRfT0ZGU0VULFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkOiB7IG9mZnNldFRpbWU6IG9mZnNldFRpbWUsIGRpcmVjdGlvbjogZGlyZWN0aW9uIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8VG9GZ09mZnNldFBheWxvYWQ+KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IGpvaW5Sb29tV2l0aFZhbGlkYXRpb24gPSAoKSA9PiB7XHJcbiAgICBsZXQgbWVzc2FnZU9iamVjdDogTWVzc2FnZU9iamVjdDxUb0ZnSm9pblJvb21QYXlsb2FkPiA9IHsgXHJcbiAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19KT0lOX1JPT01fSU5fVEFCLCBcclxuICAgICAgICBwYXlsb2FkOiB7XHJcbiAgICAgICAgICAgIHJvb21JZDogcm9vbU5hbWVJbnB1dC52YWx1ZS50cmltKCksIFxyXG4gICAgICAgICAgICB1c2VyTmFtZTogbmFtZUlucHV0LnZhbHVlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ29JbnRvUm9vbVdpdGhWYWxpZGF0aW9uKG1lc3NhZ2VPYmplY3QpXHJcbn1cclxuXHJcbmNvbnN0IGNyZWF0ZU5ld1Jvb21XaXRoVmFsaWRhdGlvbiA9ICgpID0+IHtcclxuICAgIGxldCBtZXNzYWdlT2JqZWN0OiBNZXNzYWdlT2JqZWN0PFRvRmdOZXdSb29tUGF5bG9hZD4gPSB7IFxyXG4gICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfQ1JFQVRFX1JPT01fSU5fVEFCLCBcclxuICAgICAgICBwYXlsb2FkOiB7XHJcbiAgICAgICAgICAgIHJvb21OYW1lOiByb29tTmFtZUlucHV0LnZhbHVlLnRyaW0oKSwgXHJcbiAgICAgICAgICAgIHVzZXJOYW1lOiBuYW1lSW5wdXQudmFsdWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnb0ludG9Sb29tV2l0aFZhbGlkYXRpb24obWVzc2FnZU9iamVjdClcclxufVxyXG5cclxuY29uc3QgZ29JbnRvUm9vbVdpdGhWYWxpZGF0aW9uID0gKG1lc3NhZ2VPYmplY3Q6IE1lc3NhZ2VPYmplY3Q8YW55PikgPT4ge1xyXG4gICAgY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTp0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlfSwgdGFicyA9PiB7XHJcbiAgICAgICAgbGV0IGFjdGl2ZVRhYklkOiBudW1iZXIgPSB0YWJzWzBdLmlkO1xyXG4gICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7IG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfVklERU9fT05fU0NSRUVOIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPiwgKHJlc3A6IFJlc3BvbnNlT2JqZWN0PGJvb2xlYW4+KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXNwLnN0YXR1cyA9PT0gTWVzc2FnZXMuU1VDQ0VTUyAmJiByZXNwLnBheWxvYWQgJiYgdmFsaWRSb29tSW5wdXQoKSkgeyBcclxuICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCBtZXNzYWdlT2JqZWN0LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8VG9Qb3B1cFJvb21QYXlsb2FkPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwLnN0YXR1cyA9PT0gTWVzc2FnZXMuU1VDQ0VTUykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VQYWdlKCB7IHBhZ2VUeXBlOiBQYWdlLk1BSU4sIHJvb21JZDogcmVzcC5wYXlsb2FkLnJvb20ucm9vbUlkLCByb29tTmFtZTogcmVzcC5wYXlsb2FkLnJvb20ucm9vbU5hbWUgfSBhcyBQYWdlTWV0YWRhdGEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZU1haW5Vc2VycyhyZXNwLnBheWxvYWQucm9vbS51c2VycylcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q2hhdE9wZW5Ub2dnbGUocmVzcC5wYXlsb2FkLmNoYXRPcGVuKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNwLnBheWxvYWQucm9vbS51c2Vycy5maW5kKHVzZXIgPT4gdXNlci5jdXJyZW50KT8uYWRtaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldE9mZnNldElucHV0KHJlc3AucGF5bG9hZC5vZmZzZXRUaW1lLCByZXNwLnBheWxvYWQudmlkZW9MZW5ndGgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXRDb250YWluZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcbn1cclxuXHJcbmNvbnN0IGNoYW5nZVBhZ2UgPSAocGFnZU1ldGFkYXRhOiBQYWdlTWV0YWRhdGEpID0+IHtcclxuICAgIGlmIChwYWdlTWV0YWRhdGEucGFnZVR5cGUgPT09IFBhZ2UuU1RBUlQpIHtcclxuICAgICAgICBzdGFydFBhZ2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgbWFpblBhZ2UuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgaGVhZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIHJvb21OYW1lSW5wdXQudmFsdWUgPSBwYWdlTWV0YWRhdGEucm9vbU5hbWU7XHJcbiAgICAgICAgbmFtZUlucHV0LnZhbHVlID0gXCJcIjtcclxuICAgIH0gZWxzZSBpZiAocGFnZU1ldGFkYXRhLnBhZ2VUeXBlID09PSBQYWdlLk1BSU4pIHtcclxuICAgICAgICBzdGFydFBhZ2UuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgbWFpblBhZ2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgaGVhZGVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICByb29tTmFtZUVsZW0uaW5uZXJIVE1MID0gIGAke3BhZ2VNZXRhZGF0YS5yb29tTmFtZX1gO1xyXG4gICAgICAgIHJvb21JZEVsZW0uaW5uZXJIVE1MID0gYCR7cGFnZU1ldGFkYXRhLnJvb21JZH1gO1xyXG5cclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgdXBkYXRlTWFpblVzZXJzID0gKHVzZXJzOiBBcnJheTxVc2VyPikgPT4ge1xyXG4gICAgbG9jYWxVc2VycyA9IHVzZXJzXHJcbiAgICBcclxuICAgIGlmIChsb2NhbFVzZXJzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgIHN5bmNCdG4uY2xhc3NMaXN0LmFkZChcImRpc2FibGVkQnRuXCIpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHN5bmNCdG4uY2xhc3NMaXN0LnJlbW92ZShcImRpc2FibGVkQnRuXCIpXHJcbiAgICB9XHJcblxyXG4gICAgdXNlcnNMaXN0Q29udGFpbmVyLmlubmVySFRNTCA9IFwiXCJcclxuICAgIHVzZXJzLmZvckVhY2godXNlciA9PiB7XHJcbiAgICAgICAgbGV0IHVzZXJFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIkRJVlwiKTtcclxuICAgICAgICB1c2VyRWxlbS5jbGFzc0xpc3QuYWRkKFwidXNlckVsZW1cIik7XHJcbiAgICAgICAgaWYgKCEhdXNlci5jdXJyZW50KSB7XHJcbiAgICAgICAgICAgIHVzZXJFbGVtLmNsYXNzTGlzdC5hZGQoXCJjdXJyZW50VXNlclwiKVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdXNlckljb24gPSAodXNlci5hZG1pbiA/IFwiPGltZyBjbGFzcz0ndXNlckljb24nIHNyYz0nLi4vaW1hZ2VzL2FkbWluVXNlci5wbmcnIGFsdD0nYWRtaW51c2VyJz5cIiA6IFwiPGltZyBjbGFzcz0ndXNlckljb24nIHNyYz0nLi4vaW1hZ2VzL3VzZXIucG5nJyBhbHQ9J25vcm1hbHVzZXInPlwiKVxyXG4gICAgICAgIGxldCB1c2VyTmFtZSA9ICghIXVzZXIuY3VycmVudCA/IGA8c3Ryb25nPiR7dXNlci51c2VyTmFtZX08L3N0cm9uZz5gIDogYCR7dXNlci51c2VyTmFtZX1gKVxyXG4gICAgICAgIHVzZXJFbGVtLmlubmVySFRNTCA9IHVzZXJJY29uK2A8c3BhbiBzdHlsZT1cIm1hcmdpbi1sZWZ0OjVweDsgbWF4LXdpZHRoOiA4MCU7IHdvcmQtYnJlYWs6IGJyZWFrLWFsbFwiPiR7dXNlck5hbWV9PC9zcGFuPmArYDxkaXYgY2xhc3M9XCJ1c2VyQ29sb3JDaXJjbGVcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6JHt1c2VyLmNvbG9yfVwiPjwvZGl2PmA7XHJcbiAgICAgICAgdXNlcnNMaXN0Q29udGFpbmVyLmFwcGVuZCh1c2VyRWxlbSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuY29uc3Qgc2V0Q2hhdE9wZW5Ub2dnbGUgPSAoY2hhdE9wZW46IEJvb2xlYW4pID0+IHtcclxuICAgIGlmIChjaGF0T3Blbikge1xyXG4gICAgICAgIGNoYXRUb2dnbGVCdG4uY2xhc3NMaXN0LmFkZCgndG9nZ2xlZEJ0bicpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNoYXRUb2dnbGVCdG4uY2xhc3NMaXN0LnJlbW92ZSgndG9nZ2xlZEJ0bicpXHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IHNldE9mZnNldElucHV0ID0gKG9mZnNldFRpbWU6IG51bWJlciwgdmlkZW9MZW5ndGg6IG51bWJlcikgPT4ge1xyXG5cclxuICAgIGlmIChvZmZzZXRUaW1lID4gMCkge1xyXG4gICAgICAgIHBvc09mZnNldEJ0bi5jbGFzc0xpc3QuYWRkKCd0b2dnbGVkQnRuJylcclxuICAgIH0gZWxzZSBpZiAob2Zmc2V0VGltZSA8IDApIHtcclxuICAgICAgICBuZWdPZmZzZXRCdG4uY2xhc3NMaXN0LmFkZCgndG9nZ2xlZEJ0bicpXHJcbiAgICB9XHJcblxyXG4gICAgb2Zmc2V0VGltZSA8IDAgPyBvZmZzZXRUaW1lKj0tMSA6IG51bGxcclxuXHJcbiAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMzIyNzMyL2NvbnZlcnQtc2Vjb25kcy10by1oaC1tbS1zcy13aXRoLWphdmFzY3JpcHRcclxuICAgIGxldCBtYXhUaW1lID0gbmV3IERhdGUodmlkZW9MZW5ndGggKiAxMDAwKS50b0lTT1N0cmluZygpLnN1YnN0cigxMSwgOClcclxuICAgIGxldCBjdXJUaW1lID0gbmV3IERhdGUob2Zmc2V0VGltZSAqIDEwMDApLnRvSVNPU3RyaW5nKCkuc3Vic3RyKDExLCA4KVxyXG4gICAgb2Zmc2V0SW5wdXQuc2V0QXR0cmlidXRlKFwiZGF0YS1kdXJhdGlvbi1tYXhcIiwgbWF4VGltZSlcclxuICAgIG9mZnNldElucHV0LnNldEF0dHJpYnV0ZShcImRhdGEtZHVyYXRpb24tbWluXCIsIFwiMDA6MDA6MDBcIilcclxuICAgIG9mZnNldElucHV0LnZhbHVlID0gY3VyVGltZVxyXG59XHJcblxyXG4vLyBNZXNzYWdlIGhhbmRsZXJcclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0OiBNZXNzYWdlT2JqZWN0PGFueT4sIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcblxyXG4gICAgLy9DaGVjayBiZWxvdyBpcyBpbXBvcnRhbnQgYi9jIGlmIHdlIGhhdmUgbXVsdGlwbGUgcG9wdXBzIG9wZW4gaW4gZGlmZiB3aW5kb3dzLCB3ZSBkb250IHdhbnQgYWxsIHJlYWN0aW5nIHRvIHNhbWUgZXZlbnRcclxuICAgIGNocm9tZS50YWJzLnF1ZXJ5KHthY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6dHJ1ZX0sIHRhYnMgPT4ge1xyXG4gICAgICAgIGxldCBjdXJBY3RpdmVUYWJJZCA9IHRhYnNbMF0uaWRcclxuICAgICAgICBpZiAoc2VuZGVyLnRhYj8uaWQgPT09IGN1ckFjdGl2ZVRhYklkICYmIHJlcXVlc3QubWVzc2FnZSA9PT0gTWVzc2FnZXMuVE9QT1BVUF9ST09NX0RBVEEpIHtcclxuICAgICAgICAgICAgbGV0IHJlcURhdGEgPSA8VG9Qb3B1cFJvb21QYXlsb2FkPnJlcXVlc3QucGF5bG9hZFxyXG4gICAgICAgICAgICB1cGRhdGVNYWluVXNlcnMocmVxRGF0YS5yb29tLnVzZXJzKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG59KTtcclxuXHJcblxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=