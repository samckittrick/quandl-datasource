import defaults from 'lodash/defaults';

import React, { PureComponent } from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { MyDataSourceOptions, MyQuery, defaultQuery, QueryType } from './types';
import { TimeSeriesQueryEditor } from './TimeSeriesQueryEditor';
import { InlineField, InlineFieldRow, Select } from '@grafana/ui';
import { TableQueryEditor } from 'TableQueryEditor';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {

  getQueryTypeSelects(): SelectableValue[] {
    return [
      { label: "Time Series", value: QueryType.TimeSeries},
      { label: "Table", value: QueryType.Table}
    ]
  }

  onQueryTypeChanged = (value: SelectableValue<QueryType>) => {
    const { onChange, query, onRunQuery } = this.props;
    let qt = QueryType.TimeSeries
    if(value.value === undefined) {
      console.log("Warning: query type undefined in select. Defaulting to time series. ")
    }
    else {
      qt = value.value;
    }
    onChange({...query, query_type: qt});
    onRunQuery();
  }
  
  render() {
    const query = defaults(this.props.query, defaultQuery);
    //const { database_code, dataset_code, setAdvanced } = query;
    
    return (
      // When we do the table data, we can create a DataTableQueryEditor and 
      // Just render each one conditionally.
      <div>
        <InlineFieldRow>
          <InlineField label="Query Type" tooltip="Configure the query type to use.">
            <Select 
              options={this.getQueryTypeSelects()}
              value={this.props.query.query_type}
              onChange={this.onQueryTypeChanged}
            />
          </InlineField>
        </InlineFieldRow>
        {
        // Once we choose to use the default query or not, we need to build a copy of props,
        //  add the correct query, then spread it out to be given to the QueryEditor.
        }
        { (this.props.query.query_type === QueryType.TimeSeries) && <TimeSeriesQueryEditor {...this.props} query={query} /> }
        { (this.props.query.query_type === QueryType.Table) && <TableQueryEditor {...this.props } query= {query} /> } 
      </div>
      )
    }
  }
  
