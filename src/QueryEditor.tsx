import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

const { FormField } = LegacyForms;

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onDBCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, database_code: event.target.value });
  };

  onDBSetChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, dataset_code: event.target.value });
    // executes the query
    onRunQuery();
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { database_code, dataset_code } = query;

    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <FormField 
            width={4}
            value={database_code}
            onChange={this.onDBCodeChange}
            label="Database Code"
            type="string"
          />
          <FormField
            width={4}
            value={dataset_code}
            onChange={this.onDBSetChange}
            label="Dataset Code"
            type="string"
          />
        </div>
      </div>
    );
  }
}
