import { getPlanetsData, getMissionsData } from "../data/datasets.js";
import { calculatePlanetPosition } from "./astronomyUtils.js";

const rad = Math.PI / 180;

let svg, g;
// Arbitrary
let width = 1600, height=800;
let systemCenter = { x: width / 2, y: height / 2 };
let rawData;
let data;
let missionsData;
let planetRadiusScale, planetDistanceScale;

/**
 * Create log scale for the radius of the planets
 * @param {Array<Object>} data
 * @return {d3.ScaleLogarithmic<number, number>}
 * */
const getPlanetRadiusScale = (data) => {
    // Arbitrary
    const maxRadiusInPixels = Math.min(width, height) / 30;
    // Arbitrary
    const minRadiusInPixels = maxRadiusInPixels / 10;
    return d3.scaleLog()
        .domain(d3.extent(data, d => d.radius === 0? 1: d.radius))
        .range([minRadiusInPixels, maxRadiusInPixels]);
}

/**
 * Create log scale for the distance of the planets from the Sun
 * @param {Array<Object>} data
 * @return {d3.ScaleLogarithmic<number, number>}
 * */
const getPlanetDistanceScale = (data) => {
    // Arbitrary
    const planetsWithoutSun = data.filter(d => d.name !== 'Sun');
    const maxDistanceInPixels = Math.min(width, height) / 2 * 0.9;
    const minDistanceInPixels = 50;
    return d3.scaleLog()
        .domain(d3.extent(planetsWithoutSun, d => d.a))
        .range([minDistanceInPixels, maxDistanceInPixels]);
}

/**
 * Initialize module values
 * @param {string} containerId
 * */
export const setup = async (containerId) => {
    // Load the data
    rawData = await getPlanetsData();
    data = rawData.map(calculatePlanetPosition);
    missionsData = await getMissionsData();
    missionsData = missionsData.map(simplifyMissionsData).filter(d => d !== null);
    // Create the scales
    planetRadiusScale = getPlanetRadiusScale(data);
    planetDistanceScale = getPlanetDistanceScale(data);
    // Create the SVG container
    svg = d3.select(containerId)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    // Create a group for the solar system, this is the 'plot' object
    g = svg.append('g')
        .attr('id', 'solar-system-map')
        .attr('transform', `translate(${systemCenter.x}, ${systemCenter.y})`);

    // Define the zoom behavior
    const zoom = d3.zoom()
    .scaleExtent([0.5, 5])
    .on("zoom", (event) => {
    g.attr("transform", event.transform);
    });
    svg.call(zoom);
    d3.select("#reset-zoom").on("click", () => {
    svg.transition()
    .duration(750)
    .call(zoom.transform, d3.zoomIdentity);
    });
}

/**
 * Draw the solar system map
 * */
export const draw = async () => {
    drawOrbits();
    drawMissionPaths(); // this first to be behind the planets
    drawPlanets();
}

const drawOrbits = () => {
    g.selectAll('.orbit')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', d => `rotate(${(d.Omega + d.w) % 360})`)
        .append('ellipse')
        .attr('class', 'orbit')
        .attr('rx', d => {
            const distance = planetDistanceScale(d.b);
            return (isNaN(distance) || distance < 0) ? 0 : distance; // Sun will have Nan, fallback to 0
        })
        .attr('ry', d => {
            const distance = planetDistanceScale(d.a);
            return (isNaN(distance) || distance < 0) ? 0 : distance; // Sun will have Nan, fallback to 0
        })
        .attr('fill', 'none')
        .attr('stroke', '#ccc')
        .attr('stroke-dasharray', '2,2');
}

