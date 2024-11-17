import { getBodiesData, getMissionSimplePathData, getMissionsData, getPlanetsData } from "../../data/datasets.js";
import { calculatePlanetPosition2, calculatePlanetPosition } from "../utils/astro.js";
import { dateToFractionalYear, fractionalYearToDate } from "../utils/time.js";
import { updateBodiesVisData } from "./bodies.js";

let svg, g;
let width = window.innerWidth, height=window.innerHeight - 200;
let systemCenter = { x: width / 2, y: height / 2 };
let bodiesData;
let planetsData;
let missionsData;
let planetRadiusScale, planetDistanceScale;
let date = new Date();

/**
 * Initialize module
 * @param {string} containerId
 * */
export const setup = async (containerId) => {
    // Load the data
    bodiesData = await getBodiesData();
    
    // TODO: remove this line when Pluto data is available
    bodiesData = bodiesData.filter(d => d.primary !== 'Pluto');

    planetsData = await getPlanetsData();

    bodiesData = updatePlanetPositions(bodiesData, date);
    missionsData = await getMissionSimplePathData();
    // Create the scales
    planetRadiusScale = getPlanetRadiusScale(bodiesData);
    planetDistanceScale = getPlanetDistanceScale(bodiesData);
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

    // Create the time slider
    d3.select("#timeslider-text").text(date.toDateString());
    d3.select("#timeslider input")
        .attr("value", dateToFractionalYear(date))
        .on("input", (event) => {
            date = fractionalYearToDate(event.target.value);
            d3.select("#timeslider-text").text(date.toDateString());
            bodiesData = updatePlanetPositions(bodiesData, date);
            const filteredMissionsData = missionsData.filter(d => d.launch_date <= date);
            draw(bodiesData, filteredMissionsData);
        });

    draw(bodiesData, missionsData);
}

/**
 * Draw the solar system map
 * */
export const draw = async (bodiesData, missionsData) => {
    bodiesData = updateBodiesVisData(bodiesData, planetDistanceScale, planetRadiusScale);
    drawBodiesOrbits(bodiesData.filter(d => d.type !== 'satellite'));
    // drawMissionPaths(missionsData, bodiesData, "fullPath"); // this first to be behind the planets
    drawBodies(bodiesData.filter(d => d.type !== 'satellite'));
}

const drawBodiesOrbits = (data) => {
    g.selectAll('.orbit')
        .data(data.filter(d => d.name !== 'Sun'))
        .enter()
        .append('g')
        .attr('transform', d => {
            console.log(d.name, d.vis);
            return d.vis.orbit.rotation
        })
        .append('ellipse')
        .attr('class', 'orbit')
        .attr('rx', d => d.vis.orbit.rx)
        .attr('ry', d => d.vis.orbit.ry)
        .attr('fill', 'none')
        .attr('stroke', '#ccc')
        .attr('stroke-dasharray', '2,2');
}

const drawBodies = (data) => {
    g.selectAll('.body')
        .data(data)
        .join("circle")
        .attr('class', 'body')
        .attr('r', d => d.vis.body.r)
        .attr('cx', (d) => {
            if (d.name === 'Neptune') {
                console.log(d.name, d.radial_distance_from_primary, d.angular_position_in_ecliptic, d.vis.body.cx);
            }
            return d.vis.body.cx;
        })
        .attr('cy', d => d.vis.body.cy)
        .attr('fill', d => d.color)
        .append('title')
        .text(d => d.name);
}

