import { getScale, bigNumberToText } from "./utils.js";


const MARGIN = { left: 50, bottom: 50, top: 20, right: 10 };
const ANIMATION_DURATION = 300;
let containerWidth, containerHeight;

let width, height;
let svg, g;


export const draw = async (containerID, data, dataLabel, scaleType) => {
    const container = document.getElementById(containerID);

    if (!containerWidth) {
        containerWidth = container.clientWidth;
        containerHeight = container.clientHeight;
    }
    
    // console.log(containerWidth, containerHeight);

    width = containerWidth - MARGIN.left - MARGIN.right;
    height = containerHeight - MARGIN.top - MARGIN.bottom;

    // console.log(containerID);

    d3.select("#" + containerID).selectAll("*").remove();

    svg = d3.select("#" + containerID)
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight);

    g = svg.append("g")
        .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

    const NUM_BINS = 15;

    const x = getScale(data, scaleType, width);

    const histogram = d3.histogram()
        .value(d => d)
        .domain(x.domain())
        .thresholds(x.ticks(NUM_BINS));

    const bins = histogram(data);

    const y = d3.scaleLog()
        .domain([0.5, d3.max(bins, d => d.length)])
        .range([height, 0]);

    g.selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("x", d => x(d.x0))
        .attr("width", function(d) {
            if (x(d.x1) - x(d.x0) - 1 < 0) {
                console.log(d.x0, d.x1);
                console.log(x(d.x0), x(d.x1));
                console.log(x(d.x1) - x(d.x0));
                return 0;
            }
            return x(d.x1) - x(d.x0) - 1
        })
        .attr("y", height)
        .attr("height", 0)
        .transition()
        .duration(ANIMATION_DURATION)
        .attr("y", d => {
            if (!d.length) {
                return 0;
            }
            return y(d.length)
        })
        .attr("height", function(d) {
            // console.log(d.length, y(d.length));
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
