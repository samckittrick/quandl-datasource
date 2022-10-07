import defaults from 'lodash/defaults';

import React, { PureComponent } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { MyDataSourceOptions, MyQuery, defaultQuery } from './types';
import { TimeSeriesQueryEditor } from './TimeSeriesQueryEditor';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {

  render() {
    const query = defaults(this.props.query, defaultQuery);
    //const { database_code, dataset_code, setAdvanced } = query;

    return (
      // When we do the table data, we can create a DataTableQueryEditor and 
      // Just render each one conditionally.
      // Once we choose to use the default query or not, we need to build a copy of props,
      //  add the correct query, then spread it out to be given to the QueryEditor.
      <TimeSeriesQueryEditor {...{...this.props, query: query}} /> 
    )
  }
}
