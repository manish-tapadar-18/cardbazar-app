export interface IGameTypeResponse {
  ID: string;
  NAME: string;
  DESCRIPTION: string;
  IMAGE_ID: string | null;
  STATUS: string;
  CREATED_AT: string;
  UPDATED_AT: string;
  CREATED_BY: string;
  UPDATED_BY: string;
  SUB_TYPE: string | null;
  IMAGE_PATH: string | null;
  CREATED_BY_FIRST_NAME: string;
  CREATED_BY_LAST_NAME: string;
  UPDATED_BY_FIRST_NAME: string;
  UPDATED_BY_LAST_NAME: string;
}
