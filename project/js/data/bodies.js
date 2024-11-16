import { readJSON, jsonParseD3Data } from "./utils.js";

let bodiesData = null;

/**
 * @return {Array<Object>}
 */
export const getBodiesData = async () => {
    if (bodiesData) return bodiesData;
    let data = await readJSON("./files/bodies.json");
    data = jsonParseD3Data(data);
    data = data.map(world => ({
        ...world,
        color: worldColorMap(world),
    }));
    bodiesData = data;
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