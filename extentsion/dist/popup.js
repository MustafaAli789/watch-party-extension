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
/*!******************!*\
  !*** ./popup.ts ***!
  \******************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const constants_1 = __webpack_require__(/*! ./models/constants */ "./models/constants.ts");
const newRoomBtn = document.getElementById("newRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const backBtn = document.getElementById("backBtn");
const roomNameInput = document.getElementById("roomInput");
const errorMsg = document.querySelector(".error");
const nameInput = document.getElementById("nameInput");
const copyImgBtn = document.getElementById("copyImgBtn");
//Initial open of popup
chrome.storage.local.get(constants_1.PageStorage, data => {
    let page = data[constants_1.PageStorage];
    changePage(page, null);
});
const validRoomInput = () => {
    if (roomNameInput.value.trim() === "") {
        errorMsg.classList.remove('hidden');
        errorMsg.innerHTML = 'Please enter a room/id';
        return false;
    }
    else {
        errorMsg.classList.add('hidden');
        errorMsg.innerHTML = '';
        return true;
    }
};
newRoomBtn.addEventListener('click', e => {
    createNewRoomWithValidation();
});
joinRoomBtn.addEventListener('click', e => {
    //goToMainWithValidation()
});
backBtn.addEventListener('click', e => {
    chrome.runtime.sendMessage({
        message: constants_1.Messages.TOBG_DISCONNECT
    }, resp => {
        if (resp.status === constants_1.Messages.SUCCESS) {
            chrome.storage.local.set({
                [constants_1.PageStorage]: constants_1.Page.start
            });
            changePage(constants_1.Page.start, null);
        }
        else {
            //err
        }
    });
});
copyImgBtn.addEventListener('click', () => {
    let roomId = document.querySelector("#roomId").innerHTML;
    navigator.clipboard.writeText(roomId).then(() => {
        //Successfully copied
    }, () => {
        //Failed to copy
    });
});
const createNewRoomWithValidation = () => {
    chrome.runtime.sendMessage({
        message: constants_1.Messages.TOBG_VIDEO_ON_SCREEN
    }, response => {
        if (response.status === constants_1.Messages.SUCCESS) {
            if (response.payload === true) {
                if (!validRoomInput())
                    return;
                chrome.runtime.sendMessage({
                    message: constants_1.Messages.TOBG_CREATE_ROOM_IN_TAB,
                    payload: {
                        roomName: roomNameInput.value.trim(),
                        userName: nameInput.value
                    }
                }, resp => {
                    if (resp.status === constants_1.Messages.SUCCESS) {
                        chrome.storage.local.set({
                            page: "Main"
                        });
                        console.log(resp.payload);
                        changePage(constants_1.Page.main, { roomId: resp.payload.roomId });
                        updateMainUsers(resp.payload.users);
                    }
                    else {
                        //err for some reason couldnt connect to socket server
                    }
                });
            }
            else {
                //no video on screen
            }
        }
        else {
            //err
        }
    });
};
const changePage = (page, details) => {
    if (page === constants_1.Page.start) {
        document.getElementById("startPage").classList.remove('hidden');
        document.getElementById("mainPage").classList.add('hidden');
        document.getElementById("header").classList.remove('hidden');
        roomNameInput.value = "";
        nameInput.value = "";
    }
    else if (page === constants_1.Page.main) {
        document.getElementById("startPage").classList.add('hidden');
        document.getElementById("mainPage").classList.remove('hidden');
        document.getElementById("header").classList.add('hidden');
        document.querySelector("#mainPage .roomName").innerHTML = `${nameInput.value}`;
        document.getElementById("roomId").innerHTML = `${details === null || details === void 0 ? void 0 : details.roomId}`;
    }
};
//[user{userName: string, roomId: string, userId: string}]
const updateMainUsers = (users) => {
    let usersContaienr = document.querySelector("#mainPage .users");
    users.forEach(user => {
        let userElem = document.createElement("DIV");
        userElem.classList.add("userElem");
        userElem.innerHTML = user.userName;
        usersContaienr.append(userElem);
    });
};

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LENBQUMsVUFBVSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFDOUQsUUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztRQUV6RCxRQUFRLENBQUMsYUFBYSxDQUFDLHFCQUFxQixDQUFDLENBQUMsU0FBUyxHQUFJLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBRTtRQUMvRSxRQUFRLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsR0FBRyxHQUFHLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxNQUFNLEVBQUU7S0FFckU7QUFDTCxDQUFDO0FBRUQsMERBQTBEO0FBQzFELE1BQU0sZUFBZSxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUU7SUFDOUIsSUFBSSxjQUFjLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQztJQUMvRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2pCLElBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1FBQzVDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztRQUNsQyxRQUFRLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRO1FBQ2xDLGNBQWMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQ25DLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2V4dGVudHNpb24vLi9tb2RlbHMvY29uc3RhbnRzLnRzIiwid2VicGFjazovL2V4dGVudHNpb24vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXh0ZW50c2lvbi8uL3BvcHVwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBlbnVtIFBhZ2V7XHJcbiAgICBzdGFydCxcclxuICAgIG1haW5cclxufVxyXG5cclxuZXhwb3J0IGVudW0gTWVzc2FnZXN7XHJcbiAgICBUT0JHX1ZJREVPX09OX1NDUkVFTixcclxuICAgIFNVQ0NFU1MsXHJcbiAgICBGQUlMVVJFLFxyXG4gICAgVE9CR19DUkVBVEVfUk9PTV9JTl9UQUIsXHJcbiAgICBUT0ZHX1ZJREVPX09OX1NDUkVFTixcclxuICAgIFRPRkdfQ1JFQVRFX1JPT01fSU5fVEFCLFxyXG4gICAgVE9CR19ESVNDT05ORUNULFxyXG4gICAgVE9GR19ESVNDT05ORUNUXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBUYWJzU3RvcmFnZSA9IFwiYWN0aXZlX3RhYnNfd2F0Y2hwYXJ0eVwiXHJcbmV4cG9ydCBjb25zdCBQYWdlU3RvcmFnZSA9IFwicGFnZV93YXRjaHBhcnR5XCJcclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImltcG9ydCB7IE1lc3NhZ2VzLCBQYWdlLCBQYWdlU3RvcmFnZSB9IGZyb20gJy4vbW9kZWxzL2NvbnN0YW50cydcclxuY29uc3QgbmV3Um9vbUJ0bjogSFRNTEJ1dHRvbkVsZW1lbnQgPSA8SFRNTEJ1dHRvbkVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXdSb29tQnRuXCIpXHJcbmNvbnN0IGpvaW5Sb29tQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImpvaW5Sb29tQnRuXCIpXHJcbmNvbnN0IGJhY2tCdG46IEhUTUxCdXR0b25FbGVtZW50ID0gPEhUTUxCdXR0b25FbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmFja0J0blwiKVxyXG5jb25zdCByb29tTmFtZUlucHV0OiBIVE1MSW5wdXRFbGVtZW50ID0gPEhUTUxJbnB1dEVsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyb29tSW5wdXRcIilcclxuY29uc3QgZXJyb3JNc2c6IEhUTUxQYXJhZ3JhcGhFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5lcnJvclwiKVxyXG5jb25zdCBuYW1lSW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQgPSA8SFRNTElucHV0RWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVJbnB1dFwiKVxyXG5jb25zdCBjb3B5SW1nQnRuOiBIVE1MQnV0dG9uRWxlbWVudCA9IDxIVE1MQnV0dG9uRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvcHlJbWdCdG5cIilcclxuXHJcbi8vSW5pdGlhbCBvcGVuIG9mIHBvcHVwXHJcbmNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChQYWdlU3RvcmFnZSwgZGF0YSA9PiB7XHJcbiAgICBsZXQgcGFnZTogUGFnZSA9IGRhdGFbUGFnZVN0b3JhZ2VdXHJcbiAgICBjaGFuZ2VQYWdlKHBhZ2UsIG51bGwpXHJcbn0pXHJcblxyXG5jb25zdCB2YWxpZFJvb21JbnB1dCA9ICgpID0+IHtcclxuICAgIGlmKHJvb21OYW1lSW5wdXQudmFsdWUudHJpbSgpID09PSBcIlwiKSB7XHJcbiAgICAgICAgZXJyb3JNc2cuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcclxuICAgICAgICBlcnJvck1zZy5pbm5lckhUTUwgPSAnUGxlYXNlIGVudGVyIGEgcm9vbS9pZCdcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZXJyb3JNc2cuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcclxuICAgICAgICBlcnJvck1zZy5pbm5lckhUTUwgPSAnJ1xyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICB9XHJcbn1cclxuXHJcbm5ld1Jvb21CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcclxuICAgIGNyZWF0ZU5ld1Jvb21XaXRoVmFsaWRhdGlvbigpXHJcbn0pXHJcbmpvaW5Sb29tQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XHJcbiAgICAvL2dvVG9NYWluV2l0aFZhbGlkYXRpb24oKVxyXG59KVxyXG5iYWNrQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XHJcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgbWVzc2FnZTogTWVzc2FnZXMuVE9CR19ESVNDT05ORUNUXHJcbiAgICB9LCByZXNwID0+IHtcclxuICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT09IE1lc3NhZ2VzLlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcclxuICAgICAgICAgICAgICAgIFtQYWdlU3RvcmFnZV06IFBhZ2Uuc3RhcnRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNoYW5nZVBhZ2UoUGFnZS5zdGFydCwgIG51bGwpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy9lcnJcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG59KVxyXG5jb3B5SW1nQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgbGV0IHJvb21JZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcm9vbUlkXCIpLmlubmVySFRNTFxyXG4gICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQocm9vbUlkKS50aGVuKCgpID0+IHtcclxuICAgICAgICAvL1N1Y2Nlc3NmdWxseSBjb3BpZWRcclxuICAgIH0sICgpID0+IHtcclxuICAgICAgICAvL0ZhaWxlZCB0byBjb3B5XHJcbiAgICB9KVxyXG59KVxyXG5cclxuY29uc3QgY3JlYXRlTmV3Um9vbVdpdGhWYWxpZGF0aW9uID0gKCkgPT4ge1xyXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBcclxuICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0JHX1ZJREVPX09OX1NDUkVFTlxyXG4gICAgfSwgcmVzcG9uc2UgPT4ge1xyXG4gICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IE1lc3NhZ2VzLlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnBheWxvYWQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIGlmKCF2YWxpZFJvb21JbnB1dCgpKSByZXR1cm5cclxuICAgICAgICAgICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBNZXNzYWdlcy5UT0JHX0NSRUFURV9ST09NX0lOX1RBQixcclxuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21OYW1lOiByb29tTmFtZUlucHV0LnZhbHVlLnRyaW0oKSwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJOYW1lOiBuYW1lSW5wdXQudmFsdWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCByZXNwID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgPT09IE1lc3NhZ2VzLlNVQ0NFU1MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2U6IFwiTWFpblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwLnBheWxvYWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZVBhZ2UoUGFnZS5tYWluLCB7IHJvb21JZDogcmVzcC5wYXlsb2FkLnJvb21JZCB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVNYWluVXNlcnMocmVzcC5wYXlsb2FkLnVzZXJzKVxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZXJyIGZvciBzb21lIHJlYXNvbiBjb3VsZG50IGNvbm5lY3QgdG8gc29ja2V0IHNlcnZlclxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0gZWxzZXtcclxuICAgICAgICAgICAgICAgIC8vbm8gdmlkZW8gb24gc2NyZWVuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvL2VyclxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcblxyXG5jb25zdCBjaGFuZ2VQYWdlID0gKHBhZ2U6IFBhZ2UsIGRldGFpbHMpID0+IHtcclxuICAgIGlmIChwYWdlID09PSBQYWdlLnN0YXJ0KSB7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFBhZ2VcIikuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5QYWdlXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJoZWFkZXJcIikuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcclxuICAgICAgICByb29tTmFtZUlucHV0LnZhbHVlID0gXCJcIlxyXG4gICAgICAgIG5hbWVJbnB1dC52YWx1ZSA9IFwiXCJcclxuICAgIH0gZWxzZSBpZiAocGFnZSA9PT0gUGFnZS5tYWluKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFBhZ2VcIikuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5QYWdlXCIpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJoZWFkZXJcIikuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYWluUGFnZSAucm9vbU5hbWVcIikuaW5uZXJIVE1MID0gIGAke25hbWVJbnB1dC52YWx1ZX1gXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyb29tSWRcIikuaW5uZXJIVE1MID0gYCR7ZGV0YWlscz8ucm9vbUlkfWBcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbi8vW3VzZXJ7dXNlck5hbWU6IHN0cmluZywgcm9vbUlkOiBzdHJpbmcsIHVzZXJJZDogc3RyaW5nfV1cclxuY29uc3QgdXBkYXRlTWFpblVzZXJzID0gKHVzZXJzKSA9PiB7XHJcbiAgICBsZXQgdXNlcnNDb250YWllbnIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21haW5QYWdlIC51c2Vyc1wiKVxyXG4gICAgdXNlcnMuZm9yRWFjaCh1c2VyID0+IHtcclxuICAgICAgICBsZXQgdXNlckVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiRElWXCIpXHJcbiAgICAgICAgdXNlckVsZW0uY2xhc3NMaXN0LmFkZChcInVzZXJFbGVtXCIpXHJcbiAgICAgICAgdXNlckVsZW0uaW5uZXJIVE1MID0gdXNlci51c2VyTmFtZVxyXG4gICAgICAgIHVzZXJzQ29udGFpZW5yLmFwcGVuZCh1c2VyRWxlbSlcclxuICAgIH0pO1xyXG59XHJcblxyXG5cclxuXHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==