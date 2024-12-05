import { readJSON } from "./utils.js";
import { getBodiesData } from "./bodies.js";

let missionsData = null;
let simlifiedMissionsData = null;
let objectData = null;

/**
 * @return {Array<Object>}
 */
export const getMissionsData = async () => {
    if (missionsData) return missionsData;
    let data = await readJSON("./files/missions.json");
    data = preprocessMissionsData(data);
    missionsData = data;
    return data;
}

const preprocessMissionsData = (data) => {
    // transform launch_data to Date
    data.forEach(d => {
        d.launch_date = new Date(d.launch_date);
    });
    return data;
}

/**
 * @return {Array<Object>}
 * Structure:
 * {
 *  "name": "Mission name",
 *  "origin": {},
 *  "destination": {},
 *  "links": []
 * }
 */
export const getMissionSimplePathData = async () => {
    if (simlifiedMissionsData) return simlifiedMissionsData;
    let data = await getMissionsData();
    objectData = await getBodiesData();
    simlifiedMissionsData = data.map(simplifyMissionsData).filter(d => d !== null);
    return simlifiedMissionsData;
}

const pathToLinks = (path, d) => {
    return path.map((planetName, i) => {
        if (i === 0) return null;
        let source = objectData.find(planet => planet.name === path[i-1]);
        let target = objectData.find(planet => planet.name === planetName);
        return {
            name: d.name,
            origin: source,
            destination: target,
        }
    }).filter(d => d !== null);
}

const simplifyMissionsData = (d) => {    
    if (!d.pieces || d.pieces.length === 0) return null;

    let firstDeepSpacePiece = d.pieces.find(piece => {
        return piece.events.find(event => event.parent === null && event.id.startsWith('D'));
    });
    if (!firstDeepSpacePiece) return null;
    let originObjectName = firstDeepSpacePiece.events[0].primary;
    
    // type starts with P
    let payloads = d.pieces.filter(piece => piece.type.startsWith('P'));
    let payloadPath = payloads.map(
        payload => payload.events.map(event => event.primary)
    );
    // select lengthiest path
    payloadPath = payloadPath.reduce((acc, path) => path.length > acc.length ? path : acc, []);
    payloadPath = simplifyPath(payloadPath);

    if (!payloadPath) return null;
    
    let destinationObjectName = payloadPath[payloadPath.length - 1];
    
    // Filter by the ones I can draw
    let originObject = objectData.find(planet => planet.name === originObjectName);
    let destinationObject = objectData.find(planet => planet.name === destinationObjectName);
    if (!originObject || !destinationObject) return null;

    let origin = {
        name: originObjectName,
        eclR: originObject.eclR,
        eclTheta: originObject.eclTheta
    }

    let destination = {
        name: destinationObjectName,
        eclR: destinationObject.eclR,
        eclTheta: destinationObject.eclTheta
    }

    // get the rest of the attrs
    const { ...rest } = d;

    return {
        "origin": origin,
        "destination": destination,
        "links": pathToLinks(payloadPath, d),
        ...rest
    }
}

const simplifyPath = (path) => {
    if (path.length === 0) return null;
    // delete adjacent duplicates
    let newPath = [];
    for (let i = 0; i < path.length; i++) {
        if (i === 0 || path[i] !== path[i-1]) newPath.push(path[i]);
    }
    let allObj = objectData.map(d => d.name);
    let planets = allObj.filter(name => name !== 'Sun' && name !== 'Earth');
    let earthSun = ['Sun', 'Earth'];
    // if path includes any planet
    if (path.some(p => planets.includes(p))) {
        // remove any Sun appearances and unknown objects
        newPath = path.filter(p => p !== 'Sun');
        newPath = newPath.filter(p => allObj.includes(p));
        // remove any repeated appearances keeping the first
        // as not to draw the return trip or similar
        newPath = newPath.filter((p, i) => newPath.indexOf(p) === i);
       return newPath;
    }
    // if includes any other object than Earth and Sun
    // I can't draw it because I don't have the data yet
    if (path.some(p => !earthSun.includes(p))) return null;
    newPath = newPath.filter((p, i) => newPath.indexOf(p) === i);
    if (newPath.length === 1) return [newPath[0], newPath[0]]; // Earth to Earth
    return newPath; // Earth to Sun
}