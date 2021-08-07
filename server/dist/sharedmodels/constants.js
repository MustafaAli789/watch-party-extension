"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserChange = exports.VideoEvent = exports.RoomAction = exports.SocketEvents = void 0;
exports.SocketEvents = {
    JOIN: 'join',
    CREATED_ROOM: 'created_room',
    ROOM_DATA: 'room_data',
    JOINED_ROOM: 'joined_room',
    DISCONNECT: 'disconnect',
    USER_CHANGE: 'user_change',
    CONNECTION: 'connection',
    FORCE_DISCONNECT: 'force_disconnect',
    GET_ROOM_DATA: 'get_room_data',
    RECIEVE_ROOM_DATA: 'recieve_room_data',
    VIDEO_EVENT: 'video_event'
};
var RoomAction;
(function (RoomAction) {
    RoomAction[RoomAction["JOIN"] = 0] = "JOIN";
    RoomAction[RoomAction["CREATE"] = 1] = "CREATE";
})(RoomAction = exports.RoomAction || (exports.RoomAction = {}));
var VideoEvent;
(function (VideoEvent) {
    VideoEvent[VideoEvent["JOIN"] = 0] = "JOIN";
    VideoEvent[VideoEvent["PLAY"] = 1] = "PLAY";
    VideoEvent[VideoEvent["PAUSE"] = 2] = "PAUSE";
    VideoEvent[VideoEvent["SEEK"] = 3] = "SEEK";
    VideoEvent[VideoEvent["SPEED"] = 4] = "SPEED";
})(VideoEvent = exports.VideoEvent || (exports.VideoEvent = {}));
var UserChange;
(function (UserChange) {
    UserChange[UserChange["JOIN"] = 0] = "JOIN";
    UserChange[UserChange["DISCONNECT"] = 1] = "DISCONNECT";
})(UserChange = exports.UserChange || (exports.UserChange = {}));
//# sourceMappingURL=constants.js.map