
export interface Tab {
    channelOpen: boolean,
    active: boolean,
    id: number
}

export interface Tabs {
    tabs: Array<Tab>
}