const calculatePlanetPosition = (d) => {
    // Get UNIX time, convert to Julian date, and then subtract J2000 (2451545.0) and convert to centuries
    const time = (new Date().getTime()/86400000 + 2440587.5 - 2451545.0)/100.0;
    const a = d.a_0 + d.a_dot * time; // Semi-major axis
    const e = 0; //d.e_0 + d.e_dot * time; // Eccentricity
    const b = a*Math.sqrt(1 - Math.pow(e, 2)); // Semiminor axis
    const incl = 0; //d.incl_0 + d.incl_dot * time; // Inclination
    let Omega =  (d.Omega_0 + d.Omega_dot * time) % 360.0; // Longitude of the ascending node
    // const
    console.log("Ω", d.name, Omega, d.curr_Omega);
    Omega = d.curr_Omega;
    let w = d.w_0 + d.w_dot * time; // Argument of perihelion
    // const
    console.log("ω", d.name, w, d.curr_w);
    w = d.curr_w;
    const Tp = ((d.Tp_0 + d.Tp_dot * time) - 2451545.0) / 100.0; // Time of perihelion passage
    const P = (d.P_0 + d.P_dot * time) / 36525.0; // Orbital period (centuries)
    const n = (d.n_0 + d.n_dot * time); // Mean motion
    // let M = (((((time - Tp)%P) * n) % 360.0 + 360.0) % 360.0 * Math.PI / 180); // Mean anomaly 0 to 2π
    let M = d.curr_M * rad;
    if (M > Math.PI) M -= 2*Math.PI; // Mean anomaly -π to π

    let E = M + e * Math.sin(M);
    let delE = 1;
    while (Math.abs(delE) > 1e-6) {
        let delM = M - (E - e * Math.sin(E));
        delE = delM / (1 - e * Math.cos(E));
        E = E + delE;
    }
    const orbX = a * (Math.cos(E) - e);
    const orbY = b * Math.sin(E);



    const eclR = Math.sqrt(Math.pow(orbX, 2) + Math.pow(orbY, 2));
    const eclTheta = -(Math.atan2(orbY, orbX) + w*rad + Omega*rad);

    return {
        id: d.id,
        name: d.name,
        color: d.color,
        radius: d.radius,
        rotperiod: d.rotperiod,
        mass: d.mass,
        primary: d.primary,
        a: a,
        b: b,
        e: e,
        incl: incl,
        Omega: Omega,
        w: w,
        Tp: Tp,
        P: P,
        eclR: eclR,
        eclTheta: eclTheta,
    }
}

const drawPlanets = () => {
    g.selectAll('.planet')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'planet')
        .attr('r', d => planetRadiusScale(d.radius))
        .attr('cx', d => {
            const r = planetDistanceScale(d.eclR);
            if (isNaN(r) || r < 0) return 0;  // Sun has NaN, fallback to 0
            return r * Math.cos(d.eclTheta);
        })
        .attr('cy', d => {
            const r = planetDistanceScale(d.eclR);
            if (isNaN(r) || r < 0) return 0;  // Sun has NaN, fallback to 0
            return r * Math.sin(d.eclTheta);
        })
        .attr('fill', d => d.color)
        .append('title')
        .text(d => d.name);
}

