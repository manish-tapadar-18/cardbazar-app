export interface IScheduleDetail {
  ID: string;
  GAME_MASTER_SCHEDULE_ID: string;
  NAME: string;
  START_TIME: string;
  END_TIME: string;
  RESULT_TIME: string;
  STATUS: string;
  CREATED_AT: string;
  UPDATED_AT: string;
  CREATED_BY: string;
  UPDATED_BY: string | null;
  RESULT_PUBLISH: number;
  GAME_WIN_NUMBER: string | null;
  GAME_WIN_NUMBER_1: string | null;
  GAME_WIN_NUMBER_2: string | null;
  GAME_WIN_NUMBER_3: string | null;
  RESULT_PUBLISH_TIME: string | null;
  GAME_INDEX: number;
  RESULT_PUBLISH_JORI: number;
  USER_TRANSACTION: number;
  CREATED_BY_FIRST_NAME: string | null;
  CREATED_BY_LAST_NAME: string | null;
  UPDATED_BY_FIRST_NAME: string | null;
  UPDATED_BY_LAST_NAME: string | null;
  CARD_NAME: string | null;
  CARD_IMAGE_URL: string | null;
}

export interface IGameItem {
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
  CREATED_BY_FIRST_NAME: string | null;
  CREATED_BY_LAST_NAME: string | null;
  UPDATED_BY_FIRST_NAME: string | null;
  UPDATED_BY_LAST_NAME: string | null;
  GT: string;
  OB: number;
  SCHEDULE_DETAILS: IScheduleDetail[];
}

export interface IGetAllGamesListResponse {
  DATA: IGameItem[];
  TOTAL: number;
}
