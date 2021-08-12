import { Socket } from "socket.io-client"
import { SocketEvents } from "../sharedmodels/constants"
import { Message } from "../sharedmodels/message"
import { User } from "../sharedmodels/user"

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
                <h1 id="roomName">${roomName}</h1>
            </div>
            <div class="rightInnerContainer">
                <a href="/">X</a>
            </div>
        </div>
        <div class="messages"></div>
        <div class="mainInputContainer">
            <div class="inputField">
                <form class="form">
                    <input class="input" type="text" placeholder="Type a message...">
                </form>
            </div>
            <div class="buttonsContainer">
                <button class="sendButton">Send</button>
            </div>
        </div>
    </div>
    <div id="sliderContainer">
  	    <div id="notifs">99</div>
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
        if (key.code === 'Enter' && input.value.trim().length > 0) {
            sendMsg(socket, curUser, input.value)
            input.value = ""
        }
    })
    document.querySelector('.sendButton').addEventListener('.click', () => {
        if (input.value.trim().length > 0) {
            sendMsg(socket, curUser, input.value)
            input.value = ""
        }
    })

    document.querySelector('.form').addEventListener('submit', e => {
        e.preventDefault()
    })

}

const sendMsg = (socket: Socket, curUser: User, content: string) => {
    let msg: Message = { user: curUser, content: content, timestamp: getHourAndMinFormatted() }
    socket.emit(SocketEvents.TO_SERVER_TO_EXT_CHAT, msg)
    updateChat([msg], curUser)
}

const slideChatComponent = () => {
    let sliderArrow = document.querySelector(".slider-arrow")
    if (sliderArrow.classList.contains('show')) {
        (<HTMLDivElement>document.querySelector(".panel")).style.right = "0px";
        (<HTMLDivElement>document.querySelector("#sliderContainer")).style.right = "400px";
        sliderArrow.innerHTML = '&raquo;'
        sliderArrow.classList.remove('show')
        sliderArrow.classList.add('hide')
    } else {
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
    let messagesContainer: HTMLDivElement = document.querySelector('.messages')
    messages.forEach(msg => {
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
                                    <p class="messageText" style="color: white;">${msg.content}</p>
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
                                    <p class="messageText" style="color: #353535;">${msg.content}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        }
    })
    messagesContainer.scrollTop = messagesContainer.scrollHeight

}