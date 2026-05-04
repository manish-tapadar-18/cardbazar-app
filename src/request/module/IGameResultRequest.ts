export interface IGameResultSearchField {
    FIELD_NAME: string;
    FIELD_VALUE: string;
    OPT: string;
}

export interface IGameResultSortFilter {
    FIELD_NAME: string;
    SORT_ORDER: 'ASC' | 'DESC';
}

export interface IGameResultFilters {
    search: IGameResultSearchField[];
    sortFilter: IGameResultSortFilter;
}

export interface IGameResultRequest {
    filters: IGameResultFilters;
}
