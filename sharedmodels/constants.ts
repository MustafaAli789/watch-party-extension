export const SocketEvents = {
    TO_SERVER_JOIN: 'join',
    TO_EXT_ROOM_DATA: 'room_data',
    SERVER_DISCONNECT: 'disconnect',
    TO_EXT_USER_CHANGE: 'user_change',
    SERVER_CONNECTION: 'connection',
    TO_SERVER_FORCE_DISCONNECT: 'force_disconnect',
    TO_SERVER_ROOM_DATA: 'get_room_data',
    TO_EXT_RECIEVE_ROOM_DATA: 'recieve_room_data',
    TO_SERVER_TO_EXT_VIDEO_EVENT: 'video_event',
    TO_SERVER_TO_EXT_SYNC_VIDEO: 'sync_video',
    TO_SERVER_TO_EXT_CHAT: 'send_chat_message'
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