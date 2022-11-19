# Unofficial Nasdaq DataLink Data Source Plugin

This datasource plugin is intended to allow users to graph data from any data sets on the Nasdaq Data Link (formerly Quandl) service. 

## Setup
1. Install the plugin
2. Set up an account on the [Nasdaq Data Link website](https://data.nasdaq.com/sign-up)
3. Enter your api key in the datasource configuration. 
4. Start adding panels!

## Configuration

### Time Series Queries
There are two main configuration fields for a query. 
1. Database Code: The identifier for the database
2. Dataset code: The identifier for the specific data set

**Advanced Settings**  
Setting the advanced settings switch exposes several other parameters that can be added to a query. They correspond to the parameters noted in the [Nasdaq documentation](https://docs.data.nasdaq.com/docs/parameters-2).

**Start Date and End Date**  
The `start_date` and `end_date` parameters are not directly exposed and are controlled by the time range feature in the dashboard. 

### Table Queries
There are two main configuration fields for a table based query
1. Database Code: The identifier for the database
2. DataTable Code: The specific table to capture

**Advanced Settings**
Setting the advanced settings switch exposes several other parameters that can be added to a query. They correspond to the parameters noted in the [Nasdaq documentation](https://docs.data.nasdaq.com/docs/parameters-1).


## Planned Features
[x] Table data support  
[] Prepopulate column_index select field with the column names for the current dataset. 