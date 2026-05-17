export interface IPlayOption {
  ID: number;
  NAME: string;
  IMAGE_URL: string;
}

export interface IGameCategoryResponse {
  ID: string;
  NAME: string;
  DESCRIPTION: string;
  IMAGE_ID: string | null;
  STATUS: string;
  CREATED_AT: string;
  UPDATED_AT: string;
  CREATED_BY: string;
  UPDATED_BY: string;
  ORDER_BY: number;
  PLAY_OPTIONS: string;
  SCHEDULE_COUNT: number;
  IMAGE_PATH: string | null;
  CREATED_BY_FIRST_NAME: string;
  CREATED_BY_LAST_NAME: string;
  UPDATED_BY_FIRST_NAME: string;
  UPDATED_BY_LAST_NAME: string;
}
