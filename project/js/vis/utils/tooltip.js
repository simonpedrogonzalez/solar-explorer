
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

export const textParser = {
    getTextFromtAllBodyData: (d) => {
        let text = `Name: ${d.name}\n`;
        if (d.radius) text += `<br>Radius: ${d.radius} km\n`;
        if (d.gravity) text += `<br>Gravity: ${d.gravity} m/s²\n`;
        if (d.discovery_date) text += `<br>Discovery: ${d.discovery_date.getFullYear()}\n`;
        if (d.discovered_by) text += `<br>Discovered by: ${d.discovered_by}\n`;
        if (d.avg_temp_kelvin) text += `<br>Avg. Temp: ${d.avg_temp_kelvin} K\n`;
        return text;
    },
    getTextFromBodyXY: (d, xSelector, ySelector) => {
        let text = `Name: ${d.name}\n`;
        text += `<br>${xSelector}: ${d[xSelector]}\n`;
        text += `<br>${ySelector}: ${d[ySelector]}\n`;
        return text;
    },
    getTextFromMissionXY: (d, xSelector, ySelector) => {
        let text = `Name: ${d.name}\n`;
        text += `<br>${xSelector}: ${d[xSelector]}\n`;
        text += `<br>${ySelector}: ${d[ySelector]}\n`;
        return text;
    },
    getTextFromMissionSegment: (d) => {
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
    },
    getTextFromType(d, type, xSelector=null, ySelector=null) {
        switch (type) {
            case TEXT_TYPES.BODY_DATA:
                return this.getTextFromtAllBodyData(d);
            case TEXT_TYPES.BODY_XY:
                return this.getTextFromBodyXY(d, xSelector, ySelector);
            case TEXT_TYPES.MISSION_XY:
                return this.getTextFromMissionXY(d, xSelector, ySelector);
            case TEXT_TYPES.MISSION_SEGMENT:
                return this.getTextFromMissionSegment(d);
            default:
                console.warn("Tooltip text type not found: " + type);
                return "";
        }
    }
}

export const TEXT_TYPES = {
    BODY_DATA: "BODY_DATA",
    BODY_XY: "BODY_XY",
    MISSION_XY: "MISSION_XY",
    MISSION_SEGMENT: "MISSION_SEGMENT",
}

export const onMouseEnter = (tooltipText) => {
    tooltip.style("opacity", 1).html(tooltipText);
}

export const onMouseLeave = () => {
    tooltip.style("opacity", 0); 
}

export const onMouseMove = (event) => {
    tooltip.style("left", `${event.pageX + 10}px`)
    .style("top", `${event.pageY - 10}px`);
}