const drawMissionPaths = (missionsData, bodiesData, type) => {

    // Flatten all mission paths
    let allLinks = missionsData.reduce((acc, d) => {
        acc.push(...d.links);
        return acc;
    }, []);

    // Update the origin and destination eclR and eclTheta based on bodiesData
    allLinks = allLinks.map(d => {
        const origin = bodiesData.find(planet => planet.name === d.origin.name);
        const destination = bodiesData.find(planet => planet.name === d.destination.name);
        return {
            ...d,
            origin: {
                ...d.origin,
                eclR: origin.eclR,
                eclTheta: origin.eclTheta
            },
            destination: {
                ...d.destination,
                eclR: destination.eclR,
                eclTheta: destination.eclTheta
            }
        }
    });

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

    const drawBezierCurves = (d, i) => {
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

        const maxWidthForLineGroup = 40;
        const separation = Math.min(maxWidthForLineGroup / halfMissionCount, 5);
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
            const radiusOfSource = planetRadiusScale(bodiesData.find(planet => planet.name === d.origin.name).radius);
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
    }

    g.selectAll('path.mission')
        .data(allLinks)
        .attr('d', drawBezierCurves);

    g.selectAll('.mission')
    .data(allLinks, d => d.name) // Use a "key function" for unique identifiers
    .join(
        enter => enter.append('path')
                    .attr('class', 'mission')
                    .attr('d', drawBezierCurves)
                    .attr('fill', 'none')
                    .attr('stroke', 'red')
                    .attr('stroke-opacity', 0.5)
                    .attr('stroke-width', 1)
                    .append('title')
                    .text(d => d.name),
        update => update,
        exit => exit.remove()
    );
}

/**
 * Create log scale for the radius of the planets
 * @param {Array<Object>} data
 * @return {d3.ScaleLogarithmic<number, number>}
 * */
const getPlanetRadiusScale = (data) => {
    const maxRadiusInPixels = Math.min(width, height) / 30;
    const minRadiusInPixels = maxRadiusInPixels / 10;
    data = data.filter(d => d.type === 'planet' || d.type === 'star');
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
    const planetsWithoutSun = data.filter(d => d.type === 'planet');
    const maxDistanceInPixels = Math.min(width, height) / 2 * 0.9;
    const minDistanceInPixels = 40;
    return d3.scaleLog()
        .domain(d3.extent(planetsWithoutSun, d => d.semi_major_axis))
        .range([minDistanceInPixels, maxDistanceInPixels]);
}


const updatePlanetPositions = (data, date) => {
    data.filter(d => d.type == 'planet' || d.type == 'star').forEach((d, i) => {
        const newOrbitalParameters = calculatePlanetPosition2(d, date);
        // console.log(planetsData[i].name, d.name);
        // const newOrbitalParametersOld = calculatePlanetPosition(planetsData[i], date);
        // compareOrbitalParameters(newOrbitalParametersOld, newOrbitalParameters);
        // Object.assign(planetsData[i], newOrbitalParametersOld);
        Object.assign(d, newOrbitalParameters);
    });
    return data;
}

// const compareOrbitalParameters = (d1, d2) => {
//     if (d1.a !== d2.semi_major_axis) {
//         console.error("Semi-major axis mismatch", d1.a, d2.semi_major_axis);
//     }
//     if (d1.b !== d2.semi_minor_axis) {
//         console.error("Semi-minor axis mismatch", d1.b, d2.semi_minor_axis);
//     }
//     if (d1.e !== d2.eccentricity) {
//         console.error("Eccentricity mismatch", d1.e, d2.eccentricity);
//     }
//     if (d1.incl !== d2.inclination) {
//         console.error("Inclination mismatch", d1.incl, d2.inclination);
//     }
//     if (d1.Omega !== d2.longitude_of_ascending_node) {
//         console.error("Longitude of ascending node mismatch", d1.Omega, d2.longitude_of_ascending_node);
//     }
//     if (d1.w !== d2.argument_of_periapsis) {
//         console.error("Argument of periapsis mismatch", d1.w, d2.argument_of_periapsis);
//     }
//     if (d1.P !== d2.orbital_period) {
//         console.error("Orbital period mismatch", d1.P, d2.orbital_period);
//     }
//     if (d1.eclR !== d2.radial_distance_from_primary) {
//         console.error("Radial distance mismatch", d1.eclR, d2.radial_distance_from_primary);
//     }
//     if (d1.eclTheta !== d2.angular_position_in_ecliptic) {
//         console.error("Angular position mismatch", d1.eclTheta, d2.angular_position_in_ecliptic);
//     }
// }