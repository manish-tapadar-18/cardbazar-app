export interface IPlayHistoryItem {
    ID: string;
    USER_ID: string;
    GAME_MASTER_SCHEDULE_ID: string;
    GAME_TYPE: string;
    GAME_CATEGORY: string;
    AMOUNT: number;
    GAME_NUMBER: number | null;
    GAME_NUMBER_1: string | null;
    GAME_NUMBER_2: string | null;
    GAME_NUMBER_3: string | null;
    WIN_AMOUNT: number | null;
    WIN_NUMBER: number | null;
    WIN_NUMBER_1: string | null;
    WIN_NUMBER_2: string | null;
    WIN_NUMBER_3: string | null;
    WIN: number;
    RESULT_PUBLISH: number;
    STATUS: string;
    DATE: string;
    CREATED_AT: string;
    UPDATED_AT: string;
    CREATED_BY: string;
    UPDATED_BY: string | null;
    USER_TRANSACTION: number;
    SUB_TYPE: string;
    USER_FIRST_NAME: string;
    USER_LAST_NAME: string;
    USER_EMAIL: string;
    USER_MOBILE: string;
    GAME_TYPE_NAME: string;
    GAME_CATEGORY_NAME: string;
    GAME_MASTER_SCHEDULE_NAME: string;
    START_TIME: string;
    END_TIME: string;
    RESULT_TIME: string;
    CREATED_BY_FIRST_NAME: string | null;
    CREATED_BY_LAST_NAME: string | null;
    UPDATED_BY_FIRST_NAME: string | null;
    UPDATED_BY_LAST_NAME: string | null;
    CARD_NAME: string;
    CARD_IMAGE_URL: string;
}

export interface IPlayHistoryResponse {
    DATA: IPlayHistoryItem[];
    TOTAL: number;
}
