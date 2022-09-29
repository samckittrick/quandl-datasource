import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  queryText?: string;
  constant: number;
  
  // Quandl time series params
  database_code: string;
  dataset_code: string;
  limit?: number;
  column_index?: number;
  order?: boolean; // true - ascending, false - descending
  collapse?: string;
  transform?: string;
}

export const defaultQuery: Partial<MyQuery> = {
  constant: 6.5,

  // Default to US GDP because I had to choose something
  database_code: "FED",
  dataset_code: "FA087005086_A",

};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  //path?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}