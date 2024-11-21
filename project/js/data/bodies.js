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
        Moon: 'rgb(169, 169, 169)',
        Phobos: 'rgb(184, 115, 51)',
        Deimos: 'rgb(184, 115, 51)',
        Io: 'rgb(255, 165, 79)',
        Europa: 'rgb(250, 250, 210)',
        Ganymede: 'rgb(152, 118, 84)',
        Callisto: 'rgb(105, 105, 105)',
        Titan: 'rgb(255, 140, 0)',
        Enceladus: 'rgb(255, 255, 255)',
        Mimas: 'rgb(192, 192, 192)',
        Tethys: 'rgb(211, 211, 211)',
        Dione: 'rgb(240, 240, 240)',
        Rhea: 'rgb(220, 220, 220)',
        Iapetus: 'rgb(96, 96, 96)',
        Hyperion: 'rgb(210, 180, 140)',
        Miranda: 'rgb(176, 196, 222)',
        Ariel: 'rgb(224, 224, 224)',
        Umbriel: 'rgb(128, 128, 128)',
        Titania: 'rgb(169, 169, 169)',
        Oberon: 'rgb(169, 169, 169)',
        Triton: 'rgb(176, 224, 230)',
        Nereid: 'rgb(192, 192, 192)',
        Charon: 'rgb(178, 190, 181)',
        Hydra: 'rgb(200, 200, 200)',
        Nix: 'rgb(225, 225, 225)',
        Kerberos: 'rgb(150, 150, 150)',
        Styx: 'rgb(210, 210, 210)'
    };
    if(colorMap[world.name]) {
        return colorMap[world.name];
    } else {
        return 'rgb(200, 200, 200)';
    }
}