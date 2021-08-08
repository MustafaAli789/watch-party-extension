export const SocketEvents = {
    JOIN: 'join',
    CONNECTED_TO_ROOM: 'connected_to_room',
    ROOM_DATA: 'room_data',
    DISCONNECT: 'disconnect',
    USER_CHANGE: 'user_change',
    CONNECTION: 'connection',
    FORCE_DISCONNECT: 'force_disconnect',
    GET_ROOM_DATA: 'get_room_data',
    RECIEVE_ROOM_DATA: 'recieve_room_data',
    VIDEO_EVENT: 'video_event'
}


export enum RoomAction {
    JOIN,
    CREATE
}

export enum VideoEvent {
    JOIN,
    PLAY,
    PAUSE,
    SEEK,
    SPEED
}

export enum UserChange{
    JOIN,
    DISCONNECT
}