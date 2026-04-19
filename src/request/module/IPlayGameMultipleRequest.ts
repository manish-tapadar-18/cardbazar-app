export interface IPlayGameDataItem {
    GAME_NUMBER: string;
    AMOUNT: string;
}

export interface IPlayGameMultipleRequest {
    GAME_MASTER_SCHEDULE_ID: string;
    GAME_TYPE: string;
    USER_ID: string;
    GAME_CATEGORY: string;
    DATA: IPlayGameDataItem[];
    SUB_TYPE: string;
}
