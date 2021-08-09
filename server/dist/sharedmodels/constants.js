"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserChange = exports.VideoEvent = exports.RoomAction = exports.SocketEvents = void 0;
exports.SocketEvents = {
    JOIN: 'join',
    ROOM_DATA: 'room_data',
    DISCONNECT: 'disconnect',
    USER_CHANGE: 'user_change',
    CONNECTION: 'connection',
    FORCE_DISCONNECT: 'force_disconnect',
    GET_ROOM_DATA: 'get_room_data',
    RECIEVE_ROOM_DATA: 'recieve_room_data',
    VIDEO_EVENT: 'video_event',
    SYNC_VIDEO: 'sync_video'
};
var RoomAction;
(function (RoomAction) {
    RoomAction[RoomAction["JOIN"] = 0] = "JOIN";
    RoomAction[RoomAction["CREATE"] = 1] = "CREATE";
})(RoomAction = exports.RoomAction || (exports.RoomAction = {}));
var VideoEvent;
(function (VideoEvent) {
    VideoEvent[VideoEvent["JOIN"] = 0] = "JOIN";
    VideoEvent[VideoEvent["SYNC"] = 1] = "SYNC";
    VideoEvent[VideoEvent["PLAY"] = 2] = "PLAY";
    VideoEvent[VideoEvent["PAUSE"] = 3] = "PAUSE";
    VideoEvent[VideoEvent["SEEK"] = 4] = "SEEK";
    VideoEvent[VideoEvent["SPEED"] = 5] = "SPEED";
})(VideoEvent = exports.VideoEvent || (exports.VideoEvent = {}));
var UserChange;
(function (UserChange) {
    UserChange[UserChange["JOIN"] = 0] = "JOIN";
    UserChange[UserChange["DISCONNECT"] = 1] = "DISCONNECT";
})(UserChange = exports.UserChange || (exports.UserChange = {}));
//# sourceMappingURL=constants.js.map