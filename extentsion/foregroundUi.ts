
import { Message } from "../sharedmodels/message"
import { Room } from "../sharedmodels/room"
import { User } from "../sharedmodels/user"
import { Messages } from "./models/constants"
import { MessageObject } from "./models/messagepassing"
import { NotifDataInterface, NotifActionButtonInterface } from "./models/Miscellaneous"

const getHourAndMinFormatted = (): string => {
    let curDate: Date = new Date()
    return `${curDate.getHours()}:${curDate.getMinutes()}:${curDate.getSeconds()}`
}

interface AdminVideoData {
    curTime: number,
    vidDuration: number,
    vidPaused: Boolean,
    vidBuffering: Boolean
}

// Notif Container
var notifContainer = document.createElement('DIV')
notifContainer.id = "notifContainer"
notifContainer.classList.add('toast-container', 'position-fixed', 'bottom-0', 'end-0', 'p-3')
document.querySelector('body').appendChild(notifContainer)
var notifCount = 0

// Chat Container
var chatContainer = document.createElement('DIV')
chatContainer.id = "chatContainer"
chatContainer.classList.add('removeFromView')
chatContainer.style.zIndex = "999"
var msgContentType: "IMG" | "MSG" = "MSG"
var msgContent: string = ""
document.querySelector('body').appendChild(chatContainer)

var floatingMenuCurrentlyPressed = false
var floatingMenuBeingDragged = false
var floatingMenuActive= false

export const addNotif = (data: NotifDataInterface, actionButtonData?: NotifActionButtonInterface) => {
    notifCount++
    let toast = document.createElement('DIV');
    toast.id = `toast${notifCount}`

    let actionButtonContent = actionButtonData?.buttonContent
    let actionButtonContainer = `
        <div class="notifActionBtnContainer" style="display: flex; margin-top: 5px">
            <button type="button" class="notifActionBtn" aria-label="${actionButtonContent}">${actionButtonContent}</button>
        </div>
    `

    let color = data.type === 'ERROR' ? 'red' : (data.type === 'NOTIF' ? 'blue' : (data.type === 'SPECIAL' ? 'purple' : 'green'))
    toast.innerHTML = `<div style="z-index: 9999" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" style="display: block">
            <div class="toast-header">
                <div class="rounded me-2" style="width: 25px;height: 25px;background-color: ${color}"></div>
                <strong class="me-auto" style="font-size: 20px;color: ${color}">${data.headerMsg}</strong>
                <button type="button" class="btn-close" aria-label="Close"></button>
            </div>
            <div class="toast-body" style="font-size: 15px;">
                ${data.bodyMsg}
                ${actionButtonData ? actionButtonContainer : ""}
            </div>
        </div>
    </div>`
    notifContainer.appendChild(toast)

    if (actionButtonData) {
        toast.querySelector('.notifActionBtnContainer').addEventListener('click', () => {
            actionButtonData.buttonAction()
        })
    }

    let notifCloseTimeout = setTimeout(() => {
        removeNotif(toast.id)
    }, 3000)
    toast.querySelector('button').addEventListener('click', () => {
        clearTimeout(notifCloseTimeout)
        removeNotif(toast.id)
    })
}
const removeNotif = (toastId: string) => {
    let toast = document.getElementById(toastId)
    toast.parentElement.removeChild(toast)
    notifCount--
}

