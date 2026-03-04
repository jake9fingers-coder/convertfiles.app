export type DataConversionMode =
    | 'json_to_csv' | 'json_to_xlsx'
    | 'csv_to_json' | 'csv_to_xlsx'
    | 'xlsx_to_csv' | 'xlsx_to_json'

export interface DataConversionProfile {
    id: DataConversionMode
    label: string
    description: string
    outputExtension: string
    mimeType: string
    acceptedInputs: string[]
}

export const DATA_PROFILES: Record<DataConversionMode, DataConversionProfile> = {
    json_to_csv: {
        id: 'json_to_csv',
        label: 'JSON to CSV',
        description: 'Convert JSON arrays or objects into comma-separated rows',
        outputExtension: 'csv',
        mimeType: 'text/csv',
        acceptedInputs: ['.json', 'application/json'],
    },
    json_to_xlsx: {
        id: 'json_to_xlsx',
        label: 'JSON to Excel',
        description: 'Convert JSON data securely into an Excel spreadsheet',
        outputExtension: 'xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        acceptedInputs: ['.json', 'application/json'],
    },
    csv_to_json: {
        id: 'csv_to_json',
        label: 'CSV to JSON',
        description: 'Convert rows of data into structured JSON objects',
        outputExtension: 'json',
        mimeType: 'application/json',
        acceptedInputs: ['.csv', 'text/csv'],
    },
    csv_to_xlsx: {
        id: 'csv_to_xlsx',
        label: 'CSV to Excel',
        description: 'Convert CSV files to proper Excel spreadsheets',
        outputExtension: 'xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        acceptedInputs: ['.csv', 'text/csv'],
    },
    xlsx_to_csv: {
        id: 'xlsx_to_csv',
        label: 'Excel to CSV',
        description: 'Extract Excel sheets into plain CSV text',
        outputExtension: 'csv',
        mimeType: 'text/csv',
        acceptedInputs: ['.xlsx', '.xls', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
    },
    xlsx_to_json: {
        id: 'xlsx_to_json',
        label: 'Excel to JSON',
        description: 'Convert Excel rows into structured JSON data',
        outputExtension: 'json',
        mimeType: 'application/json',
        acceptedInputs: ['.xlsx', '.xls', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
    },
}
