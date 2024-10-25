import { getPlanetsData, getMissionsData } from "../data/datasets.js";
import { calculatePlanetPosition2 } from "./astronomyUtils.js";

const rad = Math.PI / 180;

let svg, g;
// Arbitrary
let width = 800, height=800;
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
}

/**
 * Draw the solar system map
 * */
export const draw = async () => {
    drawOrbits();
    drawPlanets();
    drawMissionPaths();
    // await drawMissionPaths2();
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



    let eclR = Math.sqrt(Math.pow(orbX, 2) + Math.pow(orbY, 2));
    let eclTheta = -(Math.atan2(orbY, orbX) + w*rad + Omega*rad);

    const otherResult = calculatePlanetPosition2(d);

    // if (d.name == "Earth") {
    //     console.log("Earth", d, otherResult);
    // }
    // eclR = otherResult.eclR;
    // eclTheta = otherResult.eclTheta;




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

// const drawMissionPaths2 = async () => {
//     const nodes = data.map(d => ({
//             id: d.name,
//             name: d.name,
//             cx: planetDistanceScale(d.eclR) * Math.cos(d.eclTheta),
//             cy: planetDistanceScale(d.eclR) * Math.sin(d.eclTheta),
//             width: planetRadiusScale(d.radius*2),
//             height: planetRadiusScale(d.radius*2),
//             group: 1,
//     }));
//     const links = missionsData.map(d => ({
//         source: d.origin.name,
//         target: d.destination.name,
//         value: d.name,
//     }));

//     console.log("nodes", nodes);

    
//     const simulation = d3.forceSimulation(nodes)
//         .force('link', d3.forceLink().id(d => d.id).distance(50)) // Link force configuration
//         .force('charge', d3.forceManyBody().strength(-100)) // Adjust charge strength as needed
//         .force('center', d3.forceCenter(systemCenter.x, systemCenter.y)); // Center of the system

//     // Draw the links
// const link = g.selectAll('.link')
// .data(links)
// .enter().append('path') // Using 'path' instead of 'line'
// .attr('class', 'link')
// .attr('fill', 'none')
// .attr('stroke', 'red') // Set stroke for visibility
// .attr('stroke-opacity', 0.5)
// .attr('stroke-width', 0.1)
// // Add a title for the tooltip
// // .append('title')
// // .text(d => d.value);


// // Update the path data on each tick
// simulation.on('tick', () => {
// link.attr('d', function(d) {
//     // Find the corresponding source and target nodes
//     const sourceNode = d.source;
//     const targetNode = d.target;

//     if (sourceNode && targetNode) {
//         // Calculate the distance and draw the path
//         const dx = targetNode.cx - sourceNode.cx;
//         const dy = targetNode.cy - sourceNode.cy;
//         const dr = Math.sqrt(dx * dx + dy * dy);
//         return `M${sourceNode.cx},${sourceNode.cy}A${dr},${dr} 0 0,1 ${targetNode.cx},${targetNode.cy}`;
//     } else {
//         console.error("Source or target node not found:", d);
//         return ""; // Return an empty path if the nodes are not found
//     }
// });

// // Update the node positions
// node.attr('transform', d => `translate(${d.cx}, ${d.cy})`);
// });



//     // Draw the nodes
//     const node = g.selectAll('.node')
//         .data(nodes)
//         .enter().append('g')
//         .attr('class', 'node')
//         .attr('transform', d => `translate(${d.cx}, ${d.cy})`);

//     node.append('circle')
//         .attr('r', d => d.width)
//         .attr('fill', 'blue');

//     // Add labels if needed
//     node.append('text')
//         .attr('dy', -3)
//         .attr('dx', 12)
//         // white text
//         .attr('fill', 'white')
//         .text(d => d.name);

    // Update positions on each tick
    // simulation.on('tick', () => {
    //     // Update link positions
    //     link.attr('x1', d => nodes.find(n => n.id === d.source).cx)
    //         .attr('y1', d => nodes.find(n => n.id === d.source).cy)
    //         .attr('x2', d => nodes.find(n => n.id === d.target).cx)
    //         .attr('y2', d => nodes.find(n => n.id === d.target).cy);

    //     // Update node positions
    //     node.attr('transform', d => `translate(${d.cx}, ${d.cy})`);
    // });

//     // Start the simulation
//     simulation.force("link").links(links);
//     // stop the simulation after 1
//     await new Promise(resolve => setTimeout(resolve, 1000));
// }



const simplifyMissionsData = (d) => {
    if (!d.events || d.events.length === 0) return null;
    let originObjectName = d.events[0].primary;
    let originObject = data.find(planet => planet.name === originObjectName);
    if (!originObject) return null;
    let destinationObjectName = d.events[d.events.length - 1].primary;
    let destinationObject = data.find(planet => planet.name === destinationObjectName);
    if (!destinationObject) return null;

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
        "destination": destination
    }
}

const drawMissionPaths = () => {

    const missionsPerSourceDestPair = missionsData.reduce((acc, d) => {
        const key = `${d.origin.name}-${d.destination.name}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(d.name);
        return acc;
    }, {});

    // remove self missions
    // missionsData = missionsData.filter(d => d.origin.name !== d.destination.name);

    // draw a line from origin to destination
 g.selectAll('.mission')
    .data(missionsData)
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

        const missionCount = missionsPerSourceDestPair[`${d.origin.name}-${d.destination.name}`].length;
        const halfMissionCount = Math.floor(missionCount / 2);
        const indexInMissionsPerSource = missionsPerSourceDestPair[`${d.origin.name}-${d.destination.name}`].indexOf(d.name);
        const maxWdithForLineGroup = 40;
        const separation = Math.min(maxWdithForLineGroup / halfMissionCount, 5);
        const rightOrLeft = indexInMissionsPerSource % 2 === 0 ? 1 : -1;
        const indexInMissionsPerSourceHalf = Math.abs(indexInMissionsPerSource - halfMissionCount);

        // Calculate origin and destination points
        const r1 = planetDistanceScale(d.origin.eclR);
        const x1 = r1 * Math.cos(d.origin.eclTheta);
        const y1 = r1 * Math.sin(d.origin.eclTheta);
        const r2 = planetDistanceScale(d.destination.eclR);
        const x2 = r2 * Math.cos(d.destination.eclTheta);
        const y2 = r2 * Math.sin(d.destination.eclTheta);

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

