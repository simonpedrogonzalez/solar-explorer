
export default (svg, g, systemCenter) => {
    const minZoom = 1;
    const maxZoom = 1000;
    
    const zoom = d3.zoom()
    .scaleExtent([minZoom, maxZoom])
    .on("zoom", (event) => {
        g.attr("transform", event.transform);
    });

    svg.call(zoom);

    // Initial transform to center the system
    const initialTransform = d3.zoomIdentity.translate(systemCenter.x, systemCenter.y);
    svg.call(zoom.transform, initialTransform);

    // Reset zoom button
    d3.select("#reset-zoom").on("click", () => {
    svg.transition()
        .duration(750)
        .call(zoom.transform, initialTransform);
    });

    // Zoom for the buttons + and -
    const zoomStep = 1.2;
    const zoomTransitionTime = 500;

    d3.select("#zoom-in").on("click", () => {
    svg.transition()
        .duration(zoomTransitionTime)
        .call(zoom.scaleBy, zoomStep);
    });

    d3.select("#zoom-out").on("click", () => {
    svg.transition()
        .duration(zoomTransitionTime)
        .call(zoom.scaleBy, 1 / zoomStep);
    });

    // Reset zoom button
    d3.select("#reset-zoom").on("click", () => {
    svg.transition()
        .duration(zoomTransitionTime)
        .call(zoom.transform, initialTransform);
    });
}