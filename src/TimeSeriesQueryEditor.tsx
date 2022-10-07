import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { QueryEditorProps } from "@grafana/data";
import { Switch, Label, InlineField, Input, InlineFieldRow, Select } from '@grafana/ui';
import { DataSource } from "./datasource";
import { defaultQuery, MyDataSourceOptions, MyQuery } from "./types";

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class TimeSeriesQueryEditor extends PureComponent<Props> {
  /*
   * Standard Level Parameters
   */
  onDBCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log("Changed dbcode")
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


  /*
   * Advanced Time Series Stuff
   */
  onLimitChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, limit: event.target.valueAsNumber });
    // executes the query
    onRunQuery();
  };

  onColumnIndexChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, column_index: event.target.valueAsNumber });
    // executes the query
    onRunQuery();
  };

 
  AdvancedTimeSeriesParams() {
    return (
      <div>
        <InlineFieldRow>
          <InlineField label="Limit">
            <Input type="number" value={this.props.query.limit} onChange={this.onLimitChanged}/>
          </InlineField>
          <InlineField label="Column Index">
            <Input type="number" value="3" onChange={this.onColumnIndexChanged}/>
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField label="Order">
            <Select 
              onChange={(value) => console.log(value)}
            />
          </InlineField>
          <InlineField label="Collapse">
            <Select
              onChange={(value) => console.log(value)}
            />
          </InlineField>
          <InlineField label="Transform">
            <Select 
              onChange={(value) => console.log(value)}
            />
          </InlineField>
        </InlineFieldRow>
      </div>
    )
  }

  render() {
    console.log(this.props);
    const query = defaults(this.props.query, defaultQuery);
    const { database_code, dataset_code, setAdvanced } = query;

    // For on advanced Change handler, use curried functions so we don't have to repeat code
    // See: https://stackoverflow.com/questions/64323779/how-to-pass-additional-parameters-to-onchange-function-in-react
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
          { setAdvanced && this.AdvancedTimeSeriesParams() }
        </div>
      </div>
    );
  }
}
