// import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { getBackendSrv, FetchResponse } from "@grafana/runtime"

import { MyQuery, MyDataSourceOptions } from './types';

import { QuandlDataset } from './QuandlApiTypes';
 
export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  instanceUrl?: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    this.instanceUrl = instanceSettings.url;
  }

  // TODO: Add default query
  // query doesn't need to be async anymore because we are using Observables
  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const promises = options.targets.map((query) => {
            // Build query parameters and path
            const apiParams: Map<string, any> = new Map<string,any>();

            // range params
            const { range } = options;
            const from = range!.from.format("YYYY-MM-DD");
            const to = range!.to.format("YYYY-MM-DD");
            apiParams.set("start_date", from);
            apiParams.set("end_date", to);
      
            // Advanced Params
            if(query.setAdvanced) { // By only applying them when setAdvanced is true, we only apply them when they are visible. Prevents confusion.
              if(query.limit) {apiParams.set("limit", query.limit);}
              if(query.column_index) {apiParams.set("column_index", query.column_index);}
              if(query.order) {apiParams.set("order", query.order);}
              if(query.collapse) {apiParams.set("collapse", query.collapse);}
              if(query.transform) {apiParams.set("transform", query.transform)}
            }
            
            const apiPath = `/api/v3/datasets/${query.database_code}/${query.dataset_code}/data.json`;
            return this.doRequest(apiPath, Object.fromEntries(apiParams)).then((r) => {
              if(r.status !== 200) {
                throw new Error(`Unexpected HTTP Response from API: ${r.status} - ${r.statusText}`);
              }
  
              // Start Parsing the Response
              let df = new MutableDataFrame({
                refId: query.refId,
                fields: [],
              })
  
              let dataset_data: QuandlDataset = r.data.dataset_data as QuandlDataset;
              for(const f of dataset_data.column_names) {
                
                // The time series data set always has a date and then number fields. 
                // With tables we'll probably have to infer data types or just use xml because the xml format shows types. . 
                if(f === "Date") {
                  df.addField({name: f, type: FieldType.time})
                } else {
                  df.addField({ name: f, type: FieldType.number})
                }
              }
  
              for(const r of dataset_data.data) {
                df.appendRow(r);
              }
              
 
              return df; 
            })
    });

    return Promise.all(promises).then((data) => ({data}));
    /*
    const observableResponses: Array<Observable<DataQueryResponse>> = options.targets.map((query) => {

      // Build query parameters and path
      const apiParams: Map<string, any> = new Map<string,any>();

      // range params
      const { range } = options;
      const from = range!.from.format("YYYY-MM-DD");
      const to = range!.to.format("YYYY-MM-DD");
      apiParams.set("start_date", from);
      apiParams.set("end_date", to);

      // Advanced Params
      if(query.setAdvanced) { // By only applying them when setAdvanced is true, we only apply them when they are visible. Prevents confusion.
        if(query.limit) {apiParams.set("limit", query.limit);}
        if(query.column_index) {apiParams.set("column_index", query.column_index);}
        if(query.order) {apiParams.set("order", query.order);}
        if(query.collapse) {apiParams.set("collapse", query.collapse);}
        if(query.transform) {apiParams.set("transform", query.transform)}
      }
      
      const apiPath = `/api/v3/datasets/${query.database_code}/${query.dataset_code}/data.json`;
      // Create a new observable to return
      const queryObservable = new Observable<DataQueryResponse>((subscriber) => {

        // The doRequest function returns an observable. We subscribe to it, format the data
        // and emit our own next with the formatted data. 
        let response: Observable<FetchResponse> =  this.doRequest(apiPath, Object.fromEntries(apiParams));
        let respSubscriber = response.subscribe({
          next(r) { 
            //console.log(`Response for query ${query.refId}`);
            //console.log(r);

            if(r.status !== 200) {
              subscriber.error(`Unexpected HTTP Response from API: ${r.status} - ${r.statusText}`);
              return;
            }

            // Start Parsing the Response
            let df = new MutableDataFrame({
              refId: query.refId,
              fields: [],
            })

            let dataset_data: QuandlDataset = r.data.dataset_data as QuandlDataset;
            for(const f of dataset_data.column_names) {
              
              // The time series data set always has a date and then number fields. 
              // With tables we'll probably have to infer data types or just use xml because the xml format shows types. . 
              if(f === "Date") {
                df.addField({name: f, type: FieldType.time})
              } else {
                df.addField({ name: f, type: FieldType.number})
              }
            }

            for(const r of dataset_data.data) {
              df.appendRow(r);
            }
            
            // Alert the subscriber that we have new formatted data. 
            // Not sure why I have to put it in an object with the array, but it seems to work. 
            subscriber.next( {data: [df] } ); 
            
          },
          error(err) { 
            console.log(err);
            subscriber.error(`API returned error: ${err.status} - ${err.statusText}`);
          },
          complete() { 
            // Once we are done reading the response, we can call it complete here too. 
            subscriber.complete(); 
            respSubscriber.unsubscribe()
          }
        });

      });

      return queryObservable;
    });

    // The query function only returns one observable. we use merge to combine them all?
    return merge(...observableResponses);
    
    */
  }

  async testDatasource() {
    // Implement a health check for your data source.
    let response = await this.doRequest("/api/v3/datasets/FED/FA087005086_A/data.json");

    if(response.status === 200) {
      return {
        status: "success",
        message: "Success"
      }
    }
    else { throw Error(`Error connecting to Quandl API: ${response.status}`)}
  }

  async doRequest(path: string, apiParams: Record<string, any> | undefined = undefined): Promise<FetchResponse> {
    const result = getBackendSrv().datasourceRequest({
      method: "GET",
      url: this.instanceUrl + "/quandlApi" + path,
      params: apiParams
    });

    return result;
  }
}
