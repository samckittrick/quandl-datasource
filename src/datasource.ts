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
  query(options: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
    console.log("In Query");
    const observableResponses: Array<Observable<DataQueryResponse>> = options.targets.map((query) => {
      const apiPath = `/api/v3/datasets/${query.database_code}/${query.dataset_code}/data.json`
      const queryObservable = new Observable<DataQueryResponse>((subscriber) => {
        console.log(`In observable for refid ${query.refId}`)
        let response: Observable<FetchResponse> =  this.doRequest(apiPath);
        console.log(response)
        console.log(`${query.refId}: Got response`)
        let respSubscriber = response.subscribe({
          next(r) { 
            console.log(`${query.refId}: In next of respSubscriber`);
            console.log(r);

            if(r.status !== 200) {throw new Error(`Unexpected HTTP Response from API: ${r.status} - ${r.statusText}`);}

            // Start Parsing the Response
            let df = new MutableDataFrame({
              refId: query.refId,
              fields: [],
            })

            let dataset_data: QuandlDataset = r.data.dataset_data as QuandlDataset;
            for(const f of dataset_data.column_names) {
              df.addField({ name: f, type: FieldType.string})
            }

            for(const r of dataset_data.data) {
              df.appendRow(r);
            }

            subscriber.next( {data: [df] } ); 
            
          },
          error(err) { console.log(err) },
          complete() { 
            console.log("Complete")
            subscriber.complete(); 
            console.log(`${query.refId}: Unsubscribing`)
            respSubscriber.unsubscribe()
            console.log(`${query.refId}: Unsubscribed`)
          }
        });

      });

      return queryObservable;
    });

    // ToDo Check what this function does.
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