// inspo https://stackoverflow.com/questions/21426056/horizontal-sliding-panel-with-relative-postion-handle-show-hide-jquery
export const createChatComponent = (roomName: string, curUser: User, sendMsg: Function, toggleChat: Function) => {
    chatContainer.innerHTML = `<div class="panel" style="background-color:white;">
        <div class="infoBar">
            <div class="leftInnerContainer">
                <div class="roomCircle"></div>
                <h1 id="roomName" style="font-size:25px; word-break: break-all;">${roomName}</h1>
            </div>
            <div class="rightInnerContainer">
                <a href="/">X</a>
            </div>
        </div>
        <div class="messages"></div>
        <div class="mainInputContainer">
            <div class="inputField">
                <form class="form">
                    <input id="watchPartyChatInput" class="input" type="text" placeholder="Type a message...">
                </form>
                <div id="imgContainer" class="removeFromView">
                    <div class="imageChatMessage">
                        <img src="" />
                        <button class="removeImageButton">X</button>
                    </div>
                </div>
            </div>
            <div class="buttonsContainer">
                <button class="sendButton">Send</button>
            </div>
        </div>
    </div>
    <div id="sliderContainer">
  	    <div id="notifs">0</div>
  	    <a href="javascript:void(0);" class="slider-arrow show">&laquo;</a>
    </div>`

    let sliderArrow = document.querySelector(".slider-arrow")
    sliderArrow.addEventListener('click', () => {
        slideChatComponent()
    })

    document.querySelector(".rightInnerContainer a").addEventListener('click', (e) => {
        e.preventDefault()
        toggleChat()
        updateInScreenFloatingMenu(null, null, false)
    })

    let input: HTMLInputElement = document.querySelector('.input')
    input.addEventListener('keydown', (key: KeyboardEvent) => {
        if (key.code === 'Enter' && msgContent.length > 0) {
            sendMessage(sendMsg, curUser)
            input.value = ""
            msgContent = ""
        }
    })
    input.addEventListener('input', e => {
        msgContent = input.value
    })
    document.querySelector('.sendButton').addEventListener('click', () => {
        if (msgContent.length > 0) {
            sendMessage(sendMsg, curUser)
            input.value = ""
            msgContent = ""
            removeChatImageInInput()
        }
    })

    document.querySelector('.form').addEventListener('submit', e => {
        e.preventDefault()
    })

    document.querySelector(".removeImageButton").addEventListener('click', () => {
        removeChatImageInInput()
    })

    // https://stackoverflow.com/questions/6333814/how-does-the-paste-image-from-clipboard-functionality-work-in-gmail-and-google-c
    document.onpaste = function (event) {
        if (document.activeElement.id !== "watchPartyChatInput") return
        
        var items = (event.clipboardData).items;
        let lastItem = items[items.length-1]
        if (lastItem.kind === 'file' && lastItem.type === "image/png") {
            var blob = lastItem.getAsFile();
            var reader = new FileReader();
            reader.onload = function (event) {
                showChatImageInInput(event.target.result.toString())
            }; 
            reader.readAsDataURL(blob);
        } else {
            msgContent = event.clipboardData.getData('text')
        }
    };

}

const showChatImageInInput = (imgSrc: string) => {
    let imgContainer: HTMLDivElement = document.querySelector("#imgContainer")
    msgContent = ""

    if (msgContentType === "MSG") {
        msgContentType = "IMG"
        imgContainer.classList.remove('imageContainer')
        imgContainer.classList.remove('removeFromView')
        imgContainer.classList.add('imageContainer')
        document.querySelector(".form").classList.add('removeFromView')
    }

    imgContainer.querySelector("img").src = imgSrc
    minifyImg(imgSrc, 2000, "image/jpeg", (newUrl: string) => {
        msgContent = newUrl
    })
}

//https://stackoverflow.com/questions/14672746/how-to-compress-an-image-via-javascript-in-the-browser
var minifyImg = function(dataUrl,maxWidth,imageType="image/jpeg",resolve,imageArguments=0.9){
    var image, oldWidth, oldHeight, newHeight, newWidth, canvas, ctx, newDataUrl;
    image = new Image(); 
    image.src = dataUrl;
    image.onload = () => {
        oldWidth = image.width; oldHeight = image.height;

        newHeight = oldWidth <= maxWidth ? oldHeight : Math.floor(oldHeight / oldWidth * maxWidth)
        newWidth = Math.min(oldWidth, maxWidth)

        canvas = document.createElement("canvas");
        canvas.width = newWidth; canvas.height = newHeight;
        ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, newWidth, newHeight);
        newDataUrl = canvas.toDataURL(imageType, imageArguments);
        resolve(newDataUrl);
    }
  };

const removeChatImageInInput = () => {
    msgContentType = "MSG"

    let imgContainer: HTMLDivElement = document.querySelector("#imgContainer")

    imgContainer.classList.remove('imageContainer')
    imgContainer.classList.remove('removeFromView')
    imgContainer.classList.add('imageContainer')
    imgContainer.classList.add('removeFromView')

    document.querySelector(".form").classList.remove('removeFromView')

    imgContainer.querySelector("img").src = ""
    msgContent = ""
}

const sendMessage = (sendMsg: Function, curUser: User) => {
    let msg: Message = { user: curUser, type: msgContentType, content: msgContent, timestamp: getHourAndMinFormatted() }
    sendMsg(msg)
    updateChat([msg], curUser)
}

