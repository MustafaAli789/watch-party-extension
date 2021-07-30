"use strict";
exports.__esModule = true;
exports.RoomAction = exports.SocketEvents = void 0;
exports.SocketEvents = {
    JOIN: 'join',
    CREATED_ROOM: 'created_room',
    ROOM_DATA: 'room_data',
    JOINED_ROOM: 'joined_room',
    DISCONNECT: 'disconnect',
    USER_DISCONNECTED: 'user_disconnected',
    USER_CONNECTED: 'user_connected',
    CONNECTION: 'connection',
    FORCE_DISCONNECT: 'force_disconnect',
    GET_ROOM_DATA: 'get_room_data',
    RECIEVE_ROOM_DATA: 'recieve_room_data'
};
var RoomAction;
(function (RoomAction) {
    RoomAction[RoomAction["JOIN"] = 0] = "JOIN";
    RoomAction[RoomAction["CREATE"] = 1] = "CREATE";
})(RoomAction = exports.RoomAction || (exports.RoomAction = {}));
