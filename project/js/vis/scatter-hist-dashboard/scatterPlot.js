import * as globalState from "../utils/globalState.js";
import * as tooltip from "../utils/tooltip.js";
import { addZoom } from "./zoom.js";

const MARGIN = { left: 80, bottom: 50, top: 10, right: 10 };
const ANIMATION_DURATION = 300;
const MARKER_SIZE = 3;

let svg, g;

let width, height;

export const draw = async (containerID, fullData, xVariable, yVariable, globalStateSelectionType, resetZoomButtonID) => {

    const box = d3.select(containerID).node().getBoundingClientRect();

    if (!width) {
        width = box.width;
        height = box.height;
    }

    // Prepare the data by running variable-specific data preparation functions
    fullData = yVariable.prepareData(xVariable.prepareData(fullData));

    // Get the scales but accounting for the margins
    let x = xVariable.getScale(fullData, width - MARGIN.left - MARGIN.right);
    x.range([0, width - MARGIN.left - MARGIN.right]);

    let y = yVariable.getScale(fullData, height - MARGIN.top - MARGIN.bottom);
    y.range([height - MARGIN.top - MARGIN.bottom, 0]);
    
    let xSelector = xVariable.selector;
    let ySelector = yVariable.selector;
    let xLabel = xVariable.label;
    let yLabel = yVariable.label;

    // Clear the existing visualization
    d3.select(containerID).selectAll("*").remove();

    svg = d3.select(containerID)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    g = svg.append("g")
        .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

    const zoomCenter = { x: width / 2 - MARGIN.left, y: height / 2 - MARGIN.top };
    addZoom(svg, g, width, height, zoomCenter, resetZoomButtonID);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    // Append axes to the <g> container
    g.append("g")
        .attr("transform", `translate(0, ${height - MARGIN.top - MARGIN.bottom})`)
        .call(xAxis);

    g.append("g")
        .call(yAxis);

    // Add axis labels
    g.append("text")
        .attr("x", width / 2) // Centered within the inner plotting area
        .attr("y", height - MARGIN.bottom + 30) // Below the x-axis
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text(xLabel);

    g.append("text")
        .attr("x", -(height-MARGIN.bottom) / 2) // Centered within the inner plotting area
        .attr("y",  MARGIN.left - 130) // Left of the y-axis
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text(yLabel);


    // Plot data points inside the <g> container
    g.selectAll("circle")
        .data(fullData)
        .join("circle")
        .attr("cx", d => x(d[xSelector]))
        .attr("cy", d => y(d[ySelector]))
        .on("mouseenter", (event, d) => {
            const content = tooltip.textParser.getTextFromVariables(d, xVariable, yVariable);
            tooltip.onMouseEnter(content);
        })
        .on("mousemove", (event) => tooltip.onMouseMove(event))
        .on("mouseleave", tooltip.onMouseLeave)
        .transition()
        .duration(ANIMATION_DURATION)
        .attr("r", MARKER_SIZE)
        .attr("fill", d => globalState.isObjectSelected(d, globalStateSelectionType) ? "red" : "steelblue");
}
