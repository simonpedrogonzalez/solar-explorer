const MARGIN = { left: 50, bottom: 50, top: 20, right: 50 };
const ANIMATION_DURATION = 300;

let svg;

export const draw = async (containerID, data, dataLabel) => {
    const width = (window.innerWidth - MARGIN.left - MARGIN.right) / 2;
    const height = (window.innerHeight - MARGIN.top - MARGIN.bottom) / 2;

    // Clear the existing visualization
    d3.select(containerID).selectAll("*").remove();

    svg = d3.select(containerID)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const NUM_BINS = 15;

    const histogram = d3.histogram()
        .value(d => d)
        .domain(d3.extent(data))
        .thresholds(NUM_BINS);

    const bins = histogram(data);

    const x = d3.scaleLinear()
        .domain([d3.min(data), d3.max(data)])
        .range([MARGIN.left, width - MARGIN.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height - MARGIN.bottom, MARGIN.top]);

    const barWidth = (width - MARGIN.left - MARGIN.right) / bins.length;

    svg.selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("x", d => x(d.x0))
        .attr("y", y(0))
        .attr("width", barWidth)
        .transition()
        .duration(ANIMATION_DURATION)
        .attr("y", d => y(d.length))
        .attr("height", d => y(0) - y(d.length))
        .attr("fill", "steelblue");

    let xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height - MARGIN.bottom})`)
        .call(d3.axisBottom(x));

    // Add the x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height)
        .attr("dy", "-0.75em")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text(dataLabel);

    svg.append("g")
        .attr("transform", `translate(${MARGIN.left}, 0)`)
        .call(d3.axisLeft(y)
            .tickValues(
                y.ticks().filter(tick => Number.isInteger(tick))
            )
            .tickFormat(d3.format('d'))
        );

    return svg;
}
