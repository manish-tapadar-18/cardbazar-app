export interface ITransactionSearchField {
    FIELD_NAME: string;
    FIELD_VALUE: string;
    OPT: string;
}

export interface ITransactionSortFilter {
    FIELD_NAME: string;
    SORT_ORDER: 'ASC' | 'DESC';
}

export interface ITransactionFilters {
    search: ITransactionSearchField[];
    sortFilter: ITransactionSortFilter;
}

export interface ITransactionRequest {
    filters: ITransactionFilters;
}
