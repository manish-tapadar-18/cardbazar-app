export interface IGameRulesItem {
  ID: string;
  CATEGORY_ID: string;
  TYPE_ID: string;
  DESCRIPTION: string;
  MAX_BET: string;
  MIN_BET: string;
  BASE_AMOUNT: string;
  GAIN_AMOUNT: string;
  STATUS: string;
  CREATED_AT: string;
  UPDATED_AT: string;
  CREATED_BY: string;
  UPDATED_BY: string;
  CATEGORY_NAME: string;
  CAT_ORDER_BY: number;
  TYPE_NAME: string;
  CREATED_BY_FIRST_NAME: string;
  CREATED_BY_LAST_NAME: string;
  UPDATED_BY_FIRST_NAME: string;
  UPDATED_BY_LAST_NAME: string;
}

export interface IGameRulesResponse {
  DATA: IGameRulesItem[];
  TOTAL: number;
}
