import * as globalState from "../utils/globalState.js";
import * as tooltip from "../utils/tooltip.js";

const MARGIN = { left: 80, bottom: 50, top: 10, right: 10 };
const ANIMATION_DURATION = 300;
const MARKER_SIZE = 2;

let svg;

let width, height;

export const draw = async (containerID, fullData, xSelector, ySelector, xLabel, yLabel, xScale, yScale, tooltipTextType, globalStateSelectionType) => {
    console.log("tooltipTextType", tooltipTextType);
    console.log("globalStateSelectionType", globalStateSelectionType);
    const box = d3.select(containerID).node().getBoundingClientRect();

    if (!width) {
        width = box.width;
        height = box.height;
    }
    
    if (xScale === "log") {
        fullData = fullData.filter(d => d[xSelector] > 0);
    }

    if (yScale === "log") {
        fullData = fullData.filter(d => d[ySelector] > 0);
    }

    // Clear the existing visualization
    d3.select(containerID).selectAll("*").remove();

    svg = d3.select(containerID)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    let x;
    switch (xScale) {
        case "linear":
            x = d3.scaleLinear()
                .domain([d3.min(fullData, d => d[xSelector]), d3.max(fullData, d => d[xSelector])])
                .range([MARGIN.left, width - MARGIN.right]);
            break;
        case "log":
            x = d3.scaleLog()
                .domain([d3.min(fullData, d => d[xSelector] > 0 ? d[xSelector] : undefined), d3.max(fullData, d => d[xSelector])])
                .range([MARGIN.left, width - MARGIN.right]);
            break;
        case "time":
            fullData.forEach(d => d[xSelector] = new Date(d[xSelector]));
            x = d3.scaleTime()
                .domain([d3.min(fullData, d => d[xSelector]), d3.max(fullData, d => d[xSelector])])
                .range([MARGIN.left, width - MARGIN.right]);
            break;
    }

    let y;
    switch (yScale) {
        case "linear":
            y = d3.scaleLinear()
                .domain([d3.min(fullData, d => d[ySelector]), d3.max(fullData, d => d[ySelector])])
                .range([height - MARGIN.bottom, MARGIN.top]);
            break;
        case "log":
            y = d3.scaleLog()
                .domain([d3.min(fullData, d => d[ySelector] > 0 ? d[ySelector] : undefined), d3.max(fullData, d => d[ySelector])])
                .range([height - MARGIN.bottom, MARGIN.top]);
            break;
        case "time":
            fullData.forEach(d => d[ySelector] = new Date(d[ySelector]));
            y = d3.scaleTime()
                .domain([d3.min(fullData, d => d[ySelector]), d3.max(fullData, d => d[ySelector])])
                .range([height - MARGIN.bottom, MARGIN.top]);
            break;
    }

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    // console.log("xAxis", xAxis);

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
            const content = tooltip.textParser.getTextFromType(d, tooltipTextType, xSelector, ySelector);
            tooltip.onMouseEnter(content);
        })
        .on("mousemove", (event) => tooltip.onMouseMove(event))
        .on("mouseleave", tooltip.onMouseLeave)
        .transition()
        .duration(ANIMATION_DURATION)
        .attr("r", MARKER_SIZE)
        .attr("fill", d => globalState.isObjectSelected(d, globalStateSelectionType) ? "red" : "steelblue");
}
