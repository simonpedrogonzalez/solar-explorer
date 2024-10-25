import { getPlanetsData } from "../data/datasets.js";

const rad = Math.PI / 180;

let svg, g;
// Arbitrary
let width = 800, height=800;
let systemCenter = { x: width / 2, y: height / 2 };
let rawData;
let data;
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
        .attr('transform', `translate(${systemCenter.x}, ${systemCenter.y})`);
}

/**
 * Draw the solar system map
 * */
export const draw = () => {
    drawOrbits();
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
    const time = (new Date().getTime()/86400000 + 2440587.5 - 2451545.0)/36525.0;
    const a = d.a_0 + d.a_dot * time; // Semi-major axis
    const e = 0; //d.e_0 + d.e_dot * time; // Eccentricity
    const b = a*Math.sqrt(1 - Math.pow(e, 2)); // Semiminor axis
    const incl = 0; //d.incl_0 + d.incl_dot * time; // Inclination
    let Omega =  (d.Omega_0 + d.Omega_dot * time) % 360.0; // Longitude of the ascending node
    let w = d.w_0 + d.w_dot * time; // Argument of perihelion
    const P = d.P_0 + d.P_dot * time; // Orbital period (centuries)
    let M = ((d.M_0 + d.M_dot * time) % 360.0) * rad;
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
