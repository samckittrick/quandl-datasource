import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { QueryEditorProps } from "@grafana/data";
import { Switch, Label, InlineField, Input } from '@grafana/ui';
import { DataSource } from "./datasource";
import { defaultQuery, MyDataSourceOptions, MyQuery } from "./types";

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class TableQueryEditor extends PureComponent<Props> {

    /*
    * Standard Level Event Handlers
    */
    onDBCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { onChange, query, onRunQuery } = this.props;
        onChange({ ...query, database_code: event.target.value });
        // executes the query
        onRunQuery();
    };

    onDBSetChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { onChange, query, onRunQuery } = this.props;
        onChange({ ...query, dataset_code: event.target.value });
        // executes the query
        onRunQuery();
    };

    onAdvancedSwitchChanged = (event: ChangeEvent<HTMLInputElement>) => {
        const { onChange, query, onRunQuery } = this.props;
        onChange({...query, setAdvanced: event.target.checked });
        // executes the query
        onRunQuery();
      }

    AdvancedTableParams(): JSX.Element {
        return (
          <p>Hello</p>
        )
    }

    render() {
        const query = defaults(this.props.query, defaultQuery);
        const { database_code, dataset_code, setAdvanced } = query;

        return (
            <div>
            <div className="gf-form-group">
              <div className="gf-form-inline">
                <InlineField label="Database Code">
                  <Input type="text" value={database_code} onChange={this.onDBCodeChange} />
                </InlineField>
                <InlineField label="Dataset Code">
                  <Input type="text" value={dataset_code} onChange={this.onDBSetChange} />
                </InlineField>
              </div>
            </div>
            <div className="gf-form-group">
              <div className="gf-form">
                <Label className="gf-form-label">Advanced Settings</Label>
              </div>
              <div className="gf-form">
                <Switch className="gf-form-label"
                  value={setAdvanced}
                  onChange={this.onAdvancedSwitchChanged}
                />
              </div>
              { setAdvanced && this.AdvancedTableParams() }
            </div>
          </div>
        );
    }
}
