import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { QueryEditorProps, SelectableValue } from "@grafana/data";
import { Switch, InlineLabel, InlineField, Input, InlineFieldRow, Select, Button, IconButton } from '@grafana/ui';
import { DataSource } from "./datasource";
import { defaultQuery, MyDataSourceOptions, MyQuery } from "./types";
import { QuandlTableFilterDescriptor, QuandlTableFilterOperator } from 'QuandlApiTypes';


type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

/*
Query editor for table queries in Nasdaq Data Link
*/
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
    };

    onLimitChanged = (event: ChangeEvent<HTMLInputElement>) => {
      const { onChange, query, onRunQuery } = this.props;
      onChange({...query, limit: event.target.valueAsNumber});
      onRunQuery();
    };

    onColumnChange = (event: ChangeEvent<HTMLInputElement>) => {
      const { onChange, query, onRunQuery } = this.props;
      onChange({...query, columns: event.target.value});
      onRunQuery();
    }

    onFilterListChange = (newFilterList: QuandlTableFilterDescriptor[]) => {
      const { onChange, query, onRunQuery } = this.props;
      //console.log(newFilterList);
      onChange({...query, filters: newFilterList});
      onRunQuery();
    }

    AdvancedTableParams(query: MyQuery): JSX.Element {

        return (
          <div>
            <InlineFieldRow>
              <InlineField label="Limit" tooltip="Limit the number of records returned. (Max 10,000)">
                <Input type="number" value={query.limit} onChange={this.onLimitChanged}/>
              </InlineField>
            </InlineFieldRow>
            <InlineFieldRow>
              <InlineField label="Display Columns" tooltip="Specify which columns to display, comma separated">
                <Input type="text" value={query.columns} onChange={this.onColumnChange} />
              </InlineField>
            </InlineFieldRow>
            <InlineFieldRow>
              <FilterEditorGroup filterList={query.filters} onChange={this.onFilterListChange} />
            </InlineFieldRow>
          </div>
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
                <InlineLabel className="gf-form-label">Advanced Settings</InlineLabel>
              </div>
              <div className="gf-form">
                <Switch className="gf-form-label"
                  value={setAdvanced}
                  onChange={this.onAdvancedSwitchChanged}
                />
              </div>
              { setAdvanced && this.AdvancedTableParams(query) }
            </div>
          </div>
        );
    }
}

/*
Props for the FilterEditor Group
*/
export interface FilterEditorGroupProps { 
  filterList?: QuandlTableFilterDescriptor[],
  onChange?: (filterList: QuandlTableFilterDescriptor[]) => void,
};

/* 
Component class rendering a group of FilterEditors as well as managing adding and removing them
*/
export class FilterEditorGroup extends PureComponent<FilterEditorGroupProps> {

  state: {
    filterList?: QuandlTableFilterDescriptor[]
  }

  constructor(props: FilterEditorGroupProps) {
    super(props)
    this.state = {
      filterList: props.filterList,
    }
  }

  onFilterChanged = (newFilter: QuandlTableFilterDescriptor, index: number) => {
    if(this.state.filterList === undefined || this.state.filterList.length === 0) {
      console.log("Warning, filter changed even though the filterList is empty.");
      return;
    }
    // Update the specific filter in the list that got changed. 
    let newFilterList = this.state.filterList;
    newFilterList[index] = newFilter;
    /*let newFilterList = this.state.filterList.map((f, i) => {
      return (i === index) ? newFilter : this.state.filterList[i];
    })*/
    this.setState({filterList: newFilterList});

    console.log(newFilterList);

    if(this.props.onChange) { this.props.onChange(newFilterList) }
  }

  onAddFilterClicked = () => {
    let newFilterList: QuandlTableFilterDescriptor[] = (this.state.filterList !== undefined) ? this.state.filterList : [];
    newFilterList.push({ column: "", operator: QuandlTableFilterOperator.Equals, value: "" });
    // We need to spread the array values into a new array so react detects that the array has changed and rerenders. 
    // https://stackoverflow.com/questions/61896668/react-does-not-re-render-updated-array-state
    this.setState({filterList: [...newFilterList]} )
    if(this.props.onChange) { this.props.onChange(newFilterList) };
  }

