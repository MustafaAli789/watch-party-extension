import { Page } from "./constants";

export interface PageMetadata {
    roomName: string,
    roomId: string | null,
    pageType: Page
}

export interface NotifDataInterface {
    headerMsg: string;
    bodyMsg: string;
    type: 'ERROR' | 'NOTIF' | 'SUCCESS' | 'SPECIAL';
}
export interface NotifActionButtonInterface {
    buttonContent: string,
    buttonAction: Function
}