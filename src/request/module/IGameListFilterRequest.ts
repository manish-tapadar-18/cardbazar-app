export interface ISearchFilter {
    FIELD_NAME: string;
    FIELD_VALUE: string;
    OPT: string;
}

export interface ISortFilter {
    FIELD_NAME: string;
    SORT_ORDER: "ASC" | "DESC";
}

export interface IFilters {
    search: ISearchFilter[];
    sortFilter: ISortFilter;
}

export interface IGameListFilterRequest {
    filters: IFilters;
}
