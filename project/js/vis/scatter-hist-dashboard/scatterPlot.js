import * as globalState from "../utils/globalState.js";
import * as tooltip from "../utils/tooltip.js";
import { Variable } from "../utils/variable.js";

const MARGIN = { left: 80, bottom: 50, top: 10, right: 10 };
const ANIMATION_DURATION = 300;
const MARKER_SIZE = 2;

let svg;

let width, height;

export const draw = async (containerID, fullData, xVariable, yVariable, globalStateSelectionType) => {

    const box = d3.select(containerID).node().getBoundingClientRect();

    if (!width) {
        width = box.width;
        height = box.height;
    }

    // Prepare the data by running variable-specific data preparation functions
    fullData = yVariable.prepareData(xVariable.prepareData(fullData));

    // Get the scales but accounting for the margins
    let x = xVariable.getScale(fullData, width);
    x.range([MARGIN.left, width - MARGIN.right]);

    let y = yVariable.getScale(fullData, height);
    y.range([height - MARGIN.bottom, MARGIN.top]);
    
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

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg.append("g")
        .attr("transform", `translate(0, ${height - MARGIN.bottom})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${MARGIN.left}, 0)`)
        .call(yAxis);

    svg.append("text")
        .attr("x", (width - MARGIN.left) / 2 + MARGIN.left)
        .attr("y", height)
        .attr("dy", "-0.75em")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text(xLabel);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 0)
        .attr("dy", "1.75em")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text(yLabel);

    svg.selectAll("circle")
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
