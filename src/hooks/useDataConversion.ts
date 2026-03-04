import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import type { DataConversionMode } from '../lib/dataConversionProfiles'

export interface DataConversionResult {
    blob: Blob
    filename: string
    url: string
}

export async function convertDataFile(file: File, mode: DataConversionMode): Promise<DataConversionResult> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = async (e) => {
            try {
                const data = e.target?.result
                if (!data) throw new Error("Failed to read file")

                let resultBlob: Blob
                const baseFilename = file.name.substring(0, file.name.lastIndexOf('.')) || file.name

                if (mode === 'json_to_csv' || mode === 'json_to_xlsx') {
                    // Parse JSON
                    const jsonContent = typeof data === 'string' ? data : new TextDecoder().decode(data as ArrayBuffer)
                    let parsedJson = JSON.parse(jsonContent)

                    // If it's a single object (not an array), wrap it
                    if (!Array.isArray(parsedJson)) {
                        parsedJson = [parsedJson]
                    }

                    if (mode === 'json_to_csv') {
                        const csv = Papa.unparse(parsedJson)
                        resultBlob = new Blob([csv], { type: 'text/csv' })
                        resolve({
                            blob: resultBlob,
                            filename: `${baseFilename}.csv`,
                            url: URL.createObjectURL(resultBlob)
                        })
                    } else { // json_to_xlsx
                        const worksheet = XLSX.utils.json_to_sheet(parsedJson)
                        const workbook = XLSX.utils.book_new()
                        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
                        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
                        resultBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                        resolve({
                            blob: resultBlob,
                            filename: `${baseFilename}.xlsx`,
                            url: URL.createObjectURL(resultBlob)
                        })
                    }

                } else if (mode === 'csv_to_json' || mode === 'csv_to_xlsx') {
                    const csvContent = typeof data === 'string' ? data : new TextDecoder().decode(data as ArrayBuffer)
                    Papa.parse(csvContent, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            if (mode === 'csv_to_json') {
                                const json = JSON.stringify(results.data, null, 2)
                                resultBlob = new Blob([json], { type: 'application/json' })
                                resolve({
                                    blob: resultBlob,
                                    filename: `${baseFilename}.json`,
                                    url: URL.createObjectURL(resultBlob)
                                })
                            } else { // csv_to_xlsx
                                const worksheet = XLSX.utils.json_to_sheet(results.data)
                                const workbook = XLSX.utils.book_new()
                                XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
                                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
                                resultBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                                resolve({
                                    blob: resultBlob,
                                    filename: `${baseFilename}.xlsx`,
                                    url: URL.createObjectURL(resultBlob)
                                })
                            }
                        },
                        error: (error: Error) => reject(error)
                    })

                } else if (mode === 'xlsx_to_csv' || mode === 'xlsx_to_json') {
                    const workbook = XLSX.read(data, { type: 'array' })
                    const firstSheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[firstSheetName]

                    if (mode === 'xlsx_to_csv') {
                        const csv = XLSX.utils.sheet_to_csv(worksheet)
                        resultBlob = new Blob([csv], { type: 'text/csv' })
                        resolve({
                            blob: resultBlob,
                            filename: `${baseFilename}.csv`,
                            url: URL.createObjectURL(resultBlob)
                        })
                    } else { // xlsx_to_json
                        const json = XLSX.utils.sheet_to_json(worksheet)
                        const jsonString = JSON.stringify(json, null, 2)
                        resultBlob = new Blob([jsonString], { type: 'application/json' })
                        resolve({
                            blob: resultBlob,
                            filename: `${baseFilename}.json`,
                            url: URL.createObjectURL(resultBlob)
                        })
                    }
                } else {
                    reject(new Error("Unsupported conversion mode"))
                }

            } catch (err) {
                reject(err)
            }
        }

        reader.onerror = () => reject(new Error("File read error"))

        if (mode === 'xlsx_to_csv' || mode === 'xlsx_to_json') {
            reader.readAsArrayBuffer(file)
        } else {
            reader.readAsText(file)
        }
    })
}
