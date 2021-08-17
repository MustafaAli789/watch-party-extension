import { Socket } from "socket.io-client"
import { SocketEvents } from "../sharedmodels/constants"
import { Message } from "../sharedmodels/message"
import { User } from "../sharedmodels/user"
import { Messages } from "./models/constants"
import { MessageObject } from "./models/messagepassing"

const getHourAndMinFormatted = (): string => {
    let curDate: Date = new Date()
    return `${curDate.getHours()}:${curDate.getMinutes()}:${curDate.getSeconds()}`
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
chatContainer.style.zIndex = "9999999999999"
var msgContentType: "IMG" | "MSG" = "MSG"
var msgContent: string = ""
document.querySelector('body').appendChild(chatContainer)

export const addNotif = (data: { headerMsg: string, bodyMsg: string, type: 'ERROR' | 'NOTIF' | 'SUCCESS' | 'SPECIAL' }) => {
    notifCount++
    let toast = document.createElement('DIV');
    toast.id = `toast${notifCount}`

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
            </div>
        </div>
    </div>`
    notifContainer.appendChild(toast)

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
export const createChatComponent = (roomName: string, socket: Socket, curUser: User) => {
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
        slideChatComponent()
    })

    let input: HTMLInputElement = document.querySelector('.input')
    input.addEventListener('keydown', (key: KeyboardEvent) => {
        if (key.code === 'Enter' && msgContent.length > 0) {
            sendMsg(socket, curUser)
            input.value = ""
            msgContent = ""
        }
    })
    input.addEventListener('input', e => {
        msgContent = input.value
    })
    document.querySelector('.sendButton').addEventListener('click', () => {
        if (msgContent.length > 0) {
            sendMsg(socket, curUser)
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
        console.log(JSON.stringify(items)); // might give you mime types
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
    minifyImg(imgSrc, 1080, null, (newUrl: string) => {
        msgContent = newUrl
    })
}

//https://stackoverflow.com/questions/14672746/how-to-compress-an-image-via-javascript-in-the-browser
var minifyImg = function(dataUrl,newWidth,imageType="image/jpeg",resolve,imageArguments=0.7){
    var image, oldWidth, oldHeight, newHeight, canvas, ctx, newDataUrl;
    image = new Image(); 
    image.src = dataUrl;
    image.onload = () => {
        oldWidth = image.width; oldHeight = image.height;
        if (oldWidth <= newWidth) {
            resolve(dataUrl);
        } else {
            newHeight = Math.floor(oldHeight / oldWidth * newWidth)

            canvas = document.createElement("canvas");
            canvas.width = newWidth; canvas.height = newHeight;
            ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, newWidth, newHeight);
            newDataUrl = canvas.toDataURL(imageType, imageArguments);
            resolve(newDataUrl);
        }
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

const sendMsg = (socket: Socket, curUser: User) => {
    let msg: Message = { user: curUser, type: msgContentType, content: msgContent, timestamp: getHourAndMinFormatted() }
    socket.emit(SocketEvents.TO_SERVER_TO_EXT_CHAT, msg)
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
                    message: Messages.TOBG_OPEN_IMG_IN_TAB,
                    payload: lastImg.src
                } as MessageObject<string>)
            })
        }
    })
    messagesContainer.scrollTop = messagesContainer.scrollHeight

}