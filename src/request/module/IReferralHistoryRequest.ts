export interface IReferralHistoryRequest {
    filters: {
        search: Array<{
            FIELD_NAME: string;
            FIELD_VALUE: string;
            OPT: string;
        }>;
        sortFilter: {
            FIELD_NAME: string;
            SORT_ORDER: 'ASC' | 'DESC';
        };
    };
}