const slideChatComponent = () => {
    let sliderArrow = document.querySelector(".slider-arrow")
    if (sliderArrow.classList.contains('show')) { //opening
        (<HTMLDivElement>document.querySelector(".panel")).style.right = "0px";
        (<HTMLDivElement>document.querySelector("#sliderContainer")).style.right = "400px";
        sliderArrow.innerHTML = '&raquo;'
        sliderArrow.classList.remove('show')
        sliderArrow.classList.add('hide')

        let chatNotifIndicator: HTMLDivElement = document.querySelector('#notifs')
        chatNotifIndicator.classList.add('removeFromView')
        chatNotifIndicator.innerHTML = "0"

    } else { //closing
        (<HTMLDivElement>document.querySelector(".panel")).style.right = "-400px";
        (<HTMLDivElement>document.querySelector("#sliderContainer")).style.right = "0px";
        sliderArrow.innerHTML = '&laquo;'
        sliderArrow.classList.remove('hide')
        sliderArrow.classList.add('show')
    }
}

export const toggleChatComponentContainerInView = (open: Boolean) => {
    if (open) {
        chatContainer.classList.remove('removeFromView')
    } else {
        chatContainer.classList.add('removeFromView')
    }
}

export const deleteChatComponent = () => {
    let panel = document.querySelector('.panel')
    let sliderContainer = document.querySelector('#sliderContainer')
    panel.parentElement.removeChild(panel)
    sliderContainer.parentElement.removeChild(sliderContainer)
}

