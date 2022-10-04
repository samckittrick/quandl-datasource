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

import { Observable, merge } from 'rxjs';

import { QuandlDataset } from './QuandlApiTypes';
 
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
      const { range } = options;
      const from = range!.from.format("YYYY-MM-DD");
      const to = range!.to.format("YYYY-MM-DD");
      const apiPath = `/api/v3/datasets/${query.database_code}/${query.dataset_code}/data.json?start_date=${from}&end_date=${to}`;
      console.log(apiPath);
      // Create a new observable to return
      const queryObservable = new Observable<DataQueryResponse>((subscriber) => {

        // The doRequest function returns an observable. We subscribe to it, format the data
        // and emit our own next with the formatted data. 
        let response: Observable<FetchResponse> =  this.doRequest(apiPath);
        let respSubscriber = response.subscribe({
          next(r) { 
            console.log(r);

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
    

  }

  async testDatasource() {
    // Implement a health check for your data source.
    let response = this.doRequest("/api/v3/datasets/FED/FA087005086_A/data.json");
    console.log(response)
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
        console.log("Complete");
        respSubscriber.unsubscribe();
      }
    });
    return {
      status: 'success',
      message: 'Success',
    };
  }

  doRequest(path: string): Observable<FetchResponse> {
    const result = getBackendSrv().fetch({
      method: "GET",
      url: this.instanceUrl + "/quandlApi" + path,
    });

    return result;
  }
}
