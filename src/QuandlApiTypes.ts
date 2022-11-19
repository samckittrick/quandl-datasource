/* 
 * A definition of some api types so typescript knows how the responses are formatted. 
 */
export type QuandlDataset = {
    column_names: string[],
    start_date: string,
    end_date: string,
    data: string[][],
}

export type QuandleDataTableColumnDescriptor = {
    name: string,
    type: string,
}

export type QuandlDataTable = {
    columns: QuandleDataTableColumnDescriptor[],
    data: Array<Array<string|number>>,
}

export enum QuandlTableFilterOperator {
    Equals,
    GreaterThan,
    LessThan,
    GreaterThanOrEqual,
    LessThanOrEqual,
}

export type QuandlTableFilterDescriptor = {
    column: string,
    operator: QuandlTableFilterOperator,
    value: string,
}
