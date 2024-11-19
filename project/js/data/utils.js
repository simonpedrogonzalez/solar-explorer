export const readCsv = async (fileName) => {
    try {
        return await d3.csv(fileName);
    } catch (error) {
        console.error('Error reading the file:', error);
    }
}


export const readJSON = async (fileName) => {
    try {
        return await d3.json(fileName);
    } catch (error) {
        console.error('Error reading the file:', error);
    }
}

/**
 * Apply JSON.parse to all fields in d3 data objects
 * @param {Array<Object>} data
 * @return {Array<Object>}
 */
export const jsonParseD3Data = (data) => {
    return data.map((row) => {
        const convertedRow = {};
        Object.keys(row).forEach(key => {
            const value = row[key];
            let parsedValue = value;
            try {
                parsedValue = JSON.parse(value);
            } catch (error) {}
            convertedRow[key] = parsedValue;
        });
        return convertedRow;
    });
}
