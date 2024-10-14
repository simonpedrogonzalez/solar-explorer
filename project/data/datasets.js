/**
 * @return {Array<Object>}
 */
export const getPlanetsData = async () => {
    let data = await readCsv('./data/planets.csv');
    data = jsonParseD3Data(data);
    // Color format transformation
    data = data.map(({ color, ...rest }) => ({
         ...rest,
         color: `rgb(${color.map(c => c * 255).join(',')})`
        }));
    return data;
}

/**
 * Apply JSON.parse to all fields in d3 data objects
 * @param {Array<Object>} data
 * @return {Array<Object>}
 */
const jsonParseD3Data = (data) => {
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


const readCsv = async (fileName) => {
    try {
        return await d3.csv(fileName);
    } catch (error) {
        console.error('Error reading the file:', error);
    }
}
