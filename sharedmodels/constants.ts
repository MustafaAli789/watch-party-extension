export const SocketEvents = {
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
}


export enum RoomAction {
    JOIN,
    CREATE
}