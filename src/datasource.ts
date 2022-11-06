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

import { MyQuery, MyDataSourceOptions, QueryType } from './types';

import { Observable, merge, map } from 'rxjs';

import { QuandlDataset, QuandlDataTable } from './QuandlApiTypes';
 
export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  instanceUrl?: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    this.instanceUrl = instanceSettings.url;
  }

  // TODO: Add default query
  // query doesn't need to be async anymore because we are using Observables
  query(options: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
    const observableResponses: Array<Observable<DataQueryResponse>> = options.targets.map((query) => {

      // Build query parameters and path
      const apiParams: Map<string, any> = new Map<string,any>();
      let apiPath = "";

      if(query.query_type === QueryType.TimeSeries) {
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
        
        apiPath = `/api/v3/datasets/${query.database_code}/${query.dataset_code}/data.json`;
      
        // Use pipe to map a processing functon to the observable returned by doRequest. 
        // The choice of the processing function will eventually be based on the QueryType parameter. 
        // We need to add a parameter to the function, so we make a closure that calls the function with both the response and the refId.
        return this.doRequest(apiPath, Object.fromEntries(apiParams)).pipe(map(resp => this.handleTimeSeriesResponse(resp, query.refId)));
      }
      else {
        const apiParams: Map<string, any> = new Map<string, any>();
        if(query.setAdvanced) {
          // The table query doesn't have a limit param, but since 
          // we can't paginate on the server side, we might as well just set
          // the per_page param to the limit and only ever use the first page. 
          if(query.limit) { apiParams.set("qopts.per_page", query.limit);}
          if(query.columns) { apiParams.set("qopts.columns", query.columns);}
        }
        apiPath = `/api/v3/datatables/${query.database_code}/${query.dataset_code}.json`
        return this.doRequest(apiPath, (apiParams.size > 0) ? Object.fromEntries(apiParams) : undefined ).pipe(map(resp => this.handleTableResponse(resp, query.refId)));
      }
    });

    // The query function only returns one observable. we use merge to combine them all?
    return merge(...observableResponses);
    

  }

  // Process responses from a timeseries api call. 
  // We need to receive the refId as well, because we add it to the data frame. 
  handleTimeSeriesResponse(r: FetchResponse, refId: string): DataQueryResponse {
    if(r.status !== 200) {
      throw new Error(`Unexpected HTTP Response from API: ${r.status} - ${r.statusText}`);
    }

    // Start Parsing the Response
    let df = new MutableDataFrame({
      refId: refId,
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
    return {data: [df] };
  }

  handleTableResponse(r: FetchResponse, refId: string): DataQueryResponse {
    if(r.status !== 200) {
      throw new Error(`Unexpected HTTP Response from API: ${r.status} - ${r.statusText}`);
    }

    let df = new MutableDataFrame({
      refId: refId,
      fields: [],
    });

    let datatable_data: QuandlDataTable = r.data.datatable as QuandlDataTable;
    for(const f of datatable_data.columns) {
      switch(f.type) {
        case "text":
          df.addField({name: f.name, type: FieldType.string})
          break;
        case "double":
          df.addField({name: f.name, type: FieldType.number});
          break;
        case "Date":
          df.addField({name: f.name, type: FieldType.time});
          break;
        default:
          throw new Error(`Unknown column type: ${f.type}`);  
      }
    }

    for(const r of datatable_data.data) {
      df.appendRow(r);
    }

    console.log(`Response for ${refId}`);
    console.log(r);

    return { data: [df] }

  }

  async testDatasource() {
    // Implement a health check for your data source.
    let response = this.doRequest("/api/v3/datasets/FED/FA087005086_A/data.json");
    let respSubscriber = response.subscribe({
      next(x) {
        if(x.status === 200) {
          return {
            status: "success",
            message: "Success"
          }
        }
        else { throw Error(`Error connecting to Quandl API: ${x.status}`)}
      },
      error(err) {
        console.log(err);
      },
      complete() {
        respSubscriber.unsubscribe();
      }
    });
    return {
      status: 'success',
      message: 'Success',
    };
  }

  doRequest(path: string, apiParams: Record<string, any> | undefined = undefined): Observable<FetchResponse> {
    const result = getBackendSrv().fetch({
      method: "GET",
      url: this.instanceUrl + "/quandlApi" + path,
      params: apiParams
    });

    return result;
  }
}