const simplifyPath = (path) => {
    if (path.length === 0) return null;
    // delete adjacent duplicates
    let newPath = [];
    for (let i = 0; i < path.length; i++) {
        if (i === 0 || path[i] !== path[i-1]) newPath.push(path[i]);
    }
    let allObj = data.map(d => d.name);
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

const pathToLinks = (path, d) => {
    return path.map((planetName, i) => {
        if (i === 0) return null;
        let source = data.find(planet => planet.name === path[i-1]);
        let target = data.find(planet => planet.name === planetName);
        return {
            name: d.name,
            origin: source,
            destination: target
        }
    }).filter(d => d !== null);
}

const simplifyMissionsData = (d) => {    
    if (!d.pieces || d.pieces.length === 0) return null;
    // find the first piece that has an event with parent null and id deepspace (starts with D)
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
    console.log("Mission", d.name, originObjectName, destinationObjectName);
    console.log(payloadPath);

    // Filter by the ones I can draw
    let originObject = data.find(planet => planet.name === originObjectName);
    let destinationObject = data.find(planet => planet.name === destinationObjectName);
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

    return {
        "name": d.name,
        "origin": origin,
        "destination": destination,
        "links": pathToLinks(payloadPath, d)
    }
}

const drawMissionPaths = (type) => {

    // Flatten all mission paths
    let allLinks = missionsData.reduce((acc, d) => {
        acc.push(...d.links);
        return acc;
    }, []);

    let linksPerSourceDestPair = allLinks.reduce((acc, d) => {
        const key = `${d.origin.name}-${d.destination.name}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(d);
        return acc;
    }, {});

    const missionsPerSourceDestPair = missionsData.reduce((acc, d) => {
        const key = `${d.origin.name}-${d.destination.name}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(d.name);
        return acc;
    }, {});

    if (type === 'sourceDest') {
        linksPerSourceDestPair = missionsPerSourceDestPair;
        allLinks = missionsData;
    }

    // draw a line from origin to destination
 g.selectAll('.mission')
    .data(allLinks)
    .enter()
    .append('path') // Use 'path' for curves
    .attr('class', 'mission')
    .attr('d', (d, i) => {
        // The idea is to create bezier curves from origin to destination, making
        // the curve more pronounced with increasing mission count with the same
        // origin and destination. For the same origin and destination, there are
        // two "ears" of missions, one on the right and one on the left.
        // The separation between the curves is controller by the number of missions
        // more missions = less separation so that they dont occupy too much space

        if (!linksPerSourceDestPair[`${d.origin.name}-${d.destination.name}`]) {
            console.error("No links for", d.origin.name, d.destination.name);
            return "";
        }
        const pairMissions = linksPerSourceDestPair[`${d.origin.name}-${d.destination.name}`];
        const missionCount = pairMissions.length;
        const halfMissionCount = Math.floor(missionCount / 2);
        
        // if elements of pairMissions are string, directly search
        let indexInMissionsPerSource = null;
        if (pairMissions[0].constructor === String) {
            indexInMissionsPerSource = pairMissions.indexOf(d.name);
        } else {
            indexInMissionsPerSource = pairMissions.findIndex(m => m.name === d.name);
        }
        
        const maxWdithForLineGroup = 40;
        const separation = Math.min(maxWdithForLineGroup / halfMissionCount, 5);
        const rightOrLeft = indexInMissionsPerSource % 2 === 0 ? 1 : -1;
        const indexInMissionsPerSourceHalf = Math.abs(indexInMissionsPerSource - halfMissionCount);

        // Calculate origin and destination points
        const r1 = planetDistanceScale(d.origin.eclR);
        let x1 = r1 * Math.cos(d.origin.eclTheta);
        let y1 = r1 * Math.sin(d.origin.eclTheta);
        const r2 = planetDistanceScale(d.destination.eclR);
        let x2 = r2 * Math.cos(d.destination.eclTheta);
        let y2 = r2 * Math.sin(d.destination.eclTheta);

        // if any is Sun, set system center as the origin
        if (d.origin.name === 'Sun') {
            x1 = 0
            y1 = 0
        }
        if (d.destination.name === 'Sun') {
            x2 = 0
            y2 = 0
        }

        if (d.origin.name === d.destination.name) {
            
            // Define starting offsets for control points
            const radiusOfSource = planetRadiusScale(data.find(planet => planet.name === d.origin.name).radius);
            const startingOffset = radiusOfSource + 2; // Starting offset for the control points

            // Calculate the control points based on the index
            const offset = (startingOffset + indexInMissionsPerSourceHalf * separation) * rightOrLeft;
        
            // Control points
            const upperControlX = x1 + offset; // Right side control point for upper triangle vertex
            const upperControlY = y1 - offset; // Go higher for upper vertex
        
            const lowerControlX = x1 + offset; // Right side control point for lower triangle vertex
            const lowerControlY = y1 + offset; // Go lower for lower vertex
        
            // Create a quadratic Bezier curve with two control points
            return `M${x1},${y1} C${upperControlX},${upperControlY}
                    ${lowerControlX},${lowerControlY} ${x2},${y2}`;
        }

        // Calculate the direction vector from origin to destination
        const dx = x2 - x1;
        const dy = y2 - y1;
        // Calculate the length of the distance
        const length = Math.sqrt(dx * dx + dy * dy);
        // Get unit vectors
        const unitDx = dx / length;
        const unitDy = dy / length;
        // Create the perpendicular vector
        const perpDx = -unitDy;
        const perpDy = unitDx;

        // Calculate the offset
        const offsetMagnitude = indexInMissionsPerSourceHalf * separation * rightOrLeft;
        const offsetX = perpDx * offsetMagnitude;
        const offsetY = perpDy * offsetMagnitude;
        const cx = (x1 + x2) / 2 + offsetX;
        const cy = (y1 + y2) / 2 + offsetY;
        
        // Create the curve
        return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;        
    })
    .attr('fill', 'none')
    .attr('stroke', 'red')
    .attr('stroke-opacity', 0.5)
    .attr('stroke-width', 1)
    .append('title')
    .text(d => d.name);
}

