export interface IReferralHistoryItem {
    ID: string;
    JOINED_USER_ID: string;
    REFERRED_USER_ID: string;
    AMOUNT: number;
    STATUS: string;
    CREATED_AT: string;
    UPDATED_AT: string;
    JOINED_FIRST_NAME: string;
    JOINED_LAST_NAME: string;
    JOINED_MOBILE: string;
    REFERRED_FIRST_NAME: string;
    REFERRED_LAST_NAME: string;
    REFERRED_MOBILE: string;
}

export interface IReferralHistoryResponse {
    DATA: IReferralHistoryItem[];
    TOTAL: number;
}
