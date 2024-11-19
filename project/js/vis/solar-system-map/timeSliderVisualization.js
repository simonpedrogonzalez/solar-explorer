export default (missionsData) => {
    const slider = d3.select('#slider'); // Select the slider input element
    const sliderElement = document.getElementById('slider'); // For direct DOM access

    const sliderThumbRadius = 8; // Radius of the thumb element
    const sliderMargin = 0; // Slider margin
    const sliderTotalOffset = sliderThumbRadius + sliderMargin; // Total offset to account for thumb

    // Dynamically extract the slider's usable height
    const sliderHeight = sliderElement.offsetHeight; // Full slider height
    const usableHeight = sliderHeight - 2 * sliderTotalOffset; // Usable height after removing thumb offsets
    const sliderMin = +slider.attr('min');
    const sliderMax = +slider.attr('max');

    // Create an SVG container for the slider and histogram
    let svg = d3.select('#slider-svg');
    svg.attr('width', 150) // Adjusted width for the histogram
       .attr('height', sliderHeight) // Match the slider's height
       .style('overflow', 'visible'); // Allow elements to overflow if necessary

    // Create bins for the histogram
    const binWidth = 5;
    const bins = d3.range(sliderMin, sliderMax + binWidth, binWidth);

    // Prepare histogram data
    const histogramData = bins.map((start, i) => {
        if (i === bins.length - 1) return null;
        const end = bins[i + 1];
        return {
            year: start, // Display the first year of the range
            count: missionsData.filter(
                d => d.launch_date >= new Date(start, 0, 1) && d.launch_date < new Date(end, 0, 1)
            ).length,
        };
    }).filter(d => d);

    // Add a last bin with 0 count
    histogramData.push({
        year: sliderMax,
        count: 0,
    });

    // Scales
    const yScale = d3.scaleLinear()
        .domain([sliderMin, sliderMax])
        .range([sliderHeight - sliderTotalOffset, sliderTotalOffset]); // Adjust range to include thumb offsets

    const barScale = d3.scaleLinear()
        .domain([0, d3.max(histogramData, d => d.count)])
        .range([0, 90]); // Adjusted for maximum width of bars

    const barHeight = usableHeight / histogramData.length; // Calculate height for each bar

    // Clear previous content
    svg.selectAll('*').remove();

    const xBase = 90; // Base x position for all elements

    // Render histogram bars
    svg.selectAll('.bar')
        .data(histogramData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xBase - barScale(d.count)) // Align bars within the SVG and grow leftward
        .attr('width', d => barScale(d.count))
        .attr('y', (d, i) => yScale(sliderMin + (i * binWidth))) // Align bars with the adjusted y-scale
        .attr('height', barHeight) // Leave a small gap for aesthetics
        .attr('fill', 'white')
        .attr('stroke', 'black') // Add black stroke
        .attr('stroke-width', 1);

    // Render ticks in the inbetween bars
    svg.selectAll('.tick')
        .data(histogramData)
        .enter()
        .append('rect')
        .attr('class', 'tick')
        .attr('x', xBase) // Slightly to the left of the histogram
        .attr('width', 10) // Small width for ticks
        .attr('y', (d, i) => yScale(sliderMin + (i * binWidth))-1) // Center ticks vertically with bars
        .attr('height', 1) // Leave a small gap for aesthetics
        .attr('fill', 'white');

    // Render ticks in the inbetween bars
    // svg.selectAll('.tick2')
    // .data(histogramData)
    // .enter()
    // .append('rect')
    // .attr('class', 'tick')
    // .attr('x', xBase + 48) // Slightly to the left of the histogram
    // .attr('width', 5) // Small width for ticks
    // .attr('y', (d, i) => yScale(sliderMin + (i * binWidth))-1) // Center ticks vertically with bars
    // .attr('height', 1) // Leave a small gap for aesthetics
    // .attr('fill', 'white');


    // Render year labels
    svg.selectAll('.label')
        .data(histogramData)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', xBase + 15) // Positioned slightly to the right of the histogram
        .attr('y', (d, i) => yScale(sliderMin + (i * binWidth)) + 4) // Center labels vertically with bars
        .attr('fill', 'white')
        .attr('text-anchor', 'start')
        .attr('font-size', 12)
        .text(d => d.year);

    // Add vertical line axis
    svg.append('line')
        .attr('x1', xBase)
        .attr('y1', sliderTotalOffset)
        .attr('x2', xBase)
        .attr('y2', sliderHeight - sliderTotalOffset)
        .attr('stroke', 'white')
        .attr('stroke-width', 1);

    // Add horizontal line axis
    // on the top
    svg.append('line')
        .attr('x1', xBase)
        .attr('y1', sliderTotalOffset - 0.5)
        .attr('x2', xBase - 90)
        .attr('y2', sliderTotalOffset - 0.5)
        .attr('stroke', 'white')
        .attr('stroke-width', 1);
    
    // Add the count tick marks on the previous line

    // Add ticks using the existing scale
    const tickLength = 5; // Length of each tick

    barScale.ticks(5).forEach((tick) => {
    svg.append('line')
        .attr('x1', xBase - barScale(tick)) // Use the barScale to position the tick
        .attr('y1', sliderTotalOffset - tickLength / 2)
        .attr('x2', xBase - barScale(tick)) // Same x position for vertical line
        .attr('y2', sliderTotalOffset + tickLength / 2)
        .attr('stroke', 'white')
        .attr('stroke-width', 1);
    });

    // Optionally add labels for the ticks
    barScale.ticks(5).forEach((tick) => {
    svg.append('text')
        .attr('x', xBase - barScale(tick)) // Use the barScale for label position
        .attr('y', sliderTotalOffset + tickLength - 10) // Slightly below the ticks
        .attr('fill', 'white')
        .attr('font-size', 10)
        .attr('text-anchor', 'middle')
        .text(tick);
    });

    // what is the max count?
    const maxCount = d3.max(histogramData, d => d.count);
    console.log(maxCount);
};
