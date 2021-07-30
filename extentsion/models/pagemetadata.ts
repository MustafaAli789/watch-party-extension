import { Page } from "./constants";

export interface PageMetadata {
    roomName: string,
    roomId: string | null,
    pageType: Page
}