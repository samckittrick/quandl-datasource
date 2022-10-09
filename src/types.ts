import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  queryText?: string;
  constant: number;
  
  // Quandl time series params
  database_code: string;
  dataset_code: string;
  limit?: number;
  column_index?: number;
  order?: string;
  collapse?: string;
  transform?: string;
  setAdvanced: boolean; // The status of the advanced slider
}

export const defaultQuery: Partial<MyQuery> = {
  // Default to TREASURY Yields because I had to choose something
  database_code: "TREASURY",
  dataset_code: "YIELD",

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
