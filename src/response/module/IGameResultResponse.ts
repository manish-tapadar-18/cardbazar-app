export interface IResultScheduleDetail {
    ID: string;
    GAME_MASTER_SCHEDULE_ID: string;
    NAME: string;
    START_TIME: string;
    END_TIME: string;
    RESULT_TIME: string;
    STATUS: string;
    RESULT_PUBLISH: number;
    GAME_WIN_NUMBER: number | null;
    GAME_WIN_NUMBER_1: number | null;
    GAME_WIN_NUMBER_2: number | null;
    GAME_WIN_NUMBER_3: number | null;
    RESULT_PUBLISH_TIME: string | null;
    GAME_INDEX: number;
    RESULT_PUBLISH_JORI: number;
    USER_TRANSACTION: number;
    CARD_NAME: string | null;
    CARD_IMAGE_URL: string | null;
    CREATED_BY_FIRST_NAME: string;
    CREATED_BY_LAST_NAME: string;
    UPDATED_BY_FIRST_NAME: string | null;
    UPDATED_BY_LAST_NAME: string | null;
}

export interface IGameResultItem {
    ID: string;
    CATEGORY_ID: string;
    NAME: string;
    INTERVAL_TIME: number;
    GAME_DATE: string;
    STATUS: string;
    CREATED_AT: string;
    UPDATED_AT: string;
    CREATED_BY: string;
    UPDATED_BY: string | null;
    CATEGORY_NAME: string;
    CREATED_BY_FIRST_NAME: string;
    CREATED_BY_LAST_NAME: string;
    UPDATED_BY_FIRST_NAME: string | null;
    UPDATED_BY_LAST_NAME: string | null;
    GT: string;
    OB: number;
    SCHEDULE_DETAILS: IResultScheduleDetail[];
}

export interface IFormattedResultItem {
    GAME_DATE: string;
    GAME_NAME: string;
    DATA: IResultScheduleDetail[];
}

export interface IGameResultResponse {
    DATA: IGameResultItem[];
    TOTAL: number;
}
