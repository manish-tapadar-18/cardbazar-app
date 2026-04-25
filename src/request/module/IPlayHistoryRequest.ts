export interface IPlayHistorySearchField {
    FIELD_NAME: string;
    FIELD_VALUE: string;
    OPT: string;
}

export interface IPlayHistorySortFilter {
    FIELD_NAME: string;
    SORT_ORDER: 'ASC' | 'DESC';
}

export interface IPlayHistoryFilters {
    search: IPlayHistorySearchField[];
    sortFilter: IPlayHistorySortFilter;
}

export interface IPlayHistoryRequest {
    filters: IPlayHistoryFilters;
}
