
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "rgba(0, 0, 0, 0.9)")
    .style("color", "white")
    .style("padding", "5px 10px")
    .style("border-radius", "5px")
    .style("border", "1px solid white")
    .style("box-shadow", "0 2px 5px rgba(0, 0, 0, 0.2)")
    // .style("font-family", "'Orbitron', sans-serif")
    .style("font-size", "17px")
    .style("line-height", "1")
    .style("white-space", "pre-line")
    .style("pointer-events", "none")
    .style("opacity", 0);


const getTooltipTextForBody = (d) => {
    let text = `Name: ${d.name}\n`;
    if (d.radius) text += `<br>Radius: ${d.radius} km\n`;
    if (d.gravity) text += `<br>Gravity: ${d.gravity} m/s²\n`;
    if (d.discovery_date) text += `<br>Discovery: ${d.discovery_date.getFullYear()}\n`;
    if (d.discovered_by) text += `<br>Discovered by: ${d.discovered_by}\n`;
    if (d.avg_temp_kelvin) text += `<br>Avg. Temp: ${d.avg_temp_kelvin} K\n`;
    return text;
}

const getTooltipMissionSegmentText = (d) => {
    let text = `Name: ${d.name}\n`;
    // yyyy-mm-dd
    const launchDate = d.mission.launch_date.toISOString().split('T')[0];
    if (d.mission.launch_date) text += `<br>Launch Date: ${launchDate}\n`;
    const edge = `Path: ${d.origin.name} -> ${d.destination.name}`;
    text += `<br>${edge}\n`;
    const destination = d.mission.destination;
    if (destination) text += `<br>Destination: ${destination}\n`;
    const mass = d.mission.total_mass;
    if (mass) text += `<br>Total Mass: ${mass} kg\n`;
    const missionDuration = d.mission.duration;
    if (missionDuration) text += `<br>Duration: ${missionDuration} days\n`;
    const pieces = d.mission.num_pieces;
    if (pieces) text += `<br># Pieces: ${pieces}\n`;
    const totalDistanceTravelled = d.mission.distance;
    if (totalDistanceTravelled) text += `<br>Total Distance: ${totalDistanceTravelled} km\n`;
    // console.log(d);
    return text;
}

export const tooltipOnMouseEnter = (d, dataType) => {
    console.log(d);
    let text;
    if (dataType === "body") {
        text = getTooltipTextForBody(d);
    } else if (dataType === "missionSegment") {
        text = getTooltipMissionSegmentText(d);
    } else {
        throw new Error("Invalid data type for tooltip");
    }
    
    tooltip.style("opacity", 1).html(text);
}

export const tooltipOnMouseLeave = () => {
    tooltip.style("opacity", 0); 
}

export const tooltipOnMouseMove = (event) => {
    tooltip.style("left", `${event.pageX + 10}px`)
    .style("top", `${event.pageY - 10}px`);
}
