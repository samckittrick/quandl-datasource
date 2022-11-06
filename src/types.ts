import { DataQuery, DataSourceJsonData } from '@grafana/data';

export enum QueryType {
  TimeSeries,
  Table,
}

export interface MyQuery extends DataQuery {
  // Type of Data Source Query
  query_type: QueryType,

  // Quandl time series params
  database_code: string,
  dataset_code: string,
  limit?: number, // Shared with table params
  column_index?: number,
  order?: string,
  collapse?: string,
  transform?: string,
  setAdvanced: boolean, // The status of the advanced slider

  // Quandl Data Table Params
  columns?: string,
}

export const defaultQuery: Partial<MyQuery> = {
  // Default to TREASURY Yields because I had to choose something
  query_type: QueryType.TimeSeries,
  database_code: "USTREASURY",
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
