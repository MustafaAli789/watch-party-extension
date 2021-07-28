export enum Page{
    start,
    main
}

export enum Messages{
    TOBG_VIDEO_ON_SCREEN,
    SUCCESS,
    FAILURE,
    TOBG_CREATE_ROOM_IN_TAB,
    TOFG_VIDEO_ON_SCREEN,
    TOFG_CREATE_ROOM_IN_TAB,
    TOBG_DISCONNECT,
    TOFG_DISCONNECT
}

export const TabsStorage = "active_tabs_watchparty"
export const PageStorage = "page_watchparty"
