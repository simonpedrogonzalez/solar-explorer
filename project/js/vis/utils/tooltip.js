import { Variable } from "./variable.js";


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
    /**
     * @param {Object} d
     * @param {Variable} xVariable
     * @param {Variable} yVariable
     * @return {string}
     * */
    getTextFromVariables: (d, xVariable, yVariable) => {
        let text = `Name: ${d.name}\n`;
        text += `<br>${xVariable.valueAndLabelToText(d[xVariable.selector])}\n`;
        text += `<br>${yVariable.valueAndLabelToText(d[yVariable.selector])}\n`;
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
    getTextFromBin: (d, variable) => {
        const limitToDisplay = 5;
        const perRow = 3;
        let currentLimit = Math.min(d.length, limitToDisplay);
        let text = `Count: ${d.length}\n`;
        text += `Range: ${variable.valueToText(d.x0)} - ${variable.valueToText(d.x1)}\n`;
        text += `<br>`;
        let i = 0;
        while (i < currentLimit) {
            text += `${d[i].name}, `;
            if ((i + 1) % perRow === 0) {
                text += '\n';
            }
            i++;
        }
        if (d.length > limitToDisplay) {
            text += `and ${d.length - limitToDisplay} more...`;
        } else {
            text = text.slice(0, -2);
        }
        return text;
    },
}

export const TEXT_TYPES = {
    BODY_DATA: "BODY_DATA",
    XY: "XY",
    MISSION_SEGMENT: "MISSION_SEGMENT",
    BIN: "BIN",
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
