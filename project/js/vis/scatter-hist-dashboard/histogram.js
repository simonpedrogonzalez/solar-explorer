import { Variable } from "../utils/variable.js";
import * as tooltip from "../utils/tooltip.js";
import { addZoom } from "./zoom.js";
import * as globalState from "../utils/globalState.js";

const MARGIN = { left: 50, bottom: 50, top: 20, right: 10 };
const ANIMATION_DURATION = 300;
const NUM_BINS = 15;
let containerWidth, containerHeight;

let width, height;
let svg, g;


/**
 * Draw a histogram
 * @param {string} containerID
 * @param {Array<Object>} data
 * @param {Variable} variable
 */
export const draw = async (containerID, data, variable, resetZoomButtonID) => {
    

    const container = document.getElementById(containerID);

    if (!containerWidth) {
        containerWidth = container.clientWidth;
        containerHeight = container.clientHeight;
    }
    
    width = containerWidth - MARGIN.left - MARGIN.right;
    height = containerHeight - MARGIN.top - MARGIN.bottom;

    const dataLabel = variable.label;
    data = variable.prepareData(data);
    
    const x = variable.getScale(data, width);

    d3.select("#" + containerID).selectAll("*").remove();

    svg = d3.select("#" + containerID)
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight);

    g = svg.append("g")
        .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

    const zoomCenter = { x: width / 2 - MARGIN.left * 0.5, y: MARGIN.top + height / 2 - MARGIN.top * 0.5 };
    addZoom(svg, g, containerWidth, containerHeight, zoomCenter, resetZoomButtonID);

    const histogram = d3.histogram()
        .value(d => d[variable.selector])
        .domain(x.domain())
        .thresholds(x.ticks(NUM_BINS));

    const bins = histogram(data);

    const y = getCountScale(bins);

    g.selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("x", d => x(d.x0))
        .attr("width", (d) => {
            if (x(d.x1) - x(d.x0) - 1 < 0) {
                return 3;
            }
            return x(d.x1) - x(d.x0) - 1
        })
        .attr("y", height)
        .attr("height", 0)
        .on("mouseenter", (event, d) => tooltip.onMouseEnter(tooltip.textParser.getTextFromBin(d, variable)))
        .on("mousemove", tooltip.onMouseMove)
        .on("mouseleave", tooltip.onMouseLeave)
        .transition()
        .duration(ANIMATION_DURATION)
        .attr("y", d => {
            if (!d.length) {
                return 0;
            }
            return y(d.length)
        })
        .attr("height", function(d) {
            if (!d.length) {
                return 0;
            }
            return height - y(d.length);
        })
        .attr("fill", "steelblue");

    g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    g.append("text")
        .attr("x", width / 2)
        .attr("y", height + MARGIN.bottom - 10)
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text(dataLabel);

    g.append("g")
        .call(d3.axisLeft(y));

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -MARGIN.left + 15)
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text("Count");
};


/**
 * Choose the appropriate scale for the histogram count
 * depending on how big are the counts
 * @param {Array<Object>} bins 
 */
const getCountScale = (bins) => {
    let scaleType;
    const positiveData = bins.filter(d => d.length > 0);
    if (positiveData.length === 0) {
        scaleType = "linear";
    } else {
        const max = d3.max(positiveData.map(d => d.length));
        const min = d3.min(positiveData.map(d => d.length));
        const rangeRatio = max / min;
        if (rangeRatio > 100) {
            scaleType = "log";
        } else {
            scaleType = "linear";
        }
    }
    if (scaleType === "log") {
        // console.log("Using log scale");
        return d3.scaleLog()
        .domain([0.5, d3.max(bins, d => d.length)])
        .range([height, 0]);
    } else {
        // console.log("Using linear scale");
        return d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height, 0]);
    }
};