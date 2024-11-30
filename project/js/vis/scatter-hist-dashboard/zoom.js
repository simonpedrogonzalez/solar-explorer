/**
 * Adds a standard zoom and pan to the SVG element.
 * @param {d3.Selection} svg - The SVG element to apply zoom.
 * @param {d3.Selection} g - The group element inside the SVG that contains the chart.
 * @param {number} width - Width of the chart.
 * @param {number} height - Height of the chart.
 * @param {Object} center - Center coordinates { x, y }.
 * @param {string} resetZoomButtonID - The ID of the reset zoom button.
 */
export const addZoom = (svg, g, width, height, center, resetZoomButtonID) => {
    
    const zoomBehavior = d3.zoom()
        .scaleExtent([1, 10])
        .translateExtent([[-width, -height], [2 * width, 2 * height]])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    svg.call(zoomBehavior);

    d3.select(`#${resetZoomButtonID}`)
        .on("click", () => {
            svg.call(
                    zoomBehavior.transform,
                    d3.zoomIdentity.translate(width / 2 - center.x, height / 2 - center.y)
                );
        });
};
