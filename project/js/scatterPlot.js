import { oldPlanetsData } from "../data/datasets.js";

let svg, g;
// Arbitrary
let width = 800, height=800;
let systemCenter = { x: width / 2, y: height / 2 };
let data;
let planetRadiusScale, planetDistanceScale;

const CHART_WIDTH = 500;
const CHART_HEIGHT = 250;
const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
const ANIMATION_DURATION = 300;


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
    data = await oldPlanetsData();
    // exclude sun
    data = data.filter(d => d.name !== 'Sun');
    // Create the scales
    planetRadiusScale = getPlanetRadiusScale(data);
    planetDistanceScale = getPlanetDistanceScale(data);
    // Create the SVG container
    svg = d3.select(containerId)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    // Create a group for the solar system, this is the 'plot' object
    g = svg.append('g');
        // .attr('transform', `translate(${systemCenter.x}, ${systemCenter.y})`);
}

/**
 * Draw the solar system map
 * */
export const draw = () => {

    drawScatterPlot();
}

const drawScatterPlot = () => {

    let xScale = planetDistanceScale;
    let yScale = planetRadiusScale;

    let circle = g
    .selectAll('circle')
    .data(data);
  
    circle.exit()
    .attr('r', 0)
    .remove();
  
    const enterCircle = circle
    .enter()
    .append('circle')
    .attr('r', 0)
    .attr('cx', d => function(d) {
        console.log(d.distance);
        return planetDistanceScale(d.distance) + MARGIN.left
    })
    .attr('cy', d => planetRadiusScale(d.radius) + MARGIN.top)
    .attr('r', 5);
  
  
    circle = circle.merge(enterCircle)
    .attr('cx', d => xScale(d.cases) + MARGIN.left)
    .attr('cy', d => yScale(d.deaths) + MARGIN.top)
    .attr('r', 5)
  
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
  
    g
    .select('.x-axis')
    .call(xAxis);
  
    g
    .select('.y-axis')
    .call(yAxis);

}

