import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { QueryEditorProps, SelectableValue } from "@grafana/data";
import { Switch, Label, InlineField, Input, InlineFieldRow, Select } from '@grafana/ui';
import { DataSource } from "./datasource";
import { defaultQuery, MyDataSourceOptions, MyQuery } from "./types";

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class TimeSeriesQueryEditor extends PureComponent<Props> {

  /* 
   * Functions for creating select field lists
  */
  private getOrderSelects(): SelectableValue[] {
    return [
      { label: "Ascending", value: "asc"},
      { label: "Descending", value: "desc"}
    ]
  }

  private getCollapseSelects(): SelectableValue[] {
    return [
      { label: "None", value: "none"},
      { label: "Daily", value: "daily"},
      { label: "Weekly", value: "weekly"},
      { label: "Monthly", value: "monthly"},
      { label: "Quarterly", value: "quarterly"},
      { label: "Annually", value: "annually"},
    ]
  }

  private getTransformSelects(): SelectableValue[] {
    return [
      {label: "None", value: "none"},
      {label: "diff", value: "diff"},
      {label: "rdiff", value: "rdiff"},
      {label: "rdif_from", value: "rdiff_from"},
      {label: "cumul", value: "cumul"},
      {label: "normalize", value: "normalize"}
    ]
  }

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


  /*
   * Advanced Time Series Event Handlers
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

  onOrderChanged = (value: SelectableValue<string>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({...query, order: value.value})
    // executes the query
    onRunQuery();
  }

  onCollapseChanged = (value: SelectableValue<string>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({...query, collapse: value.value})
    // executes the query
    onRunQuery();
  }

  onTransformChanged = (value: SelectableValue<string>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({...query, transform: value.value})
    // executes the query
    onRunQuery();
  }

 
  AdvancedTimeSeriesParams(query: MyQuery): JSX.Element {
    return (
      <div>
        <InlineFieldRow>
          <InlineField label="Limit" tooltip="Limit the number of records returned.">
            <Input type="number" value={query.limit} onChange={this.onLimitChanged}/>
          </InlineField>
          <InlineField label="Column Index" tooltip="Limit the data returned to a specific column from the whole set.">
            <Input type="number" value={query.column_index} onChange={this.onColumnIndexChanged}/>
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField label="Order" tooltip="Order by date ascending or descending">
            <Select 
              options={this.getOrderSelects()}
              value={query.order}
              onChange={this.onOrderChanged}
            />
          </InlineField>
          <InlineField label="Collapse" tooltip="Change the sampling frequency of the data. See Docs for Details.">
            <Select
              options={this.getCollapseSelects()}
              value={query.collapse}
              onChange={this.onCollapseChanged}
            />
          </InlineField>
          <InlineField label="Transform" tooltip="Perform some basic calculations before receiving the data. See Docs for Details.">
            <Select 
              options={this.getTransformSelects()}
              value={query.transform}
              onChange={this.onTransformChanged}
            />
          </InlineField>
        </InlineFieldRow>
      </div>
    )
  }

  render() {
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
          { setAdvanced && this.AdvancedTimeSeriesParams(query) }
        </div>
      </div>
    );
  }
}
