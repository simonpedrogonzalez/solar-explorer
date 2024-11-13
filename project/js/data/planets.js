import { readCsv, readJSON, jsonParseD3Data } from "./utils.js";

/**
 * @return {Array<Object>}
 */
export const getPlanetsData = async () => {
    let data = await readJSON("./files/planets.json");
    // Color format transformation
    data = data.map(world => ({
        ...world,
        color: worldColorMap(world),
    }));
    return data;
}

/**
 * @return {Array<Object>}
 */
export const getOldPlanetsData = async () => {
    let data = await readCsv('./files/planets.csv');
    data = jsonParseD3Data(data);
    // Color format transformation
    data = data.map(({ color, ...rest }) => ({
         ...rest,
         color: `rgb(${color.map(c => c * 255).join(',')})`
        }));
    return data;
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
