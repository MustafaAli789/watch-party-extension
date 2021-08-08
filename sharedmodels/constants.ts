export const SocketEvents = {
    JOIN: 'join',
    ROOM_DATA: 'room_data',
    DISCONNECT: 'disconnect',
    USER_CHANGE: 'user_change',
    CONNECTION: 'connection',
    FORCE_DISCONNECT: 'force_disconnect',
    GET_ROOM_DATA: 'get_room_data',
    RECIEVE_ROOM_DATA: 'recieve_room_data',
    VIDEO_EVENT: 'video_event',
    SYNC_VIDEO_TO_ADMIN: 'sync_video_to_admin'
}


export enum RoomAction {
    JOIN,
    CREATE
}

export enum VideoEvent {
    JOIN,
    SYNC,
    PLAY,
    PAUSE,
    SEEK,
    SPEED
}

export enum UserChange{
    JOIN,
    DISCONNECT
}