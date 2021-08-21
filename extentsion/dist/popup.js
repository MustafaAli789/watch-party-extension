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
    Messages[Messages["TOFG_GET_ADMIN_VID_TIME"] = 15] = "TOFG_GET_ADMIN_VID_TIME";
    Messages[Messages["TOPOPUP_ADMIN_VID_TIME_INFO"] = 16] = "TOPOPUP_ADMIN_VID_TIME_INFO";
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
let activeTabId;
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
    activeTabId = tabs[0].id;
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
    chrome.tabs.sendMessage(activeTabId, {
        message: constants_1.Messages.TOFG_SYNC_VID
    });
});
chatToggleBtn.addEventListener('click', () => {
    chatToggled = !chatToggled;
    chrome.tabs.sendMessage(activeTabId, {
        message: constants_1.Messages.TOFG_CHAT_TOGGLE,
    }, _ => {
        setChatOpenToggle(chatToggled);
    });
});
const leaveRoom = () => {
    chrome.tabs.sendMessage(activeTabId, {
        message: constants_1.Messages.TOFG_DISCONNECT
    });
    changePage({ pageType: constants_1.Page.START, roomId: null, roomName: "" });
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
        chrome.tabs.sendMessage(activeTabId, {
            message: constants_1.Messages.TOFG_SET_OFFSET,
            payload: { offsetTime: offsetTime, direction: direction }
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
        let imgTitle = user.admin ? (!!user.current ? 'CurrentUserAdmin' : 'Admin') : (!!user.current ? 'CurrentUser' : 'RoomUser');
        let userIcon = (user.admin ? `<img class='userIcon' src='../images/adminUser.png' alt='adminuser' title=${imgTitle}>` : `<img class='userIcon' src='../images/user.png' alt='normaluser' title=${imgTitle}>`);
        let userName = (!!user.current ? `<strong>${user.userName}</strong>` : `${user.userName}`);
        if (user.admin && !user.current) {
            let adminNameContainer = '<div class="adminNameContainer">' + userIcon + `<span style="margin-left:5px; max-width: 80%; word-break: break-all">${userName}</span>` + `<div class="userColorCircle" style="background-color:${user.color}"></div></div>`;
            let adminTimerContainer = `
                <div class="adminTimerContainer">
                    <div id="loadingBar"></div>
                    <span id="adminTime">00:11:04/00:25:15</span>
                    <span id="adminVidPlaying"></span>
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
const updateAdminContainer = (adminCurTime, adminVidLength, adminVidPaused, adminVidBuffering) => {
    let loadingBar = document.getElementById("loadingBar");
    let adminTime = document.getElementById("adminTime");
    let adminVidPlaying = document.getElementById("adminVidPlaying");
    loadingBar.style.width = `${(adminCurTime / adminVidLength) * 100}%`;
    let curTimeFormatted = new Date(adminCurTime * 1000).toISOString().substr(11, 8);
    let vidLengthFormatted = new Date(adminVidLength * 1000).toISOString().substr(11, 8);
    adminTime.innerHTML = `${curTimeFormatted}/${vidLengthFormatted}`;
    adminVidPlaying.innerHTML = adminVidBuffering ? "⌛" : (adminVidPaused ? "⏸︎" : "⏩︎");
    adminVidPlaying.title = adminVidBuffering ? "Buffering" : (adminVidPaused ? "Paused" : "Playing");
};
// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    var _a;
    //Check below is important b/c if we have multiple popups open in diff windows, we dont want all reacting to same event
    if (((_a = sender.tab) === null || _a === void 0 ? void 0 : _a.id) === activeTabId) {
        if (request.message === constants_1.Messages.TOPOPUP_ROOM_DATA) {
            let reqData = request.payload;
            updateMainUsers(reqData.room.users);
            setOffsetInput(reqData.offsetTime, reqData.videoLength);
            setChatOpenToggle(reqData.chatOpen);
        }
        else if (request.message === constants_1.Messages.TOPOPUP_ADMIN_VID_TIME_INFO) {
            let reqData = request.payload;
            updateAdminContainer(reqData.curTime, reqData.vidDuration, reqData.vidPaused, reqData.vidBuffering);
        }
        else if (request.message === constants_1.Messages.TOPOPUP_LEAVE_ROOM) {
            changePage({ pageType: constants_1.Page.START, roomId: null, roomName: "" });
        }
    }
    return true;
});
setInterval(() => {
    //i.e we are connected to a room RN and current user is not admin
    if (localUsers.length > 0 && !localUsers.find(user => user.admin).current) {
        chrome.tabs.sendMessage(activeTabId, {
            message: constants_1.Messages.TOFG_GET_ADMIN_VID_TIME
        });
    }
}, 1000);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLElBQVksSUFHWDtBQUhELFdBQVksSUFBSTtJQUNaLGlDQUFLO0lBQ0wsK0JBQUk7QUFDUixDQUFDLEVBSFcsSUFBSSxHQUFKLFlBQUksS0FBSixZQUFJLFFBR2Y7QUFFRCxJQUFZLFFBa0JYO0FBbEJELFdBQVksUUFBUTtJQUNoQiw2Q0FBTztJQUNQLDZDQUFPO0lBQ1AsdUVBQW9CO0lBQ3BCLDZFQUF1QjtJQUN2Qix5RUFBcUI7SUFDckIsNkRBQWU7SUFDZiw2RUFBdUI7SUFDdkIsaUVBQWlCO0lBQ2pCLHlEQUFhO0lBQ2IsbUVBQWtCO0lBQ2xCLGtFQUFpQjtJQUNqQix3RUFBb0I7SUFDcEIsZ0VBQWdCO0lBQ2hCLDhEQUFlO0lBQ2YsNEVBQXNCO0lBQ3RCLDhFQUF1QjtJQUN2QixzRkFBMkI7QUFDL0IsQ0FBQyxFQWxCVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQWtCbkI7Ozs7Ozs7VUN2QkQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7Ozs7Ozs7O0FDdEJBLDJGQUFtRDtBQVFuRCxJQUFJLFVBQVUsR0FBVyxFQUFFO0FBQzNCLElBQUksV0FBVyxHQUFZLElBQUk7QUFDL0IsSUFBSSxXQUFtQjtBQUV2QixZQUFZO0FBQ1osTUFBTSxTQUFTLEdBQW1CLFFBQVEsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDdkUsTUFBTSxRQUFRLEdBQW1CLFFBQVEsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDckUsTUFBTSxNQUFNLEdBQW1CLFFBQVEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakUsTUFBTSxrQkFBa0IsR0FBbUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0FBQ2pHLE1BQU0sZUFBZSxHQUFtQixRQUFRLENBQUMsYUFBYSxDQUFDLDRCQUE0QixDQUFDO0FBRTVGLFFBQVE7QUFDUixNQUFNLFVBQVUsR0FBeUMsUUFBUSxDQUFDLGFBQWEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0FBQzVILE1BQU0sV0FBVyxHQUF5QyxRQUFRLENBQUMsYUFBYSxDQUFDLDJDQUEyQyxDQUFDLENBQUM7QUFDOUgsTUFBTSxZQUFZLEdBQXlDLFFBQVEsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUN4RyxNQUFNLFVBQVUsR0FBeUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0FBQzFILE1BQU0sT0FBTyxHQUFzQixRQUFRLENBQUMsYUFBYSxDQUFDLHlDQUF5QyxDQUFDO0FBQ3BHLE1BQU0sYUFBYSxHQUFzQixRQUFRLENBQUMsYUFBYSxDQUFDLDRDQUE0QyxDQUFDO0FBQzdHLE1BQU0sWUFBWSxHQUF5QyxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQztBQUNsRyxNQUFNLGNBQWMsR0FBeUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQztBQUV0RyxRQUFRO0FBQ1IsTUFBTSxTQUFTLEdBQXVDLFFBQVEsQ0FBQyxhQUFhLENBQUMseUNBQXlDLENBQUMsQ0FBQztBQUN4SCxNQUFNLGFBQWEsR0FBdUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO0FBQzVILE1BQU0sV0FBVyxHQUF1QyxRQUFRLENBQUMsYUFBYSxDQUFDLGtEQUFrRCxDQUFDO0FBRWxJLE1BQU07QUFDTixNQUFNLFlBQVksR0FBeUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0FBQ3pHLE1BQU0sVUFBVSxHQUFvQixRQUFRLENBQUMsYUFBYSxDQUFDLG9DQUFvQyxDQUFDLENBQUM7QUFDakcsTUFBTSxZQUFZLEdBQXVCLFFBQVEsQ0FBQyxhQUFhLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUc3Rix1QkFBdUI7QUFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBQyxNQUFNLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUMsRUFBRSxJQUFJLENBQUMsRUFBRTtJQUN6RCxXQUFXLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDeEIsSUFBSSxZQUFZLEdBQStCLEVBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsZ0JBQUksQ0FBQyxLQUFLLEVBQUM7SUFFbkYsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFO1FBQ2pDLE9BQU8sRUFBRSxvQkFBUSxDQUFDLG9CQUFvQjtLQUNsQixFQUFFLENBQUMsSUFBNkIsRUFBRSxFQUFFO1FBQ3hELElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxvQkFBUSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2pELE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRTtnQkFDakMsT0FBTyxFQUFFLG9CQUFRLENBQUMsdUJBQXVCO2FBQ3JCLEVBQUUsQ0FBQyxJQUF3QyxFQUFFLEVBQUU7Z0JBQ25FLFlBQVksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTTtnQkFDOUMsWUFBWSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRO2dCQUNsRCxZQUFZLENBQUMsUUFBUSxHQUFHLGdCQUFJLENBQUMsSUFBSTtnQkFDakMsV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUTtnQkFFbkMsVUFBVSxDQUFDLFlBQVksQ0FBQztnQkFDeEIsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDeEMsaUJBQWlCLENBQUMsV0FBVyxDQUFDO2dCQUM5QixjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7WUFDckUsQ0FBQyxDQUFDO1NBQ0w7SUFDTCxDQUFDLENBQUM7SUFFRixVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFDO0FBRUYsTUFBTSxjQUFjLEdBQUcsR0FBRyxFQUFFO0lBQ3hCLElBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDbEMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEMsWUFBWSxDQUFDLFNBQVMsR0FBRyx3QkFBd0IsQ0FBQztRQUNsRCxPQUFPLEtBQUssQ0FBQztLQUNoQjtTQUFNLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQzFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hDLFlBQVksQ0FBQyxTQUFTLEdBQUcsNkNBQTZDLENBQUM7UUFDdkUsT0FBTyxLQUFLLENBQUM7S0FDaEI7U0FBTTtRQUNILFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JDLFlBQVksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQzVCLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7QUFDTCxDQUFDO0FBRUQsVUFBVSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRTtJQUNyQywyQkFBMkIsRUFBRSxDQUFDO0FBQ2xDLENBQUMsQ0FBQztBQUVGLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUU7SUFDdEMsc0JBQXNCLEVBQUU7QUFDNUIsQ0FBQyxDQUFDO0FBRUYsWUFBWSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRTtJQUN2QyxTQUFTLEVBQUU7QUFDZixDQUFDLENBQUM7QUFFRixPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtJQUNuQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFDO1FBQ3hCLE9BQU07S0FDVDtJQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRTtRQUNqQyxPQUFPLEVBQUUsb0JBQVEsQ0FBQyxhQUFhO0tBQ1gsQ0FBQztBQUM3QixDQUFDLENBQUM7QUFDRixhQUFhLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtJQUN6QyxXQUFXLEdBQUcsQ0FBQyxXQUFXO0lBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRTtRQUNqQyxPQUFPLEVBQUUsb0JBQVEsQ0FBQyxnQkFBZ0I7S0FDZCxFQUFFLENBQUMsQ0FBQyxFQUFFO1FBQzFCLGlCQUFpQixDQUFDLFdBQVcsQ0FBQztJQUNsQyxDQUFDLENBQUM7QUFDTixDQUFDLENBQUM7QUFFRixNQUFNLFNBQVMsR0FBRyxHQUFHLEVBQUU7SUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFO1FBQ2pDLE9BQU8sRUFBRSxvQkFBUSxDQUFDLGVBQWU7S0FDYixDQUFDO0lBQ3pCLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxnQkFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUNwRSxDQUFDO0FBRUQsVUFBVSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7SUFDdEMsSUFBSSxTQUFTLEdBQUcsVUFBVSxDQUFDLFNBQVM7SUFDcEMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtJQUNuRCxDQUFDLEVBQUUsR0FBRyxFQUFFO1FBQ0osZ0JBQWdCO0lBQ3BCLENBQUMsQ0FBQztBQUNOLENBQUMsQ0FBQztBQUVGLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO0lBQ3hDLFNBQVMsQ0FBQyxJQUFJLENBQUM7QUFDbkIsQ0FBQyxDQUFDO0FBRUYsY0FBYyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7SUFDMUMsSUFBSSxXQUFXLENBQUMsS0FBSyxLQUFLLFVBQVUsRUFBRTtRQUNsQyxXQUFXLENBQUMsS0FBSyxHQUFHLFVBQVU7UUFDOUIsU0FBUyxDQUFDLElBQUksQ0FBQztLQUNsQjtBQUNMLENBQUMsQ0FBQztBQUVGLE1BQU0sU0FBUyxHQUFHLENBQUMsU0FBd0IsRUFBRSxFQUFFO0lBQzNDLElBQUksSUFBSSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztJQUN2QyxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdCLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUIsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU1QixJQUFJLFVBQVUsR0FBRyxLQUFLLEdBQUMsSUFBSSxHQUFHLElBQUksR0FBQyxFQUFFLEdBQUcsSUFBSTtJQUU1Qyx3QkFBd0I7SUFDeEIsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO0lBQzNDLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTtRQUNwQixZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7S0FDM0M7SUFFRCxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsSUFBSSxTQUFTLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsSUFBSSxVQUFVLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDNUUsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFO1lBQ2pDLE9BQU8sRUFBRSxvQkFBUSxDQUFDLGVBQWU7WUFDakMsT0FBTyxFQUFFLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFO1NBQ3hCLENBQUM7S0FDekM7QUFDTCxDQUFDO0FBRUQsTUFBTSxzQkFBc0IsR0FBRyxHQUFHLEVBQUU7SUFDaEMsSUFBSSxhQUFhLEdBQXVDO1FBQ3BELE9BQU8sRUFBRSxvQkFBUSxDQUFDLHFCQUFxQjtRQUN2QyxPQUFPLEVBQUU7WUFDTCxNQUFNLEVBQUUsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7WUFDbEMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxLQUFLO1NBQzVCO0tBQ0o7SUFDRCx3QkFBd0IsQ0FBQyxhQUFhLENBQUM7QUFDM0MsQ0FBQztBQUVELE1BQU0sMkJBQTJCLEdBQUcsR0FBRyxFQUFFO0lBQ3JDLElBQUksYUFBYSxHQUFzQztRQUNuRCxPQUFPLEVBQUUsb0JBQVEsQ0FBQyx1QkFBdUI7UUFDekMsT0FBTyxFQUFFO1lBQ0wsUUFBUSxFQUFFLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO1lBQ3BDLFFBQVEsRUFBRSxTQUFTLENBQUMsS0FBSztTQUM1QjtLQUNKO0lBQ0Qsd0JBQXdCLENBQUMsYUFBYSxDQUFDO0FBQzNDLENBQUM7QUFFRCxNQUFNLHdCQUF3QixHQUFHLENBQUMsYUFBaUMsRUFBRSxFQUFFO0lBQ25FLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxFQUFFLE9BQU8sRUFBRSxvQkFBUSxDQUFDLG9CQUFvQixFQUF5QixFQUFFLENBQUMsSUFBNkIsRUFBRSxFQUFFO1FBQ3RJLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxvQkFBUSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLGNBQWMsRUFBRSxFQUFFO1lBQ3RFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxhQUFhLEVBQUUsQ0FBQyxJQUF3QyxFQUFFLEVBQUU7Z0JBQzdGLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxvQkFBUSxDQUFDLE9BQU8sRUFBRTtvQkFDbEMsVUFBVSxDQUFFLEVBQUUsUUFBUSxFQUFFLGdCQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBa0IsQ0FBQztvQkFDNUgsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztvQkFDeEMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7b0JBQ3hDLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztpQkFDcEU7WUFDTCxDQUFDLENBQUM7U0FDTDtJQUNMLENBQUMsQ0FBQztBQUNOLENBQUM7QUFFRCxNQUFNLFVBQVUsR0FBRyxDQUFDLFlBQTBCLEVBQUUsRUFBRTtJQUM5QyxJQUFJLFlBQVksQ0FBQyxRQUFRLEtBQUssZ0JBQUksQ0FBQyxLQUFLLEVBQUU7UUFDdEMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEMsYUFBYSxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDO1FBQzVDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0tBQ3hCO1NBQU0sSUFBSSxZQUFZLENBQUMsUUFBUSxLQUFLLGdCQUFJLENBQUMsSUFBSSxFQUFFO1FBQzVDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xDLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRS9CLFlBQVksQ0FBQyxTQUFTLEdBQUksR0FBRyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDckQsVUFBVSxDQUFDLFNBQVMsR0FBRyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNuRDtBQUNMLENBQUM7QUFFRCxNQUFNLGVBQWUsR0FBRyxDQUFDLEtBQWtCLEVBQUUsRUFBRTtJQUMzQyxVQUFVLEdBQUcsS0FBSztJQUVsQixJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3pCLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQztLQUN2QztTQUFNO1FBQ0gsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDO0tBQzFDO0lBRUQsa0JBQWtCLENBQUMsU0FBUyxHQUFHLEVBQUU7SUFDakMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNqQixJQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDO1NBQ3hDO1FBQ0QsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUM3QixRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7U0FDdEM7UUFDRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO1FBQzNILElBQUksUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsNkVBQTZFLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyx5RUFBeUUsUUFBUSxHQUFHLENBQUM7UUFDN00sSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsV0FBVyxJQUFJLENBQUMsUUFBUSxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRTFGLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDN0IsSUFBSSxrQkFBa0IsR0FBRyxrQ0FBa0MsR0FBQyxRQUFRLEdBQUMsd0VBQXdFLFFBQVEsU0FBUyxHQUFDLHdEQUF3RCxJQUFJLENBQUMsS0FBSyxnQkFBZ0IsQ0FBQztZQUNsUCxJQUFJLG1CQUFtQixHQUFHOzs7Ozs7YUFNekI7WUFDRCxRQUFRLENBQUMsU0FBUyxHQUFHLGtCQUFrQixHQUFDLG1CQUFtQjtTQUM5RDthQUFNO1lBQ0gsUUFBUSxDQUFDLFNBQVMsR0FBRyxRQUFRLEdBQUMsd0VBQXdFLFFBQVEsU0FBUyxHQUFDLHdEQUF3RCxJQUFJLENBQUMsS0FBSyxVQUFVLENBQUM7U0FDeE07UUFDRCxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDeEMsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLFFBQWlCLEVBQUUsRUFBRTtJQUM1QyxJQUFJLFFBQVEsRUFBRTtRQUNWLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztLQUM1QztTQUFNO1FBQ0gsYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO0tBQy9DO0FBQ0wsQ0FBQztBQUVELE1BQU0sY0FBYyxHQUFHLENBQUMsVUFBa0IsRUFBRSxXQUFtQixFQUFFLEVBQUU7O0lBRS9ELGtDQUFrQztJQUNsQyxJQUFJLGdCQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQywwQ0FBRSxLQUFLLEVBQUU7UUFDOUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTTtRQUN0QyxPQUFNO0tBQ1Q7SUFFRCxJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUU7UUFDaEIsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO0tBQzNDO0lBRUQsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxJQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO0lBRXRDLDBGQUEwRjtJQUMxRixJQUFJLE9BQU8sR0FBRyxJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDdEUsSUFBSSxPQUFPLEdBQUcsSUFBSSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3JFLFdBQVcsQ0FBQyxZQUFZLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyxZQUFZLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxDQUFDO0lBQ3pELFdBQVcsQ0FBQyxLQUFLLEdBQUcsT0FBTztBQUMvQixDQUFDO0FBRUQsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLFlBQW9CLEVBQUUsY0FBc0IsRUFBRSxjQUF1QixFQUFFLGlCQUEwQixFQUFFLEVBQUU7SUFDL0gsSUFBSSxVQUFVLEdBQW1DLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDO0lBQ3RGLElBQUksU0FBUyxHQUFvQixRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQztJQUNyRSxJQUFJLGVBQWUsR0FBb0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQztJQUVqRixVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsWUFBWSxHQUFDLGNBQWMsQ0FBQyxHQUFDLEdBQUcsR0FBRztJQUVoRSxJQUFJLGdCQUFnQixHQUFHLElBQUksSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNoRixJQUFJLGtCQUFrQixHQUFHLElBQUksSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNwRixTQUFTLENBQUMsU0FBUyxHQUFHLEdBQUcsZ0JBQWdCLElBQUksa0JBQWtCLEVBQUU7SUFDakUsZUFBZSxDQUFDLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDcEYsZUFBZSxDQUFDLEtBQUssR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7QUFDckcsQ0FBQztBQUVELGtCQUFrQjtBQUNsQixNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUEyQixFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsRUFBRTs7SUFFdkYsdUhBQXVIO0lBQ3ZILElBQUksYUFBTSxDQUFDLEdBQUcsMENBQUUsRUFBRSxNQUFLLFdBQVcsRUFBRTtRQUNoQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssb0JBQVEsQ0FBQyxpQkFBaUIsRUFBRTtZQUNoRCxJQUFJLE9BQU8sR0FBdUIsT0FBTyxDQUFDLE9BQU87WUFDakQsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ25DLGNBQWMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUM7WUFDdkQsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztTQUN0QzthQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sS0FBSyxvQkFBUSxDQUFDLDJCQUEyQixFQUFFO1lBQ2pFLElBQUksT0FBTyxHQUFnQyxPQUFPLENBQUMsT0FBTztZQUMxRCxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDO1NBQ3RHO2FBQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLG9CQUFRLENBQUMsa0JBQWtCLEVBQUU7WUFDeEQsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLGdCQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDO1NBQ25FO0tBQ0o7SUFDRCxPQUFPLElBQUk7QUFDZixDQUFDLENBQUMsQ0FBQztBQUVILFdBQVcsQ0FBQyxHQUFHLEVBQUU7SUFDYixpRUFBaUU7SUFDakUsSUFBSSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUFFO1FBQ3ZFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRTtZQUNqQyxPQUFPLEVBQUUsb0JBQVEsQ0FBQyx1QkFBdUI7U0FDckIsQ0FBQztLQUM1QjtBQUNMLENBQUMsRUFBRSxJQUFJLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leHRlbnRzaW9uLy4vbW9kZWxzL2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly9leHRlbnRzaW9uL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4dGVudHNpb24vLi9wb3B1cC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBQYWdle1xyXG4gICAgU1RBUlQsXHJcbiAgICBNQUlOXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIE1lc3NhZ2Vze1xyXG4gICAgU1VDQ0VTUyxcclxuICAgIEZBSUxVUkUsXHJcbiAgICBUT0ZHX1ZJREVPX09OX1NDUkVFTixcclxuICAgIFRPRkdfQ1JFQVRFX1JPT01fSU5fVEFCLFxyXG4gICAgVE9GR19KT0lOX1JPT01fSU5fVEFCLFxyXG4gICAgVE9GR19ESVNDT05ORUNULFxyXG4gICAgVE9GR19SRVRSSUVWRV9ST09NX0RBVEEsXHJcbiAgICBUT0ZHX0RPX1lPVV9FWElTVCxcclxuICAgIFRPRkdfU1lOQ19WSUQsXHJcbiAgICBUT1BPUFVQX0xFQVZFX1JPT00sXHJcbiAgICBUT1BPUFVQX1JPT01fREFUQSxcclxuICAgIFRPRkdfSVNfQ0hBTk5FTF9PUEVOLFxyXG4gICAgVE9GR19DSEFUX1RPR0dMRSxcclxuICAgIFRPRkdfU0VUX09GRlNFVCxcclxuICAgIFRPQkdfT1BFTl9UQUJfV0lUSF9VUkwsXHJcbiAgICBUT0ZHX0dFVF9BRE1JTl9WSURfVElNRSxcclxuICAgIFRPUE9QVVBfQURNSU5fVklEX1RJTUVfSU5GT1xyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJpbXBvcnQgeyBNZXNzYWdlcywgUGFnZSB9IGZyb20gJy4vbW9kZWxzL2NvbnN0YW50cydcclxuaW1wb3J0IHsgVG9GZ0pvaW5Sb29tUGF5bG9hZCwgVG9GZ05ld1Jvb21QYXlsb2FkLCBUb0ZnT2Zmc2V0UGF5bG9hZCwgVG9Qb3B1cEFkbWluVGltZUluZm9QYXlsb2FkLCBUb1BvcHVwUm9vbVBheWxvYWQgfSBmcm9tICcuL21vZGVscy9wYXlsb2Fkcyc7XHJcbmltcG9ydCB7IE1lc3NhZ2VPYmplY3QsIFJlc3BvbnNlT2JqZWN0LCAgfSBmcm9tICcuL21vZGVscy9tZXNzYWdlcGFzc2luZyc7XHJcbmltcG9ydCB7IFBhZ2VNZXRhZGF0YSB9IGZyb20gJy4vbW9kZWxzL01pc2NlbGxhbmVvdXMnO1xyXG5cclxuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4uL3NoYXJlZG1vZGVscy91c2VyJ1xyXG5pbXBvcnQgeyAgfSBmcm9tICcuLi9zaGFyZWRtb2RlbHMvcGF5bG9hZHMnXHJcblxyXG5sZXQgbG9jYWxVc2VyczogVXNlcltdID0gW11cclxubGV0IGNoYXRUb2dnbGVkOiBCb29sZWFuID0gdHJ1ZVxyXG5sZXQgYWN0aXZlVGFiSWQ6IG51bWJlclxyXG5cclxuLy9Db250YWluZXJzXHJcbmNvbnN0IHN0YXJ0UGFnZTogSFRNTERpdkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UGFnZVwiKTtcclxuY29uc3QgbWFpblBhZ2U6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZVwiKTtcclxuY29uc3QgaGVhZGVyOiBIVE1MRGl2RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaGVhZGVyXCIpO1xyXG5jb25zdCB1c2Vyc0xpc3RDb250YWluZXI6IEhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAudXNlcnMgLnVzZXJzTGlzdFwiKTtcclxuY29uc3Qgb2Zmc2V0Q29udGFpbmVyOiBIVE1MRGl2RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblBhZ2UgLm9mZnNldENvbnRhaW5lclwiKVxyXG5cclxuLy9CdHRvbnNcclxuY29uc3QgbmV3Um9vbUJ0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFBhZ2UgLmFkZEl0ZW1Db250YWluZXIgLm5ld1Jvb21CdG5cIik7XHJcbmNvbnN0IGpvaW5Sb29tQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UGFnZSAuYWRkSXRlbUNvbnRhaW5lciAuam9pblJvb21CdG5cIik7XHJcbmNvbnN0IGxlYXZlUm9vbUJ0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAuYmFja0J0blwiKTtcclxuY29uc3QgY29weUltZ0J0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAucm9vbUlkQ29udGFpbmVyIC5jb3B5SW1nQnRuXCIpO1xyXG5jb25zdCBzeW5jQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblBhZ2UgLmFjdGlvbnMgLmFjdGlvbkJ0bnMgLnN5bmNCdG5cIilcclxuY29uc3QgY2hhdFRvZ2dsZUJ0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW5QYWdlIC5hY3Rpb25zIC5hY3Rpb25CdG5zIC5jaGF0VG9nZ2xlXCIpXHJcbmNvbnN0IHBvc09mZnNldEJ0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb3NPZmZzZXRCdG5cIilcclxuY29uc3QgcmVzZXRPZmZzZXRCdG46IEhUTUxCdXR0b25FbGVtZW50ID0gPEhUTUxCdXR0b25FbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzZXRPZmZzZXRCdG5cIilcclxuXHJcbi8vSW5wdXRzXHJcbmNvbnN0IG5hbWVJbnB1dDogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRQYWdlIC5hZGRJdGVtQ29udGFpbmVyIC5uYW1lSW5wdXRcIik7XHJcbmNvbnN0IHJvb21OYW1lSW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0UGFnZSAuYWRkSXRlbUNvbnRhaW5lciAucm9vbUlucHV0XCIpO1xyXG5jb25zdCBvZmZzZXRJbnB1dDogSFRNTElucHV0RWxlbWVudCA9IDxIVE1MSW5wdXRFbGVtZW50PmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblBhZ2UgLm9mZnNldENvbnRhaW5lciAuaHRtbC1kdXJhdGlvbi1waWNrZXJcIilcclxuXHJcbi8vVGV4dFxyXG5jb25zdCBlcnJvck1zZ0VsZW06IEhUTUxQYXJhZ3JhcGhFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFBhZ2UgLmFkZEl0ZW1Db250YWluZXIgLmVycm9yXCIpO1xyXG5jb25zdCByb29tSWRFbGVtOiBIVE1MU3BhbkVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWFpblBhZ2UgLnJvb21JZENvbnRhaW5lciAucm9vbUlkJyk7XHJcbmNvbnN0IHJvb21OYW1lRWxlbTogSFRNTEhlYWRpbmdFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAuaGVhZCAucm9vbU5hbWVcIik7XHJcblxyXG5cclxuLy9Jbml0aWFsIG9wZW4gb2YgcG9wdXBcclxuY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTp0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlfSwgdGFicyA9PiB7XHJcbiAgICBhY3RpdmVUYWJJZCA9IHRhYnNbMF0uaWRcclxuICAgIGxldCBwYWdlTWV0YWRhdGE6IFBhZ2VNZXRhZGF0YSA9IDxQYWdlTWV0YWRhdGE+e3Jvb21OYW1lOiBcIlwiLCBwYWdlVHlwZTogUGFnZS5TVEFSVH1cclxuXHJcbiAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwge1xyXG4gICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfSVNfQ0hBTk5FTF9PUEVOXHJcbiAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIChyZXNwOiBSZXNwb25zZU9iamVjdDxib29sZWFuPikgPT4ge1xyXG4gICAgICAgIGlmIChyZXNwLnN0YXR1cyA9PSBNZXNzYWdlcy5TVUNDRVNTICYmIHJlc3AucGF5bG9hZCkge1xyXG4gICAgICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwge1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19SRVRSSUVWRV9ST09NX0RBVEFcclxuICAgICAgICAgICAgfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8VG9Qb3B1cFJvb21QYXlsb2FkPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgcGFnZU1ldGFkYXRhLnJvb21JZCA9IHJlc3AucGF5bG9hZC5yb29tLnJvb21JZFxyXG4gICAgICAgICAgICAgICAgcGFnZU1ldGFkYXRhLnJvb21OYW1lID0gcmVzcC5wYXlsb2FkLnJvb20ucm9vbU5hbWVcclxuICAgICAgICAgICAgICAgIHBhZ2VNZXRhZGF0YS5wYWdlVHlwZSA9IFBhZ2UuTUFJTlxyXG4gICAgICAgICAgICAgICAgY2hhdFRvZ2dsZWQgPSByZXNwLnBheWxvYWQuY2hhdE9wZW5cclxuXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VQYWdlKHBhZ2VNZXRhZGF0YSlcclxuICAgICAgICAgICAgICAgIHVwZGF0ZU1haW5Vc2VycyhyZXNwLnBheWxvYWQucm9vbS51c2VycylcclxuICAgICAgICAgICAgICAgIHNldENoYXRPcGVuVG9nZ2xlKGNoYXRUb2dnbGVkKVxyXG4gICAgICAgICAgICAgICAgc2V0T2Zmc2V0SW5wdXQocmVzcC5wYXlsb2FkLm9mZnNldFRpbWUsIHJlc3AucGF5bG9hZC52aWRlb0xlbmd0aClcclxuICAgICAgICAgICAgfSkgXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICBjaGFuZ2VQYWdlKHBhZ2VNZXRhZGF0YSk7XHJcbn0pXHJcblxyXG5jb25zdCB2YWxpZFJvb21JbnB1dCA9ICgpID0+IHtcclxuICAgIGlmKHJvb21OYW1lSW5wdXQudmFsdWUudHJpbSgpID09PSBcIlwiKSB7XHJcbiAgICAgICAgZXJyb3JNc2dFbGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIGVycm9yTXNnRWxlbS5pbm5lckhUTUwgPSAnUGxlYXNlIGVudGVyIGEgcm9vbS9pZCc7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIGlmIChuYW1lSW5wdXQudmFsdWUudHJpbSgpLmxlbmd0aCA8IDMpIHtcclxuICAgICAgICBlcnJvck1zZ0VsZW0uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XHJcbiAgICAgICAgZXJyb3JNc2dFbGVtLmlubmVySFRNTCA9ICdQbGVhc2UgZW50ZXIgYSB1c2VybmFtZSBsb25nZXIgdGhhbiAzIGNoYXJzJztcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVycm9yTXNnRWxlbS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuICAgICAgICBlcnJvck1zZ0VsZW0uaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbm5ld1Jvb21CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBfID0+IHtcclxuICAgIGNyZWF0ZU5ld1Jvb21XaXRoVmFsaWRhdGlvbigpO1xyXG59KVxyXG5cclxuam9pblJvb21CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcclxuICAgIGpvaW5Sb29tV2l0aFZhbGlkYXRpb24oKVxyXG59KVxyXG5cclxubGVhdmVSb29tQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgXyA9PiB7XHJcbiAgICBsZWF2ZVJvb20oKVxyXG59KVxyXG5cclxuc3luY0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGlmIChsb2NhbFVzZXJzLmxlbmd0aCA9PT0gMSl7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwge1xyXG4gICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfU1lOQ19WSURcclxuICAgIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPilcclxufSlcclxuY2hhdFRvZ2dsZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGNoYXRUb2dnbGVkID0gIWNoYXRUb2dnbGVkXHJcbiAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwge1xyXG4gICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfQ0hBVF9UT0dHTEUsXHJcbiAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4sIF8gPT57XHJcbiAgICAgICAgc2V0Q2hhdE9wZW5Ub2dnbGUoY2hhdFRvZ2dsZWQpXHJcbiAgICB9KVxyXG59KVxyXG5cclxuY29uc3QgbGVhdmVSb29tID0gKCkgPT4ge1xyXG4gICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX0RJU0NPTk5FQ1RcclxuICAgIH0gYXMgTWVzc2FnZU9iamVjdDxudWxsPilcclxuICAgIGNoYW5nZVBhZ2UoeyBwYWdlVHlwZTogUGFnZS5TVEFSVCwgcm9vbUlkOiBudWxsLCByb29tTmFtZTogXCJcIiB9KVxyXG59XHJcblxyXG5jb3B5SW1nQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgbGV0IHJvb21JZFZhbCA9IHJvb21JZEVsZW0uaW5uZXJIVE1MXHJcbiAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChyb29tSWRWYWwpLnRoZW4oKCkgPT4ge1xyXG4gICAgfSwgKCkgPT4ge1xyXG4gICAgICAgIC8vRmFpbGVkIHRvIGNvcHlcclxuICAgIH0pXHJcbn0pXHJcblxyXG5wb3NPZmZzZXRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBzZXRPZmZzZXQoXCJVUFwiKVxyXG59KVxyXG5cclxucmVzZXRPZmZzZXRCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICBpZiAob2Zmc2V0SW5wdXQudmFsdWUgIT09IFwiMDA6MDA6MDBcIikge1xyXG4gICAgICAgIG9mZnNldElucHV0LnZhbHVlID0gXCIwMDowMDowMFwiXHJcbiAgICAgICAgc2V0T2Zmc2V0KG51bGwpXHJcbiAgICB9XHJcbn0pXHJcblxyXG5jb25zdCBzZXRPZmZzZXQgPSAoZGlyZWN0aW9uOiBcIlVQXCIgfCBcIkRPV05cIikgPT4ge1xyXG4gICAgbGV0IHRpbWUgPSBvZmZzZXRJbnB1dC52YWx1ZS5zcGxpdChcIjpcIilcclxuICAgIGxldCBob3VycyA9IHBhcnNlSW50KHRpbWVbMF0pXHJcbiAgICBsZXQgbWlucyA9IHBhcnNlSW50KHRpbWVbMV0pXHJcbiAgICBsZXQgc2VjcyA9IHBhcnNlSW50KHRpbWVbMl0pXHJcblxyXG4gICAgbGV0IG9mZnNldFRpbWUgPSBob3VycyozNjAwICsgbWlucyo2MCArIHNlY3NcclxuXHJcbiAgICAvLyBzZXR0aW5nIGJ1dHRvbiBzdHlsZXNcclxuICAgIHBvc09mZnNldEJ0bi5jbGFzc0xpc3QucmVtb3ZlKCd0b2dnbGVkQnRuJylcclxuICAgIGlmIChkaXJlY3Rpb24gPT09IFwiVVBcIikge1xyXG4gICAgICAgIHBvc09mZnNldEJ0bi5jbGFzc0xpc3QuYWRkKCd0b2dnbGVkQnRuJylcclxuICAgIH1cclxuXHJcbiAgICBpZiAoKG9mZnNldFRpbWUgPiAwICYmIGRpcmVjdGlvbiAhPT0gbnVsbCkgfHwgKCFkaXJlY3Rpb24gJiYgb2Zmc2V0VGltZSA9PT0gMCkpIHtcclxuICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZShhY3RpdmVUYWJJZCwge1xyXG4gICAgICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0ZHX1NFVF9PRkZTRVQsXHJcbiAgICAgICAgICAgIHBheWxvYWQ6IHsgb2Zmc2V0VGltZTogb2Zmc2V0VGltZSwgZGlyZWN0aW9uOiBkaXJlY3Rpb24gfVxyXG4gICAgICAgIH0gYXMgTWVzc2FnZU9iamVjdDxUb0ZnT2Zmc2V0UGF5bG9hZD4pXHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IGpvaW5Sb29tV2l0aFZhbGlkYXRpb24gPSAoKSA9PiB7XHJcbiAgICBsZXQgbWVzc2FnZU9iamVjdDogTWVzc2FnZU9iamVjdDxUb0ZnSm9pblJvb21QYXlsb2FkPiA9IHsgXHJcbiAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19KT0lOX1JPT01fSU5fVEFCLCBcclxuICAgICAgICBwYXlsb2FkOiB7XHJcbiAgICAgICAgICAgIHJvb21JZDogcm9vbU5hbWVJbnB1dC52YWx1ZS50cmltKCksIFxyXG4gICAgICAgICAgICB1c2VyTmFtZTogbmFtZUlucHV0LnZhbHVlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ29JbnRvUm9vbVdpdGhWYWxpZGF0aW9uKG1lc3NhZ2VPYmplY3QpXHJcbn1cclxuXHJcbmNvbnN0IGNyZWF0ZU5ld1Jvb21XaXRoVmFsaWRhdGlvbiA9ICgpID0+IHtcclxuICAgIGxldCBtZXNzYWdlT2JqZWN0OiBNZXNzYWdlT2JqZWN0PFRvRmdOZXdSb29tUGF5bG9hZD4gPSB7IFxyXG4gICAgICAgIG1lc3NhZ2U6IE1lc3NhZ2VzLlRPRkdfQ1JFQVRFX1JPT01fSU5fVEFCLCBcclxuICAgICAgICBwYXlsb2FkOiB7XHJcbiAgICAgICAgICAgIHJvb21OYW1lOiByb29tTmFtZUlucHV0LnZhbHVlLnRyaW0oKSwgXHJcbiAgICAgICAgICAgIHVzZXJOYW1lOiBuYW1lSW5wdXQudmFsdWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnb0ludG9Sb29tV2l0aFZhbGlkYXRpb24obWVzc2FnZU9iamVjdClcclxufVxyXG5cclxuY29uc3QgZ29JbnRvUm9vbVdpdGhWYWxpZGF0aW9uID0gKG1lc3NhZ2VPYmplY3Q6IE1lc3NhZ2VPYmplY3Q8YW55PikgPT4ge1xyXG4gICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHsgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19WSURFT19PTl9TQ1JFRU4gfSBhcyBNZXNzYWdlT2JqZWN0PG51bGw+LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8Ym9vbGVhbj4pID0+IHtcclxuICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT09IE1lc3NhZ2VzLlNVQ0NFU1MgJiYgcmVzcC5wYXlsb2FkICYmIHZhbGlkUm9vbUlucHV0KCkpIHsgXHJcbiAgICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGFjdGl2ZVRhYklkLCBtZXNzYWdlT2JqZWN0LCAocmVzcDogUmVzcG9uc2VPYmplY3Q8VG9Qb3B1cFJvb21QYXlsb2FkPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3Auc3RhdHVzID09PSBNZXNzYWdlcy5TVUNDRVNTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlUGFnZSggeyBwYWdlVHlwZTogUGFnZS5NQUlOLCByb29tSWQ6IHJlc3AucGF5bG9hZC5yb29tLnJvb21JZCwgcm9vbU5hbWU6IHJlc3AucGF5bG9hZC5yb29tLnJvb21OYW1lIH0gYXMgUGFnZU1ldGFkYXRhKVxyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZU1haW5Vc2VycyhyZXNwLnBheWxvYWQucm9vbS51c2VycylcclxuICAgICAgICAgICAgICAgICAgICBzZXRDaGF0T3BlblRvZ2dsZShyZXNwLnBheWxvYWQuY2hhdE9wZW4pXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0T2Zmc2V0SW5wdXQocmVzcC5wYXlsb2FkLm9mZnNldFRpbWUsIHJlc3AucGF5bG9hZC52aWRlb0xlbmd0aClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG59XHJcblxyXG5jb25zdCBjaGFuZ2VQYWdlID0gKHBhZ2VNZXRhZGF0YTogUGFnZU1ldGFkYXRhKSA9PiB7XHJcbiAgICBpZiAocGFnZU1ldGFkYXRhLnBhZ2VUeXBlID09PSBQYWdlLlNUQVJUKSB7XHJcbiAgICAgICAgc3RhcnRQYWdlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIG1haW5QYWdlLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICAgIGhlYWRlci5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcclxuICAgICAgICByb29tTmFtZUlucHV0LnZhbHVlID0gcGFnZU1ldGFkYXRhLnJvb21OYW1lO1xyXG4gICAgICAgIG5hbWVJbnB1dC52YWx1ZSA9IFwiXCI7XHJcbiAgICB9IGVsc2UgaWYgKHBhZ2VNZXRhZGF0YS5wYWdlVHlwZSA9PT0gUGFnZS5NQUlOKSB7XHJcbiAgICAgICAgc3RhcnRQYWdlLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xyXG4gICAgICAgIG1haW5QYWdlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xyXG4gICAgICAgIGhlYWRlci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcclxuXHJcbiAgICAgICAgcm9vbU5hbWVFbGVtLmlubmVySFRNTCA9ICBgJHtwYWdlTWV0YWRhdGEucm9vbU5hbWV9YDtcclxuICAgICAgICByb29tSWRFbGVtLmlubmVySFRNTCA9IGAke3BhZ2VNZXRhZGF0YS5yb29tSWR9YDtcclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgdXBkYXRlTWFpblVzZXJzID0gKHVzZXJzOiBBcnJheTxVc2VyPikgPT4ge1xyXG4gICAgbG9jYWxVc2VycyA9IHVzZXJzXHJcbiAgICBcclxuICAgIGlmIChsb2NhbFVzZXJzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgIHN5bmNCdG4uY2xhc3NMaXN0LmFkZChcImRpc2FibGVkQnRuXCIpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHN5bmNCdG4uY2xhc3NMaXN0LnJlbW92ZShcImRpc2FibGVkQnRuXCIpXHJcbiAgICB9XHJcblxyXG4gICAgdXNlcnNMaXN0Q29udGFpbmVyLmlubmVySFRNTCA9IFwiXCJcclxuICAgIHVzZXJzLmZvckVhY2godXNlciA9PiB7XHJcbiAgICAgICAgbGV0IHVzZXJFbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIkRJVlwiKTtcclxuICAgICAgICB1c2VyRWxlbS5jbGFzc0xpc3QuYWRkKFwidXNlckVsZW1cIik7XHJcbiAgICAgICAgaWYgKCEhdXNlci5jdXJyZW50KSB7XHJcbiAgICAgICAgICAgIHVzZXJFbGVtLmNsYXNzTGlzdC5hZGQoXCJjdXJyZW50VXNlclwiKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodXNlci5hZG1pbiAmJiAhdXNlci5jdXJyZW50KSB7XHJcbiAgICAgICAgICAgIHVzZXJFbGVtLmNsYXNzTGlzdC5hZGQoXCJhZG1pblVzZXJcIilcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGltZ1RpdGxlID0gdXNlci5hZG1pbiA/ICghIXVzZXIuY3VycmVudCA/ICdDdXJyZW50VXNlckFkbWluJyA6ICdBZG1pbicpIDogKCEhdXNlci5jdXJyZW50ID8gJ0N1cnJlbnRVc2VyJyA6ICdSb29tVXNlcicpXHJcbiAgICAgICAgbGV0IHVzZXJJY29uID0gKHVzZXIuYWRtaW4gPyBgPGltZyBjbGFzcz0ndXNlckljb24nIHNyYz0nLi4vaW1hZ2VzL2FkbWluVXNlci5wbmcnIGFsdD0nYWRtaW51c2VyJyB0aXRsZT0ke2ltZ1RpdGxlfT5gIDogYDxpbWcgY2xhc3M9J3VzZXJJY29uJyBzcmM9Jy4uL2ltYWdlcy91c2VyLnBuZycgYWx0PSdub3JtYWx1c2VyJyB0aXRsZT0ke2ltZ1RpdGxlfT5gKVxyXG4gICAgICAgIGxldCB1c2VyTmFtZSA9ICghIXVzZXIuY3VycmVudCA/IGA8c3Ryb25nPiR7dXNlci51c2VyTmFtZX08L3N0cm9uZz5gIDogYCR7dXNlci51c2VyTmFtZX1gKVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh1c2VyLmFkbWluICYmICF1c2VyLmN1cnJlbnQpIHtcclxuICAgICAgICAgICAgbGV0IGFkbWluTmFtZUNvbnRhaW5lciA9ICc8ZGl2IGNsYXNzPVwiYWRtaW5OYW1lQ29udGFpbmVyXCI+Jyt1c2VySWNvbitgPHNwYW4gc3R5bGU9XCJtYXJnaW4tbGVmdDo1cHg7IG1heC13aWR0aDogODAlOyB3b3JkLWJyZWFrOiBicmVhay1hbGxcIj4ke3VzZXJOYW1lfTwvc3Bhbj5gK2A8ZGl2IGNsYXNzPVwidXNlckNvbG9yQ2lyY2xlXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiR7dXNlci5jb2xvcn1cIj48L2Rpdj48L2Rpdj5gO1xyXG4gICAgICAgICAgICBsZXQgYWRtaW5UaW1lckNvbnRhaW5lciA9IGBcclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZG1pblRpbWVyQ29udGFpbmVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBpZD1cImxvYWRpbmdCYXJcIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBpZD1cImFkbWluVGltZVwiPjAwOjExOjA0LzAwOjI1OjE1PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGlkPVwiYWRtaW5WaWRQbGF5aW5nXCI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIGBcclxuICAgICAgICAgICAgdXNlckVsZW0uaW5uZXJIVE1MID0gYWRtaW5OYW1lQ29udGFpbmVyK2FkbWluVGltZXJDb250YWluZXJcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB1c2VyRWxlbS5pbm5lckhUTUwgPSB1c2VySWNvbitgPHNwYW4gc3R5bGU9XCJtYXJnaW4tbGVmdDo1cHg7IG1heC13aWR0aDogODAlOyB3b3JkLWJyZWFrOiBicmVhay1hbGxcIj4ke3VzZXJOYW1lfTwvc3Bhbj5gK2A8ZGl2IGNsYXNzPVwidXNlckNvbG9yQ2lyY2xlXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiR7dXNlci5jb2xvcn1cIj48L2Rpdj5gO1xyXG4gICAgICAgIH1cclxuICAgICAgICB1c2Vyc0xpc3RDb250YWluZXIuYXBwZW5kKHVzZXJFbGVtKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5jb25zdCBzZXRDaGF0T3BlblRvZ2dsZSA9IChjaGF0T3BlbjogQm9vbGVhbikgPT4ge1xyXG4gICAgaWYgKGNoYXRPcGVuKSB7XHJcbiAgICAgICAgY2hhdFRvZ2dsZUJ0bi5jbGFzc0xpc3QuYWRkKCd0b2dnbGVkQnRuJylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY2hhdFRvZ2dsZUJ0bi5jbGFzc0xpc3QucmVtb3ZlKCd0b2dnbGVkQnRuJylcclxuICAgIH1cclxufVxyXG5cclxuY29uc3Qgc2V0T2Zmc2V0SW5wdXQgPSAob2Zmc2V0VGltZTogbnVtYmVyLCB2aWRlb0xlbmd0aDogbnVtYmVyKSA9PiB7XHJcblxyXG4gICAgLy8gQWRtaW4gZG9lcyBub3Qgc2VlIG9mZnNldCBpbnB1dFxyXG4gICAgaWYgKGxvY2FsVXNlcnMuZmluZCh1c2VyID0+IHVzZXIuY3VycmVudCk/LmFkbWluKSB7XHJcbiAgICAgICAgb2Zmc2V0Q29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGlmIChvZmZzZXRUaW1lID4gMCkge1xyXG4gICAgICAgIHBvc09mZnNldEJ0bi5jbGFzc0xpc3QuYWRkKCd0b2dnbGVkQnRuJylcclxuICAgIH1cclxuXHJcbiAgICBvZmZzZXRUaW1lIDwgMCA/IG9mZnNldFRpbWUqPS0xIDogbnVsbFxyXG5cclxuICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEzMjI3MzIvY29udmVydC1zZWNvbmRzLXRvLWhoLW1tLXNzLXdpdGgtamF2YXNjcmlwdFxyXG4gICAgbGV0IG1heFRpbWUgPSBuZXcgRGF0ZSh2aWRlb0xlbmd0aCAqIDEwMDApLnRvSVNPU3RyaW5nKCkuc3Vic3RyKDExLCA4KVxyXG4gICAgbGV0IGN1clRpbWUgPSBuZXcgRGF0ZShvZmZzZXRUaW1lICogMTAwMCkudG9JU09TdHJpbmcoKS5zdWJzdHIoMTEsIDgpXHJcbiAgICBvZmZzZXRJbnB1dC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWR1cmF0aW9uLW1heFwiLCBtYXhUaW1lKVxyXG4gICAgb2Zmc2V0SW5wdXQuc2V0QXR0cmlidXRlKFwiZGF0YS1kdXJhdGlvbi1taW5cIiwgXCIwMDowMDowMFwiKVxyXG4gICAgb2Zmc2V0SW5wdXQudmFsdWUgPSBjdXJUaW1lXHJcbn1cclxuXHJcbmNvbnN0IHVwZGF0ZUFkbWluQ29udGFpbmVyID0gKGFkbWluQ3VyVGltZTogbnVtYmVyLCBhZG1pblZpZExlbmd0aDogbnVtYmVyLCBhZG1pblZpZFBhdXNlZDogQm9vbGVhbiwgYWRtaW5WaWRCdWZmZXJpbmc6IEJvb2xlYW4pID0+IHtcclxuICAgIGxldCBsb2FkaW5nQmFyOiBIVE1MRGl2RWxlbWVudCA9IDxIVE1MRGl2RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRpbmdCYXJcIilcclxuICAgIGxldCBhZG1pblRpbWU6IEhUTUxTcGFuRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRtaW5UaW1lXCIpXHJcbiAgICBsZXQgYWRtaW5WaWRQbGF5aW5nOiBIVE1MU3BhbkVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkbWluVmlkUGxheWluZ1wiKVxyXG5cclxuICAgIGxvYWRpbmdCYXIuc3R5bGUud2lkdGggPSBgJHsoYWRtaW5DdXJUaW1lL2FkbWluVmlkTGVuZ3RoKSoxMDB9JWBcclxuXHJcbiAgICBsZXQgY3VyVGltZUZvcm1hdHRlZCA9IG5ldyBEYXRlKGFkbWluQ3VyVGltZSAqIDEwMDApLnRvSVNPU3RyaW5nKCkuc3Vic3RyKDExLCA4KVxyXG4gICAgbGV0IHZpZExlbmd0aEZvcm1hdHRlZCA9IG5ldyBEYXRlKGFkbWluVmlkTGVuZ3RoICogMTAwMCkudG9JU09TdHJpbmcoKS5zdWJzdHIoMTEsIDgpXHJcbiAgICBhZG1pblRpbWUuaW5uZXJIVE1MID0gYCR7Y3VyVGltZUZvcm1hdHRlZH0vJHt2aWRMZW5ndGhGb3JtYXR0ZWR9YFxyXG4gICAgYWRtaW5WaWRQbGF5aW5nLmlubmVySFRNTCA9IGFkbWluVmlkQnVmZmVyaW5nID8gXCLijJtcIiA6IChhZG1pblZpZFBhdXNlZCA/IFwi4o+477iOXCIgOiBcIuKPqe+4jlwiKVxyXG4gICAgYWRtaW5WaWRQbGF5aW5nLnRpdGxlID0gYWRtaW5WaWRCdWZmZXJpbmcgPyBcIkJ1ZmZlcmluZ1wiIDogKGFkbWluVmlkUGF1c2VkID8gXCJQYXVzZWRcIiA6IFwiUGxheWluZ1wiKVxyXG59XHJcblxyXG4vLyBNZXNzYWdlIGhhbmRsZXJcclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0OiBNZXNzYWdlT2JqZWN0PGFueT4sIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XHJcblxyXG4gICAgLy9DaGVjayBiZWxvdyBpcyBpbXBvcnRhbnQgYi9jIGlmIHdlIGhhdmUgbXVsdGlwbGUgcG9wdXBzIG9wZW4gaW4gZGlmZiB3aW5kb3dzLCB3ZSBkb250IHdhbnQgYWxsIHJlYWN0aW5nIHRvIHNhbWUgZXZlbnRcclxuICAgIGlmIChzZW5kZXIudGFiPy5pZCA9PT0gYWN0aXZlVGFiSWQpIHtcclxuICAgICAgICBpZiAocmVxdWVzdC5tZXNzYWdlID09PSBNZXNzYWdlcy5UT1BPUFVQX1JPT01fREFUQSkge1xyXG4gICAgICAgICAgICBsZXQgcmVxRGF0YSA9IDxUb1BvcHVwUm9vbVBheWxvYWQ+cmVxdWVzdC5wYXlsb2FkXHJcbiAgICAgICAgICAgIHVwZGF0ZU1haW5Vc2VycyhyZXFEYXRhLnJvb20udXNlcnMpXHJcbiAgICAgICAgICAgIHNldE9mZnNldElucHV0KHJlcURhdGEub2Zmc2V0VGltZSwgcmVxRGF0YS52aWRlb0xlbmd0aClcclxuICAgICAgICAgICAgc2V0Q2hhdE9wZW5Ub2dnbGUocmVxRGF0YS5jaGF0T3BlbilcclxuICAgICAgICB9IGVsc2UgaWYgKHJlcXVlc3QubWVzc2FnZSA9PT0gTWVzc2FnZXMuVE9QT1BVUF9BRE1JTl9WSURfVElNRV9JTkZPKSB7XHJcbiAgICAgICAgICAgIGxldCByZXFEYXRhID0gPFRvUG9wdXBBZG1pblRpbWVJbmZvUGF5bG9hZD5yZXF1ZXN0LnBheWxvYWRcclxuICAgICAgICAgICAgdXBkYXRlQWRtaW5Db250YWluZXIocmVxRGF0YS5jdXJUaW1lLCByZXFEYXRhLnZpZER1cmF0aW9uLCByZXFEYXRhLnZpZFBhdXNlZCwgcmVxRGF0YS52aWRCdWZmZXJpbmcpXHJcbiAgICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0Lm1lc3NhZ2UgPT09IE1lc3NhZ2VzLlRPUE9QVVBfTEVBVkVfUk9PTSkge1xyXG4gICAgICAgICAgICBjaGFuZ2VQYWdlKHsgcGFnZVR5cGU6IFBhZ2UuU1RBUlQsIHJvb21JZDogbnVsbCwgcm9vbU5hbWU6IFwiXCIgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZVxyXG59KTtcclxuXHJcbnNldEludGVydmFsKCgpID0+IHtcclxuICAgIC8vaS5lIHdlIGFyZSBjb25uZWN0ZWQgdG8gYSByb29tIFJOIGFuZCBjdXJyZW50IHVzZXIgaXMgbm90IGFkbWluXHJcbiAgICBpZiAobG9jYWxVc2Vycy5sZW5ndGggPiAwICYmICFsb2NhbFVzZXJzLmZpbmQodXNlciA9PiB1c2VyLmFkbWluKS5jdXJyZW50KSB7XHJcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoYWN0aXZlVGFiSWQsIHtcclxuICAgICAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9GR19HRVRfQURNSU5fVklEX1RJTUVcclxuICAgICAgICB9IGFzIE1lc3NhZ2VPYmplY3Q8bnVsbD4pXHJcbiAgICB9XHJcbn0sIDEwMDApXHJcblxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=