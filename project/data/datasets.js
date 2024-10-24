/**
 * @return {Array<Object>}
 */
export const getPlanetsData = async () => {
    let data = await readJSON("./data/planets.json");
    // Color format transformation
    data = data.map(world => ({
        ...world,
        color: worldColorMap(world),
    }));
    return data;
}

export const getMissionsData = async () => {
    let data = await readJSON("./data/missions.json");
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


const readJSON = async (fileName) => {
    try {
        return await d3.json(fileName);
    } catch (error) {
        console.error('Error reading the file:', error);
    }
}


const worldColorMap = (world) => {
    const colorMap = {
        Sun: 'rgb(255, 255, 0)',
        Mercury: 'rgb(102, 51, 13)',
        Venus: 'rgb(255, 200, 100)',
        Earth: 'rgb(0, 0, 255)',
        Mars: 'rgb(255, 0, 0)',
        Jupiter: 'rgb(153, 26, 26)',
        Saturn: 'rgb(204, 77, 0)',
        Uranus: 'rgb(0, 204, 51)',
        Neptune: 'rgb(0, 102, 204)',
    };
    if(colorMap[world.name]) {
        return colorMap[world.name];
    } else {
        return 'rgb(200, 200, 200)';
    }
}
