export default (missionsData) => {
    const slider = d3.select('#slider');
    const sliderElement = document.getElementById('slider');

    // Don't touch, these were carefully measured
    const sliderThumbRadius = 8;
    const sliderMargin = 0;
    const sliderTotalOffset = sliderThumbRadius + sliderMargin;

    const sliderHeight = sliderElement.offsetHeight;
    const usableHeight = sliderHeight - 2 * sliderTotalOffset;
    const sliderMin = +slider.attr('min');
    const sliderMax = +slider.attr('max');

    let svg = d3.select('#slider-svg');
    svg.attr('width', 140)
       .attr('height', sliderHeight) // slider's height
       .style('overflow', 'visible'); // allow overflow so elements can invade the
                                        // slider's space

    // histogram
    const binWidth = 5;
    const bins = d3.range(sliderMin, sliderMax + binWidth, binWidth);

    const histogramData = bins.map((start, i) => {
        if (i === bins.length - 1) return null;
        const end = bins[i + 1];
        return {
            year: start,
            count: missionsData.filter(
                d => d.launch_date >= new Date(start, 0, 1) && d.launch_date < new Date(end, 0, 1)
            ).length,
        };
    }).filter(d => d);

    // Extra bin to cover years with no missions
    histogramData.push({
        year: sliderMax,
        count: 0,
    });

    const yScale = d3.scaleLinear()
        .domain([sliderMin, sliderMax])
        .range([sliderHeight - sliderTotalOffset, sliderTotalOffset]);

    const barScale = d3.scaleLinear()
        .domain([0, d3.max(histogramData, d => d.count)])
        .range([0, 90]);

    const barHeight = usableHeight / histogramData.length;

    svg.selectAll('*').remove();

    const xBase = 90; // Base x position for all elements

    // histogram bars
    svg.selectAll('.bar')
        .data(histogramData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xBase - barScale(d.count))
        .attr('width', d => barScale(d.count))
        .attr('y', (d, i) => yScale(sliderMin + (i * binWidth)))
        .attr('height', barHeight)
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .attr('stroke-width', 1);

    // ticks in the inbetween bars
    svg.selectAll('.tick')
        .data(histogramData)
        .enter()
        .append('rect')
        .attr('class', 'tick')
        .attr('x', xBase)
        .attr('width', 10)
        .attr('y', (d, i) => yScale(sliderMin + (i * binWidth))-1)
        .attr('height', 1)
        .attr('fill', 'white');

    // labels
    svg.selectAll('.label')
        .data(histogramData)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', xBase + 15)
        .attr('y', (d, i) => yScale(sliderMin + (i * binWidth)) + 4)
        .attr('fill', 'white')
        .attr('text-anchor', 'start')
        .attr('font-size', 14)
        .text(d => d.year);

    // vertical line axis
    svg.append('line')
        .attr('x1', xBase)
        .attr('y1', sliderTotalOffset)
        .attr('x2', xBase)
        .attr('y2', sliderHeight - sliderTotalOffset)
        .attr('stroke', 'white')
        .attr('stroke-width', 1);

    // horizontal line axis
    svg.append('line')
        .attr('x1', xBase)
        .attr('y1', sliderTotalOffset - 0.5)
        .attr('x2', xBase - 90)
        .attr('y2', sliderTotalOffset - 0.5)
        .attr('stroke', 'white')
        .attr('stroke-width', 1);
    
    const tickLength = 5;

    barScale.ticks(3).forEach((tick) => {
    svg.append('line')
        .attr('x1', xBase - barScale(tick))
        .attr('y1', sliderTotalOffset - tickLength / 2)
        .attr('x2', xBase - barScale(tick))
        .attr('y2', sliderTotalOffset + tickLength / 2)
        .attr('stroke', 'white')
        .attr('stroke-width', 1);
    });

    barScale.ticks(3).forEach((tick) => {
    svg.append('text')
        .attr('x', xBase - barScale(tick))
        .attr('y', sliderTotalOffset + tickLength - 12)
        .attr('fill', 'white')
        .attr('font-size', 14)
        .attr('text-anchor', 'middle')
        .text(tick);
    });
};
