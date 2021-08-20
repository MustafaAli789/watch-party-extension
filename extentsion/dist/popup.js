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
        if (user.admin && !user.current) {
            userElem.classList.add("adminUser");
        }
        let imgTitle = user.admin ? (!!user.current ? 'Current User Admin' : 'Admin') : (!!user.current ? 'Current User' : 'Room User');
        let userIcon = (user.admin ? `<img class='userIcon' src='../images/adminUser.png' alt='adminuser' title=${imgTitle}>` : `<img class='userIcon' src='../images/user.png' alt='normaluser' title=${imgTitle}>`);
        let userName = (!!user.current ? `<strong>${user.userName}</strong>` : `${user.userName}`);
        if (user.admin && !user.current) {
            let adminNameContainer = '<div class="adminNameContainer">' + userIcon + `<span style="margin-left:5px; max-width: 80%; word-break: break-all">${userName}</span>` + `<div class="userColorCircle" style="background-color:${user.color}"></div></div>`;
            let adminTimerContainer = `
                <div class="adminTimerContainer">
                    <div id="loadingBar"></div>
                    <span id="adminTime">00:11:04/00:25:15</span>
                </div>
            `;
            userElem.innerHTML = adminNameContainer + adminTimerContainer;
        }
        else {
            userElem.innerHTML = userIcon + `<span style="margin-left:5px; max-width: 80%; word-break: break-all">${userName}</span>` + `<div class="userColorCircle" style="background-color:${user.color}"></div>`;
        }
        usersListContainer.append(userElem);
    });
};
`<div style="
height: 20px;
margin-top: 5px;
width: 100%;
border: 1px solid black;
position: relative;
"><div style="
height: 100%;
width: 43%;
background-color: #5bf35b;
"></div><span style="
position: absolute;
top: 3px;
left: 100px;
">00:11:04/00:25:15</span></div>`;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUcsMENBQUUsRUFBRSxNQUFLLGNBQWMsSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLG9CQUFRLENBQUMsaUJBQWlCLEVBQUU7WUFDckYsSUFBSSxPQUFPLEdBQXVCLE9BQU8sQ0FBQyxPQUFPO1lBQ2pELGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNuQyxjQUFjLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDO1NBQzFEO0lBQ0wsQ0FBQyxDQUFDO0lBQ0YsT0FBTyxJQUFJO0FBQ2YsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leHRlbnRzaW9uLy4vbW9kZWxzL2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly9leHRlbnRzaW9uL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4dGVudHNpb24vLi9wb3B1cC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBQYWdle1xyXG4gICAgU1RBUlQsXHJcbiAgICBNQUlOXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIE1lc3NhZ2Vze1xyXG4gICAgU1VDQ0VTUyxcclxuICAgIEZBSUxVUkUsXHJcbiAgICBUT0ZHX1ZJREVPX09OX1NDUkVFTixcclxuICAgIFRPRkdfQ1JFQVRFX1JPT01fSU5fVEFCLFxyXG4gICAgVE9GR19KT0lOX1JPT01fSU5fVEFCLFxyXG4gICAgVE9GR19ESVNDT05ORUNULFxyXG4gICAgVE9GR19SRVRSSUVWRV9ST09NX0RBVEEsXHJcbiAgICBUT0ZHX0RPX1lPVV9FWElTVCxcclxuICAgIFRPRkdfU1lOQ19WSUQsXHJcbiAgICBUT1BPUFVQX0xFQVZFX1JPT00sXHJcbiAgICBUT1BPUFVQX1JPT01fREFUQSxcclxuICAgIFRPRkdfSVNfQ0hBTk5FTF9PUEVOLFxyXG4gICAgVE9GR19DSEFUX1RPR0dMRSxcclxuICAgIFRPRkdfU0VUX09GRlNFVCxcclxuICAgIFRPQkdfT1BFTl9UQUJfV0lUSF9VUkxcclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHsgTWVzc2FnZXMsIFBhZ2UgfSBmcm9tICcuL21vZGVscy9jb25zdGFudHMnXHJcbmltcG9ydCB7IFRvRmdKb2luUm9vbVBheWxvYWQsIFRvRmdOZXdSb29tUGF5bG9hZCwgVG9GZ09mZnNldFBheWxvYWQsIFRvUG9wdXBSb29tUGF5bG9hZCB9IGZyb20gJy4vbW9kZWxzL3BheWxvYWRzJztcclxuaW1wb3J0IHsgTWVzc2FnZU9iamVjdCwgUmVzcG9uc2VPYmplY3QsICB9IGZyb20gJy4vbW9kZWxzL21lc3NhZ2VwYXNzaW5nJztcclxuaW1wb3J0IHsgUGFnZU1ldGFkYXRhIH0gZnJvbSAnLi9tb2RlbHMvTWlzY2VsbGFuZW91cyc7XHJcblxyXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi4vc2hhcmVkbW9kZWxzL3VzZXInXHJcbmltcG9ydCB7ICB9IGZyb20gJy4uL3NoYXJlZG1vZGVscy9wYXlsb2FkcydcclxuXHJcbmxldCBsb2NhbFVzZXJzOiBVc2VyW10gPSBbXVxyXG5sZXQgY2hhdFRvZ2dsZWQ6IEJvb2xlYW4gPSB0cnVlXHJcblxyXG4vL0NvbnRhaW5lcnNcclxuY29uc3Qgc3RhcnRQYWdlOiBIVE1MRGl2RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRQYWdlXCIpO1xyXG5jb25zdCBtYWluUGFnZTogSFRNTERpdkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW5QYWdlXCIpO1xyXG5jb25zdCBoZWFkZXI6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNoZWFkZXJcIik7XHJcbmNvbnN0IHVzZXJzTGlzdENvbnRhaW5lcjogSFRNTERpdkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW5QYWdlIC51c2VycyAudXNlcnNMaXN0XCIpO1xyXG5jb25zdCBvZmZzZXRDb250YWluZXI6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAub2Zmc2V0Q29udGFpbmVyXCIpXHJcblxyXG4vL0J0dG9uc1xyXG5jb25zdCBuZXdSb29tQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UGFnZSAuYWRkSXRlbUNvbnRhaW5lciAubmV3Um9vbUJ0blwiKTtcclxuY29uc3Qgam9pblJvb21CdG46IEhUTUxCdXR0b25FbGVtZW50ID0gPEhUTUxCdXR0b25FbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRQYWdlIC5hZGRJdGVtQ29udGFpbmVyIC5qb2luUm9vbUJ0blwiKTtcclxuY29uc3QgbGVhdmVSb29tQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW5QYWdlIC5iYWNrQnRuXCIpO1xyXG5jb25zdCBjb3B5SW1nQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW5QYWdlIC5yb29tSWRDb250YWluZXIgLmNvcHlJbWdCdG5cIik7XHJcbmNvbnN0IHN5bmNCdG46IEhUTUxCdXR0b25FbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAuYWN0aW9ucyAuYWN0aW9uQnRucyAuc3luY0J0blwiKVxyXG5jb25zdCBjaGF0VG9nZ2xlQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblBhZ2UgLmFjdGlvbnMgLmFjdGlvbkJ0bnMgLmNoYXRUb2dnbGVcIilcclxuY29uc3QgcG9zT2Zmc2V0QnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBvc09mZnNldEJ0blwiKVxyXG5jb25zdCByZXNldE9mZnNldEJ0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXNldE9mZnNldEJ0blwiKVxyXG5cclxuLy9JbnB1dHNcclxuY29uc3QgbmFtZUlucHV0OiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFBhZ2UgLmFkZEl0ZW1Db250YWluZXIgLm5hbWVJbnB1dFwiKTtcclxuY29uc3Qgcm9vbU5hbWVJbnB1dDogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRQYWdlIC5hZGRJdGVtQ29udGFpbmVyIC5yb29tSW5wdXRcIik7XHJcbmNvbnN0IG9mZnNldElucHV0OiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAub2Zmc2V0Q29udGFpbmVyIC5odG1sLWR1cmF0aW9uLXBpY2tlclwiKVxyXG5cclxuLy9UZXh0XHJcbmNvbnN0IGVycm9yTXNnRWxlbTogSFRNTFBhcmFncmFwaEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UGFnZSAuYWRkSXRlbUNvbnRhaW5lciAuZXJyb3JcIik7XHJcbmNvbnN0IHJvb21JZEVsZW06IEhUTUxTcGFuRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYWluUGFnZSAucm9vbUlkQ29udGFpbmVyIC5yb29tSWQnKTtcclxuY29uc3Qgcm9vbU5hbWVFbGVtOiBIVE1MSGVhZGluZ0VsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW5QYWdlIC5oZWFkIC5yb29tTmFtZVwiKTtcclxuXHJcblxyXG4vL0luaXRpYWwgb3BlbiBvZiBwb3B1cFxyXG5jaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOnRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWV9LCB0YWJzID0+IHtcclxuICAgIGxldCBhY3RpdmVUYWJJZCA9IHRhYnNbMF0uaWRcclxuICAgIGxldCBwYWdlTWV0YWRhdGE6IFBhZ2VNZXRhZGF0YSA9IDxQYWdlTWV0YWRhdGE+e3Jvb21OYW1lOiBcIlwiLCBwYWdlVHlwZTogUGFnZS5TVEFSVH1cclxuXHJcbiAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwge1xyXG4gICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfSVNfQ0hBTk5FTF9PUEVOXHJcbiAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIChyZXNwOiBSZXNwb25zZU9iamVjdDxib29sZWFuPikgPT4ge1xyXG4gICAgICAgIGlmIChyZXNwLnN0YXR1cyA9PSBNZXNzYWdlcy5TVUNDRVNTICYmIHJlc3AucGF5bG9hZCkge1xyXG4gICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwge1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19SRVRSSUVWRV9ST09NX0RBVEFcclxuICAgICAgICAgICAgfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8VG9Qb3B1cFJvb21QYXlsb2FkPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgcGFnZU1ldGFkYXRhLnJvb21JZCA9IHJlc3AucGF5bG9hZC5yb29tLnJvb21JZFxyXG4gICAgICAgICAgICAgICAgcGFnZU1ldGFkYXRhLnJvb21OYW1lID0gcmVzcC5wYXlsb2FkLnJvb20ucm9vbU5hbWVcclxuICAgICAgICAgICAgICAgIHBhZ2VNZXRhZGF0YS5wYWdlVHlwZSA9IFBhZ2UuTUFJTlxyXG4gICAgICAgICAgICAgICAgY2hhdFRvZ2dsZWQgPSByZXNwLnBheWxvYWQuY2hhdE9wZW5cclxuXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VQYWdlKHBhZ2VNZXRhZGF0YSlcclxuICAgICAgICAgICAgICAgIHVwZGF0ZU1haW5Vc2VycyhyZXNwLnBheWxvYWQucm9vbS51c2VycylcclxuICAgICAgICAgICAgICAgIHNldENoYXRPcGVuVG9nZ2xlKGNoYXRUb2dnbGVkKVxyXG4gICAgICAgICAgICAgICAgc2V0T2Zmc2V0SW5wdXQocmVzcC5wYXlsb2FkLm9mZnNldFRpbWUsIHJlc3AucGF5bG9hZC52aWRlb0xlbmd0aClcclxuICAgICAgICAgICAgfSkgXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICBjaGFuZ2VQYWdlKHBhZ2VNZXRhZGF0YSk7XHJcbn0pXHJcblxyXG5jb25zdCB2YWxpZFJvb21JbnB1dCA9ICgpID0+IHtcclxuICAgIGlmKHJvb21OYW1lSW5wdXQudmFsdWUudHJpbSgpID09PSBcIlwiKSB7XHJcbiAgICAgICAgZXJyb3JNc2dFbGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIGVycm9yTXNnRWxlbS5pbm5lckhUTUwgPSAnUGxlYXNlIGVudGVyIGEgcm9vbS9pZCc7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIGlmIChuYW1lSW5wdXQudmFsdWUudHJpbSgpLmxlbmd0aCA8IDMpIHtcclxuICAgICAgICBlcnJvck1zZ0VsZW0uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgZXJyb3JNc2dFbGVtLmlubmVySFRNTCA9ICdQbGVhc2UgZW50ZXIgYSB1c2VybmFtZSBsb25nZXIgdGhhbiAzIGNoYXJzJztcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVycm9yTXNnRWxlbS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgICBlcnJvck1zZ0VsZW0uaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbm5ld1Jvb21CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfID0+IHtcclxuICAgIGNyZWF0ZU5ld1Jvb21XaXRoVmFsaWRhdGlvbigpO1xyXG59KVxyXG5cclxuam9pblJvb21CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcclxuICAgIGpvaW5Sb29tV2l0aFZhbGlkYXRpb24oKVxyXG59KVxyXG5cclxubGVhdmVSb29tQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXyA9PiB7XHJcbiAgICBsZWF2ZVJvb20oKVxyXG59KVxyXG5cclxuc3luY0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGlmIChsb2NhbFVzZXJzLmxlbmd0aCA9PT0gMSl7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOnRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICBsZXQgYWN0aXZlVGFiSWQgPSB0YWJzWzBdLmlkXHJcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19JU19DSEFOTkVMX09QRU5cclxuICAgICAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIChyZXNwOiBSZXNwb25zZU9iamVjdDxib29sZWFuPikgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT0gTWVzc2FnZXMuU1VDQ0VTUyAmJiByZXNwLnBheWxvYWQpIHtcclxuICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19TWU5DX1ZJRFxyXG4gICAgICAgICAgICAgICAgfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcbn0pXHJcbmNoYXRUb2dnbGVCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBjaGF0VG9nZ2xlZCA9ICFjaGF0VG9nZ2xlZFxyXG4gICAgY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTp0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlfSwgdGFicyA9PiB7XHJcbiAgICAgICAgbGV0IGFjdGl2ZVRhYklkID0gdGFic1swXS5pZFxyXG4gICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XHJcbiAgICAgICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfSVNfQ0hBTk5FTF9PUEVOXHJcbiAgICAgICAgfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8Ym9vbGVhbj4pID0+IHtcclxuICAgICAgICAgICAgaWYgKHJlc3Auc3RhdHVzID09IE1lc3NhZ2VzLlNVQ0NFU1MgJiYgcmVzcC5wYXlsb2FkKSB7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfQ0hBVF9UT0dHTEUsXHJcbiAgICAgICAgICAgICAgICAgICAgcGF5bG9hZDogY2hhdFRvZ2dsZWRcclxuICAgICAgICAgICAgICAgIH0gYXMgTWVzc2FnZU9iamVjdDxCb29sZWFuPiwgcmVzcCA9PntcclxuICAgICAgICAgICAgICAgICAgICBzZXRDaGF0T3BlblRvZ2dsZShjaGF0VG9nZ2xlZClcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfSlcclxufSlcclxuXHJcbmNvbnN0IGxlYXZlUm9vbSA9ICgpID0+IHtcclxuICAgIGNocm9tZS50YWJzLnF1ZXJ5KHthY3RpdmU6dHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZX0sIHRhYnMgPT4ge1xyXG4gICAgICAgIGxldCBhY3RpdmVUYWJJZCA9IHRhYnNbMF0uaWRcclxuICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwge1xyXG4gICAgICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0lTX0NIQU5ORUxfT1BFTlxyXG4gICAgICAgIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPiwgKHJlc3A6IFJlc3BvbnNlT2JqZWN0PGJvb2xlYW4+KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXNwLnN0YXR1cyA9PSBNZXNzYWdlcy5TVUNDRVNTICYmIHJlc3AucGF5bG9hZCkge1xyXG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0RJU0NPTk5FQ1RcclxuICAgICAgICAgICAgICAgIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgY2hhbmdlUGFnZSh7IHBhZ2VUeXBlOiBQYWdlLlNUQVJULCByb29tSWQ6IG51bGwsIHJvb21OYW1lOiBcIlwiIH0pXHJcbiAgICB9KVxyXG59XHJcblxyXG5jb3B5SW1nQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgbGV0IHJvb21JZFZhbCA9IHJvb21JZEVsZW0uaW5uZXJIVE1MXHJcbiAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChyb29tSWRWYWwpLnRoZW4oKCkgPT4ge1xyXG4gICAgfSwgKCkgPT4ge1xyXG4gICAgICAgIC8vRmFpbGVkIHRvIGNvcHlcclxuICAgIH0pXHJcbn0pXHJcblxyXG5wb3NPZmZzZXRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBzZXRPZmZzZXQoXCJVUFwiKVxyXG59KVxyXG5cclxucmVzZXRPZmZzZXRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBpZiAob2Zmc2V0SW5wdXQudmFsdWUgIT09IFwiMDA6MDA6MDBcIikge1xyXG4gICAgICAgIG9mZnNldElucHV0LnZhbHVlID0gXCIwMDowMDowMFwiXHJcbiAgICAgICAgc2V0T2Zmc2V0KG51bGwpXHJcbiAgICB9XHJcbn0pXHJcblxyXG5jb25zdCBzZXRPZmZzZXQgPSAoZGlyZWN0aW9uOiBcIlVQXCIgfCBcIkRPV05cIikgPT4ge1xyXG4gICAgbGV0IHRpbWUgPSBvZmZzZXRJbnB1dC52YWx1ZS5zcGxpdChcIjpcIilcclxuICAgIGxldCBob3VycyA9IHBhcnNlSW50KHRpbWVbMF0pXHJcbiAgICBsZXQgbWlucyA9IHBhcnNlSW50KHRpbWVbMV0pXHJcbiAgICBsZXQgc2VjcyA9IHBhcnNlSW50KHRpbWVbMl0pXHJcblxyXG4gICAgbGV0IG9mZnNldFRpbWUgPSBob3VycyozNjAwICsgbWlucyo2MCArIHNlY3NcclxuXHJcbiAgICAvLyBzZXR0aW5nIGJ1dHRvbiBzdHlsZXNcclxuICAgIHBvc09mZnNldEJ0bi5jbGFzc0xpc3QucmVtb3ZlKCd0b2dnbGVkQnRuJylcclxuICAgIGlmIChkaXJlY3Rpb24gPT09IFwiVVBcIikge1xyXG4gICAgICAgIHBvc09mZnNldEJ0bi5jbGFzc0xpc3QuYWRkKCd0b2dnbGVkQnRuJylcclxuICAgIH1cclxuXHJcbiAgICBpZiAoKG9mZnNldFRpbWUgPiAwICYmIGRpcmVjdGlvbiAhPT0gbnVsbCkgfHwgKCFkaXJlY3Rpb24gJiYgb2Zmc2V0VGltZSA9PT0gMCkpIHtcclxuICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOnRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICAgICAgbGV0IGFjdGl2ZVRhYklkID0gdGFic1swXS5pZFxyXG4gICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwge1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19JU19DSEFOTkVMX09QRU5cclxuICAgICAgICAgICAgfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8Ym9vbGVhbj4pID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXNwLnN0YXR1cyA9PSBNZXNzYWdlcy5TVUNDRVNTICYmIHJlc3AucGF5bG9hZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfU0VUX09GRlNFVCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZDogeyBvZmZzZXRUaW1lOiBvZmZzZXRUaW1lLCBkaXJlY3Rpb246IGRpcmVjdGlvbiB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBhcyBNZXNzYWdlT2JqZWN0PFRvRmdPZmZzZXRQYXlsb2FkPilcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBqb2luUm9vbVdpdGhWYWxpZGF0aW9uID0gKCkgPT4ge1xyXG4gICAgbGV0IG1lc3NhZ2VPYmplY3Q6IE1lc3NhZ2VPYmplY3Q8VG9GZ0pvaW5Sb29tUGF5bG9hZD4gPSB7IFxyXG4gICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfSk9JTl9ST09NX0lOX1RBQiwgXHJcbiAgICAgICAgcGF5bG9hZDoge1xyXG4gICAgICAgICAgICByb29tSWQ6IHJvb21OYW1lSW5wdXQudmFsdWUudHJpbSgpLCBcclxuICAgICAgICAgICAgdXNlck5hbWU6IG5hbWVJbnB1dC52YWx1ZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdvSW50b1Jvb21XaXRoVmFsaWRhdGlvbihtZXNzYWdlT2JqZWN0KVxyXG59XHJcblxyXG5jb25zdCBjcmVhdGVOZXdSb29tV2l0aFZhbGlkYXRpb24gPSAoKSA9PiB7XHJcbiAgICBsZXQgbWVzc2FnZU9iamVjdDogTWVzc2FnZU9iamVjdDxUb0ZnTmV3Um9vbVBheWxvYWQ+ID0geyBcclxuICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0NSRUFURV9ST09NX0lOX1RBQiwgXHJcbiAgICAgICAgcGF5bG9hZDoge1xyXG4gICAgICAgICAgICByb29tTmFtZTogcm9vbU5hbWVJbnB1dC52YWx1ZS50cmltKCksIFxyXG4gICAgICAgICAgICB1c2VyTmFtZTogbmFtZUlucHV0LnZhbHVlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ29JbnRvUm9vbVdpdGhWYWxpZGF0aW9uKG1lc3NhZ2VPYmplY3QpXHJcbn1cclxuXHJcbmNvbnN0IGdvSW50b1Jvb21XaXRoVmFsaWRhdGlvbiA9IChtZXNzYWdlT2JqZWN0OiBNZXNzYWdlT2JqZWN0PGFueT4pID0+IHtcclxuICAgIGNocm9tZS50YWJzLnF1ZXJ5KHthY3RpdmU6dHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZX0sIHRhYnMgPT4ge1xyXG4gICAgICAgIGxldCBhY3RpdmVUYWJJZDogbnVtYmVyID0gdGFic1swXS5pZDtcclxuICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwgeyBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX1ZJREVPX09OX1NDUkVFTiB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIChyZXNwOiBSZXNwb25zZU9iamVjdDxib29sZWFuPikgPT4ge1xyXG4gICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT09IE1lc3NhZ2VzLlNVQ0NFU1MgJiYgcmVzcC5wYXlsb2FkICYmIHZhbGlkUm9vbUlucHV0KCkpIHsgXHJcbiAgICAgICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwgbWVzc2FnZU9iamVjdCwgKHJlc3A6IFJlc3BvbnNlT2JqZWN0PFRvUG9wdXBSb29tUGF5bG9hZD4pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT09IE1lc3NhZ2VzLlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlUGFnZSggeyBwYWdlVHlwZTogUGFnZS5NQUlOLCByb29tSWQ6IHJlc3AucGF5bG9hZC5yb29tLnJvb21JZCwgcm9vbU5hbWU6IHJlc3AucGF5bG9hZC5yb29tLnJvb21OYW1lIH0gYXMgUGFnZU1ldGFkYXRhKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVNYWluVXNlcnMocmVzcC5wYXlsb2FkLnJvb20udXNlcnMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldENoYXRPcGVuVG9nZ2xlKHJlc3AucGF5bG9hZC5jaGF0T3BlbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0T2Zmc2V0SW5wdXQocmVzcC5wYXlsb2FkLm9mZnNldFRpbWUsIHJlc3AucGF5bG9hZC52aWRlb0xlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcbn1cclxuXHJcbmNvbnN0IGNoYW5nZVBhZ2UgPSAocGFnZU1ldGFkYXRhOiBQYWdlTWV0YWRhdGEpID0+IHtcclxuICAgIGlmIChwYWdlTWV0YWRhdGEucGFnZVR5cGUgPT09IFBhZ2UuU1RBUlQpIHtcclxuICAgICAgICBzdGFydFBhZ2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgbWFpblBhZ2UuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgaGVhZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIHJvb21OYW1lSW5wdXQudmFsdWUgPSBwYWdlTWV0YWRhdGEucm9vbU5hbWU7XHJcbiAgICAgICAgbmFtZUlucHV0LnZhbHVlID0gXCJcIjtcclxuICAgIH0gZWxzZSBpZiAocGFnZU1ldGFkYXRhLnBhZ2VUeXBlID09PSBQYWdlLk1BSU4pIHtcclxuICAgICAgICBzdGFydFBhZ2UuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XHJcbiAgICAgICAgbWFpblBhZ2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgaGVhZGVyLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG5cclxuICAgICAgICByb29tTmFtZUVsZW0uaW5uZXJIVE1MID0gIGAke3BhZ2VNZXRhZGF0YS5yb29tTmFtZX1gO1xyXG4gICAgICAgIHJvb21JZEVsZW0uaW5uZXJIVE1MID0gYCR7cGFnZU1ldGFkYXRhLnJvb21JZH1gO1xyXG5cclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgdXBkYXRlTWFpblVzZXJzID0gKHVzZXJzOiBBcnJheTxVc2VyPikgPT4ge1xyXG4gICAgbG9jYWxVc2VycyA9IHVzZXJzXHJcbiAgICBcclxuICAgIGlmIChsb2NhbFVzZXJzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgIHN5bmNCdG4uY2xhc3NMaXN0LmFkZChcImRpc2FibGVkQnRuXCIpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHN5bmNCdG4uY2xhc3NMaXN0LnJlbW92ZShcImRpc2FibGVkQnRuXCIpXHJcbiAgICB9XHJcblxyXG4gICAgdXNlcnNMaXN0Q29udGFpbmVyLmlubmVySFRNTCA9IFwiXCJcclxuICAgIHVzZXJzLmZvckVhY2godXNlciA9PiB7XHJcbiAgICAgICAgbGV0IHVzZXJFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIkRJVlwiKTtcclxuICAgICAgICB1c2VyRWxlbS5jbGFzc0xpc3QuYWRkKFwidXNlckVsZW1cIik7XHJcbiAgICAgICAgaWYgKCEhdXNlci5jdXJyZW50KSB7XHJcbiAgICAgICAgICAgIHVzZXJFbGVtLmNsYXNzTGlzdC5hZGQoXCJjdXJyZW50VXNlclwiKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodXNlci5hZG1pbiAmJiAhdXNlci5jdXJyZW50KSB7XHJcbiAgICAgICAgICAgIHVzZXJFbGVtLmNsYXNzTGlzdC5hZGQoXCJhZG1pblVzZXJcIilcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGltZ1RpdGxlID0gdXNlci5hZG1pbiA/ICghIXVzZXIuY3VycmVudCA/ICdDdXJyZW50IFVzZXIgQWRtaW4nIDogJ0FkbWluJykgOiAoISF1c2VyLmN1cnJlbnQgPyAnQ3VycmVudCBVc2VyJyA6ICdSb29tIFVzZXInKVxyXG4gICAgICAgIGxldCB1c2VySWNvbiA9ICh1c2VyLmFkbWluID8gYDxpbWcgY2xhc3M9J3VzZXJJY29uJyBzcmM9Jy4uL2ltYWdlcy9hZG1pblVzZXIucG5nJyBhbHQ9J2FkbWludXNlcicgdGl0bGU9JHtpbWdUaXRsZX0+YCA6IGA8aW1nIGNsYXNzPSd1c2VySWNvbicgc3JjPScuLi9pbWFnZXMvdXNlci5wbmcnIGFsdD0nbm9ybWFsdXNlcicgdGl0bGU9JHtpbWdUaXRsZX0+YClcclxuICAgICAgICBsZXQgdXNlck5hbWUgPSAoISF1c2VyLmN1cnJlbnQgPyBgPHN0cm9uZz4ke3VzZXIudXNlck5hbWV9PC9zdHJvbmc+YCA6IGAke3VzZXIudXNlck5hbWV9YClcclxuICAgICAgICBcclxuICAgICAgICBpZiAodXNlci5hZG1pbiAmJiAhdXNlci5jdXJyZW50KSB7XHJcbiAgICAgICAgICAgIGxldCBhZG1pbk5hbWVDb250YWluZXIgPSAnPGRpdiBjbGFzcz1cImFkbWluTmFtZUNvbnRhaW5lclwiPicrdXNlckljb24rYDxzcGFuIHN0eWxlPVwibWFyZ2luLWxlZnQ6NXB4OyBtYXgtd2lkdGg6IDgwJTsgd29yZC1icmVhazogYnJlYWstYWxsXCI+JHt1c2VyTmFtZX08L3NwYW4+YCtgPGRpdiBjbGFzcz1cInVzZXJDb2xvckNpcmNsZVwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjoke3VzZXIuY29sb3J9XCI+PC9kaXY+PC9kaXY+YDtcclxuICAgICAgICAgICAgbGV0IGFkbWluVGltZXJDb250YWluZXIgPSBgXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWRtaW5UaW1lckNvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgaWQ9XCJsb2FkaW5nQmFyXCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gaWQ9XCJhZG1pblRpbWVcIj4wMDoxMTowNC8wMDoyNToxNTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICBgXHJcbiAgICAgICAgICAgIHVzZXJFbGVtLmlubmVySFRNTCA9IGFkbWluTmFtZUNvbnRhaW5lcithZG1pblRpbWVyQ29udGFpbmVyXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdXNlckVsZW0uaW5uZXJIVE1MID0gdXNlckljb24rYDxzcGFuIHN0eWxlPVwibWFyZ2luLWxlZnQ6NXB4OyBtYXgtd2lkdGg6IDgwJTsgd29yZC1icmVhazogYnJlYWstYWxsXCI+JHt1c2VyTmFtZX08L3NwYW4+YCtgPGRpdiBjbGFzcz1cInVzZXJDb2xvckNpcmNsZVwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjoke3VzZXIuY29sb3J9XCI+PC9kaXY+YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdXNlcnNMaXN0Q29udGFpbmVyLmFwcGVuZCh1c2VyRWxlbSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuYDxkaXYgc3R5bGU9XCJcclxuaGVpZ2h0OiAyMHB4O1xyXG5tYXJnaW4tdG9wOiA1cHg7XHJcbndpZHRoOiAxMDAlO1xyXG5ib3JkZXI6IDFweCBzb2xpZCBibGFjaztcclxucG9zaXRpb246IHJlbGF0aXZlO1xyXG5cIj48ZGl2IHN0eWxlPVwiXHJcbmhlaWdodDogMTAwJTtcclxud2lkdGg6IDQzJTtcclxuYmFja2dyb3VuZC1jb2xvcjogIzViZjM1YjtcclxuXCI+PC9kaXY+PHNwYW4gc3R5bGU9XCJcclxucG9zaXRpb246IGFic29sdXRlO1xyXG50b3A6IDNweDtcclxubGVmdDogMTAwcHg7XHJcblwiPjAwOjExOjA0LzAwOjI1OjE1PC9zcGFuPjwvZGl2PmBcclxuXHJcbmNvbnN0IHNldENoYXRPcGVuVG9nZ2xlID0gKGNoYXRPcGVuOiBCb29sZWFuKSA9PiB7XHJcbiAgICBpZiAoY2hhdE9wZW4pIHtcclxuICAgICAgICBjaGF0VG9nZ2xlQnRuLmNsYXNzTGlzdC5hZGQoJ3RvZ2dsZWRCdG4nKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjaGF0VG9nZ2xlQnRuLmNsYXNzTGlzdC5yZW1vdmUoJ3RvZ2dsZWRCdG4nKVxyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBzZXRPZmZzZXRJbnB1dCA9IChvZmZzZXRUaW1lOiBudW1iZXIsIHZpZGVvTGVuZ3RoOiBudW1iZXIpID0+IHtcclxuXHJcbiAgICAvLyBBZG1pbiBkb2VzIG5vdCBzZWUgb2Zmc2V0IGlucHV0XHJcbiAgICBpZiAobG9jYWxVc2Vycy5maW5kKHVzZXIgPT4gdXNlci5jdXJyZW50KT8uYWRtaW4pIHtcclxuICAgICAgICBvZmZzZXRDb250YWluZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9mZnNldFRpbWUgPiAwKSB7XHJcbiAgICAgICAgcG9zT2Zmc2V0QnRuLmNsYXNzTGlzdC5hZGQoJ3RvZ2dsZWRCdG4nKVxyXG4gICAgfVxyXG5cclxuICAgIG9mZnNldFRpbWUgPCAwID8gb2Zmc2V0VGltZSo9LTEgOiBudWxsXHJcblxyXG4gICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTMyMjczMi9jb252ZXJ0LXNlY29uZHMtdG8taGgtbW0tc3Mtd2l0aC1qYXZhc2NyaXB0XHJcbiAgICBsZXQgbWF4VGltZSA9IG5ldyBEYXRlKHZpZGVvTGVuZ3RoICogMTAwMCkudG9JU09TdHJpbmcoKS5zdWJzdHIoMTEsIDgpXHJcbiAgICBsZXQgY3VyVGltZSA9IG5ldyBEYXRlKG9mZnNldFRpbWUgKiAxMDAwKS50b0lTT1N0cmluZygpLnN1YnN0cigxMSwgOClcclxuICAgIG9mZnNldElucHV0LnNldEF0dHJpYnV0ZShcImRhdGEtZHVyYXRpb24tbWF4XCIsIG1heFRpbWUpXHJcbiAgICBvZmZzZXRJbnB1dC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWR1cmF0aW9uLW1pblwiLCBcIjAwOjAwOjAwXCIpXHJcbiAgICBvZmZzZXRJbnB1dC52YWx1ZSA9IGN1clRpbWVcclxufVxyXG5cclxuLy8gTWVzc2FnZSBoYW5kbGVyXHJcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigocmVxdWVzdDogTWVzc2FnZU9iamVjdDxhbnk+LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG5cclxuICAgIC8vQ2hlY2sgYmVsb3cgaXMgaW1wb3J0YW50IGIvYyBpZiB3ZSBoYXZlIG11bHRpcGxlIHBvcHVwcyBvcGVuIGluIGRpZmYgd2luZG93cywgd2UgZG9udCB3YW50IGFsbCByZWFjdGluZyB0byBzYW1lIGV2ZW50XHJcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OnRydWV9LCB0YWJzID0+IHtcclxuICAgICAgICBsZXQgY3VyQWN0aXZlVGFiSWQgPSB0YWJzWzBdLmlkXHJcbiAgICAgICAgaWYgKHNlbmRlci50YWI/LmlkID09PSBjdXJBY3RpdmVUYWJJZCAmJiByZXF1ZXN0Lm1lc3NhZ2UgPT09IE1lc3NhZ2VzLlRPUE9QVVBfUk9PTV9EQVRBKSB7XHJcbiAgICAgICAgICAgIGxldCByZXFEYXRhID0gPFRvUG9wdXBSb29tUGF5bG9hZD5yZXF1ZXN0LnBheWxvYWRcclxuICAgICAgICAgICAgdXBkYXRlTWFpblVzZXJzKHJlcURhdGEucm9vbS51c2VycylcclxuICAgICAgICAgICAgc2V0T2Zmc2V0SW5wdXQocmVxRGF0YS5vZmZzZXRUaW1lLCByZXFEYXRhLnZpZGVvTGVuZ3RoKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG59KTtcclxuXHJcblxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=