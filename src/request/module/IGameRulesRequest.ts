export interface ISortFilter {
    FIELD_NAME: string;
    SORT_ORDER: "ASC" | "DESC";
}

export interface IGameRulesFilters {
    search: any[];
    sortFilter?: ISortFilter;
}

export interface IGameRulesRequest {
    filters: IGameRulesFilters;
}
