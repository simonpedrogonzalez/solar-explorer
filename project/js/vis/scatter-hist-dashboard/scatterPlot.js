import { updateGlobalStateObjectSelection, isObjectSelected } from "../utils/globalState.js";
import { tooltipOnMouseEnter, tooltipOnMouseLeave, tooltipOnMouseMove } from "../utils/toolTips.js";

const MARGIN = { left: 80, bottom: 50, top: 10, right: 10 };
const ANIMATION_DURATION = 300;
const MARKER_SIZE = 2;

let svg;

let width, height;

export const draw = async (containerID, fullData, xSelector, ySelector, xLabel, yLabel, xScale, yScale, dataType) => {
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


    let xData = fullData.map(d => d[xSelector]);
    let yData = fullData.map(d => d[ySelector]);

    // Clear the existing visualization
    d3.select(containerID).selectAll("*").remove();

    svg = d3.select(containerID)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    let x;
    switch(xScale) {
        case "linear":
            x = d3.scaleLinear()
                .domain([d3.min(xData), d3.max(xData)])
                .range([MARGIN.left, width - MARGIN.right]);
            break;
        case "log":
            x = d3.scaleLog()
                .domain([d3.min(xData.filter((x) => x > 0)), d3.max(xData)])
                .range([MARGIN.left, width - MARGIN.right]);
            break;
        case "time":
            xData = xData.map(d => new Date(d));
            x = d3.scaleTime()
                .domain([d3.min(xData), d3.max(xData)])
                .range([MARGIN.left, width - MARGIN.right]);
            break;
    }

    let y;
    switch(yScale) {
        case "linear":
            y = d3.scaleLinear()
                .domain([d3.min(yData), d3.max(yData)])
                .range([height - MARGIN.bottom, MARGIN.top]);
            break;
        case "log":
            y = d3.scaleLog()
                .domain([d3.min(yData.filter((y) => y > 0)), d3.max(yData)])
                .range([height - MARGIN.bottom, MARGIN.top]);
            break;
        case "time":
            yData = yData.map(d => new Date(d));
            y = d3.scaleTime()
                .domain([d3.min(yData), d3.max(yData)])
                .range([height - MARGIN.bottom, MARGIN.top]);
            break;
    }

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

        console.log(dataType)

    svg.selectAll("circle")
        .data(xData.map((d, i) => ({ x: d, y: yData[i] })))
        .join("circle")
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y))
    // on hover show data
        .on("mouseenter", (event, d) => tooltipOnMouseEnter(d, dataType))
        .on("mousemove", (event, d) => tooltipOnMouseMove(event))
        .on("mouseleave", tooltipOnMouseLeave)
        .transition()
        .duration(ANIMATION_DURATION)
        .attr("r", MARKER_SIZE)
        .attr("fill", d => isObjectSelected(d, dataType) ? "red" : "steelblue");
}
