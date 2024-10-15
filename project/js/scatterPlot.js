import { getPlanetsData } from "../data/datasets.js";

let svg, g;
// Arbitrary
let width = 800, height=800;
let systemCenter = { x: width / 2, y: height / 2 };
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
        .domain(d3.extent(data, d => d.radius))
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
        .domain(d3.extent(planetsWithoutSun, d => d.distance))
        .range([minDistanceInPixels, maxDistanceInPixels]);
}

/**
 * Initialize module values
 * @param {string} containerId
 * */
export const setup = async (containerId) => {
    // Load the data
    data = await getPlanetsData();
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
        .append('circle')
        .attr('class', 'orbit')
        .attr('r', d => {
            const distance = planetDistanceScale(d.distance);
            return isNaN(distance) ? 0 : distance; // Sun will have Nan, fallback to 0
        })
        .attr('fill', 'none')
        .attr('stroke', '#ccc')
        .attr('stroke-dasharray', '2,2');
}

const drawPlanets = () => {
    g.selectAll('.planet')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'planet')
        .attr('r', d => planetRadiusScale(d.radius))
        .attr('cx', d => {
            const cx = planetDistanceScale(d.distance);
            return isNaN(cx) ? 0 : cx;  // Sun has NaN, fallback to 0
        })
        .attr('cy', 0)  // All planets are in the same y
        .attr('fill', d => d.color)
        .append('title')
        .text(d => d.name);
}
