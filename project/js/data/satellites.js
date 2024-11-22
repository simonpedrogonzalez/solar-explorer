import { readJSON, jsonParseD3Data } from "./utils.js";

let satellitesData = null;

/**
 * @return {Array<Object>}
 */
export const getSatellitesData = async () => {
    if (satellitesData) return satellitesData;
    let data = await readJSON("./files/satellites.json");
    data = jsonParseD3Data(data);
    satellitesData = data;
    return data;
}