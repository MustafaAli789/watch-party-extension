export const SocketEvents = {
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