export const updateChat = (messages: Message[], curUser: User) => {

    //i.e chat panel is closed and u recieved message/messages
    if(document.querySelector(".slider-arrow").classList.contains('show')) {
        let chatNotifIndicator: HTMLDivElement = document.querySelector('#notifs')
        chatNotifIndicator.classList.remove('removeFromView')

        let curNotifCount: number = parseInt(chatNotifIndicator.innerHTML)
        curNotifCount += messages.length
        chatNotifIndicator.innerHTML = curNotifCount.toString()
    }

    let messagesContainer: HTMLDivElement = document.querySelector('.messages')
    messages.forEach(msg => {

        let msgContentElem: string = ""
        if (msg.type === "IMG") {
            msgContentElem = `<img src="${msg.content}" style="width: 100%; height:100%; border-radius:20px; cursor: pointer">`
        } else {
            msgContentElem = `<p class="messageText" style="color: ${curUser.userId === msg.user?.userId ? 'white' : '#353535'};">${msg.content}</p>`
        }

        if (curUser.userId === msg.user?.userId) { //cur user msg
            messagesContainer.innerHTML += ` 
                <div class="message" style="margin-top: 1rem;">
                    <div class='container'>
                        <div class="row">
                            <div class="col-11 pr-2 d-flex justify-content-end">
                                <p class='sentText mb-0'>${msg.user.userName}</p>
                            </div>
                            <div class="col-1"></div>
                        </div>
                        <div class="row">
                            <div class="col-11 d-flex align-items-end justify-content-end" style="padding-right: 0;">
                                <div class='messageBox backgroundBlue'>
                                    ${msgContentElem}
                                </div> 
                            </div>
                            <div class="col-1 d-flex align-items-end justify-content-center" style="padding:0;">
                                <div class="profileImage" title="${msg.timestamp}" style="background-color:${msg.user.color};"></div>
                            </div>
                        </div> 
                    </div>
                </div>
            `
        } else { //automated msg or other user msg
            let bgColor = msg.user === null ? 'backgroundAutomated' : 'backgroundLight'
            let profileImgColor = msg.user === null ? 'black' : msg.user.color
            let username = msg.user === null ? 'roombot' : msg.user.userName
            messagesContainer.innerHTML += ` 
                <div class="message" style="margin-top: 1rem;">
                    <div class="container">
                        <div class="row">
                            <div class="col-1"></div>
                            <div class="col-11 pl-2 pr-0">
                                <p class="sentText mb-0">${username}</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-1 d-flex align-items-end justify-content-center" style="padding:0;">
                                <div class="profileImage" title="${msg.timestamp}" style="background-color:${profileImgColor};"></div>
                            </div>
                            <div class="col-11 d-flex align-items-end" style="padding-left: 0;">
                                <div class="messageBox ${bgColor}">
                                    ${msgContentElem}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        }

        if (msg.type === "IMG") {
            let allImages: NodeListOf<HTMLImageElement> = document.querySelectorAll(".messages img")
            let lastImg: HTMLImageElement = allImages[allImages.length-1]
            lastImg.addEventListener('click', () => {
                chrome.runtime.sendMessage({
                    message: Messages.TOBG_OPEN_TAB_WITH_URL,
                    payload: lastImg.src
                } as MessageObject<string>)
            })
        }
    })
    messagesContainer.scrollTop = messagesContainer.scrollHeight

}

export const deleteFloatingMenuComponent = () => {
    let floatingMenuContainer: HTMLDivElement = <HTMLDivElement>document.getElementById("floatingMenuContainer")
    floatingMenuContainer.parentElement.removeChild(floatingMenuContainer)
}   

export const createInScreenFloatingMenu = (roomName: String, curRoomUsers: Array<User>, leaveRoom: Function, sync: Function, toggleChat: Function, requestAdminTime: Function) => {

    // Floating Draggable Menu 
    let floatingMenuContainer: HTMLDivElement = <HTMLDivElement>document.createElement("DIV")
    floatingMenuContainer.innerHTML = "<div id='floatingMenuCircle' class='floatingMenuCircleInactive'>☰</div><div id='floatingMenuBlock' class='removeFromView'></div>"
    floatingMenuContainer.id = "floatingMenuContainer"
    floatingMenuContainer.classList.add('removeFromView')
    floatingMenuContainer.style.zIndex = "9999"
    document.querySelector('body').appendChild(floatingMenuContainer)

    let floatingMenuBlock: HTMLDivElement = floatingMenuContainer.querySelector("#floatingMenuBlock")
    let curUser: User = curRoomUsers.find(user => user.current)
    
    let curUserOffsetTime = new Date(curUser.offsetTime * 1000).toISOString().substr(11, 8)
    let adminTimeContainer = `
        <div id="timerContainer">
            <div class="adminTimerContainer ${curUser.admin ? 'removeFromView': ''}">
                <div id="loadingBar"></div>
                <img id="userIcon" src='${chrome.runtime.getURL('images/adminUser.png')}' alt='adminuser' title="Admin">
                <span id="adminTime">00:11:04/00:25:15</span>
                <span id="adminVidPlaying">⏩︎</span>
            </div>
            <span id="offsetSubtext" style="color: black">Offset: ${curUserOffsetTime}</span>
        </div>
    `
    floatingMenuBlock.innerHTML = `
        <div class="head">
            <img src="${chrome.runtime.getURL('images/icon-32x32.png')}" alt="watchparty">
            <h5><span style="color: white">Room </span>${roomName}</h5>
        </div>
        ${adminTimeContainer}
        <div class="actionBtnContainer">
            <div class="firstRowBtns" style="margin-bottom: 5px">
                <button id="syncBtn" class="${curRoomUsers.length == 1 ? 'disabledBtn':''}">Sync</button>
                <button id="chatToggleBtn" class="toggledBtn">Toggle Chat</button>
            </div>
            <button id="leaveRoomBtn">Leave Room</button>
        </div>
    `

    let chatToggleBtn: HTMLButtonElement = floatingMenuBlock.querySelector("#chatToggleBtn")
    let syncBtn: HTMLButtonElement = floatingMenuBlock.querySelector("#syncBtn")
    let leaveRoomBtn: HTMLButtonElement = floatingMenuBlock.querySelector("#leaveRoomBtn")
    leaveRoomBtn.addEventListener("click", () => {
        leaveRoom()
    })
    syncBtn.addEventListener('click', () => {
        if (!syncBtn.classList.contains('disabledBtn')) {
            sync()
        }
    })
    chatToggleBtn.addEventListener('click', () => {
        toggleChat()
        if (chatToggleBtn.classList.contains('toggledBtn')) {
            chatToggleBtn.classList.remove('toggledBtn')
        } else {
            chatToggleBtn.classList.add('toggledBtn')
        }
    })

    setUpFloatingMenuMovement(floatingMenuContainer, requestAdminTime, curUser.admin)
}

export const updateInScreenFloatingMenu = (adminVideoData?: AdminVideoData, roomData?: Room, chatOpen?: Boolean ) => {
    //room data --> check offset of cur user, if cur user is admin, num of users
    
    if (!!roomData) {
        let syncBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById("syncBtn")
        let offsetSubtext: HTMLSpanElement = document.getElementById("offsetSubtext")
        let timerContainer: HTMLDivElement = <HTMLDivElement>document.querySelector("#timerContainer")
        let curUser: User = roomData.users.find(user => user.current)
        let curUserOffsetTime = new Date(curUser.offsetTime * 1000).toISOString().substr(11, 8)
        
        if (roomData.users.length === 1) {
            syncBtn.classList.add('disabledBtn')
        } else {
            syncBtn.classList.remove('disabledBtn')
        }
        if (curUser.admin) {
            timerContainer.classList.add('removeFromView')
        } else {
            timerContainer.classList.remove('removeFromView')
            offsetSubtext.innerHTML = `Offset: ${curUserOffsetTime}`
        }
    }

    if (chatOpen !== null) {
        let chatToggleBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById("chatToggleBtn")
        if (chatOpen) {
            chatToggleBtn.classList.add('toggledBtn')
        } else {
            chatToggleBtn.classList.remove('toggledBtn')
        }
    }

    if (!!adminVideoData) {
        let loadingBar: HTMLDivElement = <HTMLDivElement>document.getElementById("loadingBar")
        let adminTime: HTMLSpanElement = document.getElementById("adminTime")
        let adminVidPlaying: HTMLSpanElement = document.getElementById("adminVidPlaying")

        loadingBar.style.width = `${(adminVideoData.curTime/adminVideoData.vidDuration)*100}%`

        let curTimeFormatted = new Date(adminVideoData.curTime * 1000).toISOString().substr(11, 8)
        let vidLengthFormatted = new Date(adminVideoData.vidDuration * 1000).toISOString().substr(11, 8)
        adminTime.innerHTML = `${curTimeFormatted}/${vidLengthFormatted}`
        adminVidPlaying.innerHTML = adminVideoData.vidBuffering ? "⌛" : (adminVideoData.vidPaused ? "⏸︎" : "⏩︎")
        adminVidPlaying.title = adminVideoData.vidBuffering ? "Buffering" : (adminVideoData.vidPaused ? "Paused" : "Playing")
    }
    
}

const setUpFloatingMenuMovement = (floatingMenuContainer: HTMLDivElement, requestAdminTime: Function, curUserAdmin: Boolean) => {
    let floatingMenuCircle: HTMLDivElement = floatingMenuContainer.querySelector("#floatingMenuCircle")
    let floatingMenuBlock: HTMLDivElement = floatingMenuContainer.querySelector("#floatingMenuBlock")
    let reqAdminTimeInterval;
    floatingMenuContainer.classList.remove('removeFromView')

    floatingMenuCircle.addEventListener('click', () => {
        if (floatingMenuBeingDragged) {
            return
        }
        if (!floatingMenuActive) {
            floatingMenuActive = true
            floatingMenuCircle.classList.add('floatingMenuCircleActive')
            floatingMenuBlock.classList.remove('removeFromView')

            if (!curUserAdmin) {
                reqAdminTimeInterval = setInterval(() => {
                    requestAdminTime()
                }, 1000)
            }
        } else {
            floatingMenuActive = false
            floatingMenuBlock.classList.add('removeFromView')
            floatingMenuCircle.classList.remove('floatingMenuCircleActive')

            if (!curUserAdmin) {
                clearInterval(reqAdminTimeInterval)
            }
        }
    })
    floatingMenuCircle.addEventListener('mousedown', () => {
        floatingMenuCurrentlyPressed = true
    })
    floatingMenuCircle.addEventListener('mouseup', () => {
        floatingMenuCurrentlyPressed = false
        if (floatingMenuBeingDragged) {
            setTimeout(() => {
                floatingMenuBeingDragged = false
            }, 100)
        }
        
    })
    document.addEventListener('mousemove', (e) => {
        if (floatingMenuCurrentlyPressed) {
            floatingMenuBeingDragged = true
            floatingMenuContainer.style.top = `${e.clientY-17}px` //17 is circles radius
            floatingMenuContainer.style.left = `${e.clientX-17}px`
            if (e.clientX < 200) { //to rotate the dir the menu block comes out of of it too close to left edge
                floatingMenuBlock.style.left = "20px"
            } else {
                floatingMenuBlock.style.left = "auto"
            }
        }
    })
}