  onRemoveFilterClicked = (index: number) => {
    if(this.state.filterList === undefined || this.state.filterList.length === 0) {
      console.log("Warning, filter removed even though the filterList is empty.");
      return;
    }

    // We spread the array to create a copy because the splice function modifies the array directly and we shouldn't do that to the state. 
    let newFilterList: QuandlTableFilterDescriptor[] = [...this.state.filterList];
    newFilterList.splice(index, 1);
    // We don't need to spread the array here, because we already did above
    this.setState( { filterList: newFilterList })
    if(this.props.onChange) { this.props.onChange(newFilterList)};
  }

  renderFilterEditorList(): JSX.Element[] {
    /*
    Render any in the array
    if array is empty, render extra one
    if marked to have en empty one, render extra one
    */
    if(this.state.filterList === undefined) {return [];}

    let filterEditorJSX: JSX.Element[] = this.state.filterList.map((filter, idx) => {
      let fname = `Filter ${idx + 1}`;
      return (
        <InlineFieldRow key={idx}>
          { 
            // Generate a random number for the key, so it's unique through rerenders. 
            // https://stackoverflow.com/questions/43642351/react-list-rendering-wrong-data-after-deleting-item
          }
          <FilterEditor filter={filter} onChange={(newFilter) => this.onFilterChanged(newFilter, idx) } filterName={fname} key={Math.random()} />
          <IconButton name="minus-circle" onClick={ () => this.onRemoveFilterClicked(idx) }/>
        </InlineFieldRow> 
      )
    });

    return filterEditorJSX
  }

  render() {
    return (
      <div>
        <InlineFieldRow>
          <InlineLabel>Filters</InlineLabel>
        </InlineFieldRow>
            { this.renderFilterEditorList() }
        <InlineFieldRow>
          <Button onClick={this.onAddFilterClicked}>Add New Filter</Button>
        </InlineFieldRow>
      </div>
    )
  }
}

/* 
  Interface defining the props for the FilterEditor Component
*/
export interface FilterEditorProps {
  filter?: QuandlTableFilterDescriptor,
  filterName: string,
  onChange?: (filter: QuandlTableFilterDescriptor) => void;
}

/*
  Custom component that manages the settings for a single filter
*/
export class FilterEditor extends PureComponent<FilterEditorProps> {

  state: {
    filter: QuandlTableFilterDescriptor,
  }

  constructor(props: FilterEditorProps) {
    super(props);

    // If we got a filter, set our state to cover it, else set an empty state
    this.state = {
      filter: props.filter ? props.filter : { column: "", operator: QuandlTableFilterOperator.Equals, value: ""}
    }
  }

  onColumnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange } = this.props;
    let newFilter = {...this.state.filter, column: event.target.value};
    this.setState({filter: newFilter});
    if(onChange) {onChange(newFilter);}
  }

  onOperatorChange = (value: SelectableValue<QuandlTableFilterOperator>) => {
    const { onChange } = this.props;
    if(!value.value) {throw new Error("Operator Value cannot be undefined. How did this happen?");}
    let newFilter = {...this.state.filter, operator: value.value};
    this.setState({filter: newFilter});
    if(onChange) {onChange(newFilter);}
  }

  onValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange } = this.props;
    let newFilter = {...this.state.filter, value: event.target.value};
    this.setState({filter: newFilter});
    if(onChange) {onChange(newFilter);}
  }

  getOperatorOptions(): Array<SelectableValue<QuandlTableFilterOperator>> {
    return [
      { label: "=", value: QuandlTableFilterOperator.Equals },
      { label: ">", value: QuandlTableFilterOperator.GreaterThan },
      { label: "<", value: QuandlTableFilterOperator.LessThan },
      { label: ">=", value: QuandlTableFilterOperator.GreaterThanOrEqual },
      { label: "<=", value: QuandlTableFilterOperator.LessThanOrEqual},
    ]
  }

  render() {
    return (
    <InlineFieldRow>
      <InlineField label={this.props.filterName}>
        <Input type="text" placeholder='Column Name' value={this.state.filter.column} onChange={this.onColumnChange}/>
      </InlineField>
      <InlineField tooltip="The operator to use">
        <Select 
          options={this.getOperatorOptions()}
          onChange={this.onOperatorChange}
          value={this.state.filter.operator}
          defaultValue={QuandlTableFilterOperator.Equals}
          isClearable={false}
        />
      </InlineField>
      <InlineField>
        <Input type="text" placeholder="Filter Parameter" value={this.state.filter.value} onChange={this.onValueChange}/>
      </InlineField>
    </InlineFieldRow>
    )
  }
}
