export interface ITransactionItem {
    ID: string;
    USER_ID: string;
    REQUEST_ID: string | null;
    WITHDRAWAL_ID: string | null;
    GAME_PLAY_ID: string | null;
    TYPE: string;
    AMOUNT: number;
    CURRENT_BALANCE: number;
    DESCRIPTION: string;
    STATUS: string;
    DATE: string;
    CREATED_AT: string;
    UPDATED_AT: string;
    CREATED_BY: string;
    UPDATED_BY: string | null;
    TRANSACTION_ID: string | null;
    AUTO_INC: number;
    MANUAL_TRANSACTION: number;
    MANUAL_TRANSACTION_SECONDARY: number;
    USER_FIRST_NAME: string;
    USER_LAST_NAME: string;
    USER_EMAIL: string;
    USER_MOBILE: string;
    GAME_TYPE_NAME: string | null;
    GAME_CATEGORY_NAME: string | null;
    GAME_MASTER_SCHEDULE_NAME: string | null;
    CREATED_BY_FIRST_NAME: string | null;
    CREATED_BY_LAST_NAME: string | null;
    UPDATED_BY_FIRST_NAME: string | null;
    UPDATED_BY_LAST_NAME: string | null;
    GAME_NUMBER_3: string | null;
    GAME_NUMBER_2: string | null;
    GAME_NUMBER_1: string | null;
    GAME_NUMBER: number | null;
    GAME_MASTER_SCHEDULE_ID: string | null;
    GAME_TYPE: string | null;
    GAME_CATEGORY: string | null;
    WIN_NUMBER: string | null;
    WIN_AMOUNT: number | null;
}

export interface ITransactionResponse {
    DATA: ITransactionItem[];
    TOTAL: number;
}
