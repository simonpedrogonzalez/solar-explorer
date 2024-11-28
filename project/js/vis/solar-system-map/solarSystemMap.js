import { getBodiesData, getMissionSimplePathData, getMissionsData, getPlanetsData } from "../../data/datasets.js";
import { calculatePlanetPosition } from "../utils/astro.js";
import { dateToFractionalYear, fractionalYearToDate } from "../utils/time.js";
import { updateBodiesVisData } from "./bodies.js";
import * as zoom from "./zoom.js";
import timeSliderVisualization from "./timeSliderVisualization.js";

let svg, g;
let width = window.innerWidth, height=window.innerHeight; // - 200;
let systemCenter = { x: width / 2, y: height / 2 };
let bodiesData;
let planetsData;
let missionsData;
let planetRadiusScale, planetDistanceScale;
let satelliteDistanceScale;
let date = new Date();
let movePlanets = true;

/**
 * Initialize module
 * @param {string} containerId
 * */
export const setup = async (containerId) => {
    // Load the data
    bodiesData = await getBodiesData();

    planetsData = await getPlanetsData();

    bodiesData = updatePlanetPositions(bodiesData, date);
    missionsData = await getMissionSimplePathData();
    // Create the scales
    planetRadiusScale = getPlanetRadiusScale(bodiesData);
    planetDistanceScale = getPlanetDistanceScale(bodiesData);

    // Create the SVG container
    svg = d3.select(containerId)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Anchor for the visualization
    g = svg.append('g')
        .attr('id', 'solar-system-map')
        .attr('transform', `translate(${systemCenter.x}, ${systemCenter.y})`);

    // Setup zoom behavior
    zoom.setup(svg, g, systemCenter, planetDistanceScale);

    // Draw the planet distance scale
    drawPlanetDistanceScale(planetDistanceScale);

    // Create the time slider
    d3.select("#timeslider-text").text(getTimeSliderText(date));
    d3.select("#slider")
    .property("value", dateToFractionalYear(date)) // Set initial slider value
    .on("input", (event) => {
        const newDate = fractionalYearToDate(event.target.value);
        const formattedDate = getTimeSliderText(newDate);
        d3.select("#timeslider-text").text(formattedDate);

        bodiesData = movePlanets ? updatePlanetPositions(bodiesData, newDate) : bodiesData; // Update the positions of the planets
        const filteredMissionsData = missionsData.filter(d => d.launch_date <= newDate);
        draw(bodiesData, filteredMissionsData);
    });

    timeSliderVisualization(missionsData);
    setupTooglePlanetMovement();
    draw(bodiesData, missionsData);
}

const getTimeSliderText = (date) => {
    return `${date.getDate().toString().padStart(2, '0')}/` +
              `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
                `${date.getFullYear()}`;
}


export const drawPlanetDistanceScale = (planetDistanceScale) => {
    const scaleGroup = g.append('g')
        .attr('id', 'distance-scale')
        .attr('class', 'scale-group');

    const scaleStartX = 0;
    const scaleStartY = 0;

    const scaleEndX = planetDistanceScale.range()[1];

    // Horizontal line
    scaleGroup.append('line')
        .attr('x1', scaleStartX)
        .attr('y1', scaleStartY)
        .attr('x2', scaleEndX)
        .attr('y2', scaleStartY)
        .style('stroke', '#ccc')
        .style('stroke-width', 0.5);

    const ticks = planetDistanceScale.ticks(10);
    ticks.forEach((distance, i) => {
        const scaledDistance = planetDistanceScale(distance);

        // Ticks
        scaleGroup.append('line')
            .attr('x1', scaledDistance)
            .attr('y1', scaleStartY - 5)
            .attr('x2', scaledDistance)
            .attr('y2', scaleStartY + 5)
            .style('stroke', '#999')
            .style('stroke-width', 0.5);

        // Labels
        scaleGroup.append('text')
            .attr('x', scaledDistance)
            .attr('y', scaleStartY + 15)
            .attr('text-anchor', 'middle')
            // if first and last add AU
            .text(() => {
                let t = distance.toString();
                if (distance < 1) {
                    // remove the 0
                    return t.slice(1);
                }
                if (i === 0 || i === ticks.length - 1)
                    t += `${distance} AU`
                return t;
            })
            .style('fill', '#666')
            .style('font-size', '8px');
    });
};


/**
 * Draw the solar system map
 * */
export const draw = async (bodiesData, missionsData) => {
    // Update the values of the positions on the canvas
    // of planets, orbits, satellites, etc.
    bodiesData = updateBodiesVisData(
        { width, height },
        bodiesData,
        planetDistanceScale,
        planetRadiusScale,
    );
    drawBodiesOrbits(bodiesData);
    drawMissionPaths(missionsData, bodiesData, "fullPath");
    drawBodies(bodiesData);

}

const drawBodiesOrbits = (data) => {
    const orbits = g.selectAll('.orbit')
    .data(data.filter(d => d.name !== 'Sun'), d => d.name);

    // Enter
    const orbitsEnter = orbits.enter()
        .append('g')
        .attr('class', 'orbit')
        .attr('transform', d => d.vis.orbit.transform);

    orbitsEnter.append('ellipse')
        .attr('rx', d => d.vis.orbit.rx)
        .attr('ry', d => d.vis.orbit.ry)
        .attr('fill', 'none')
        .attr('stroke', d => d.color)
        .attr('stroke-width', d => d.type === 'satellite' ? 0.05 : 0.3)
        .attr('stroke-opacity', d => d.type === 'satellite' ? 0.5 : 0.8);
        
    // Update
    orbits.attr('transform', d => d.vis.orbit.transform);

    // Exit
    orbits.exit().remove();
}

const drawBodies = (data) => {
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
    .style("font-size", "15px")
    .style("line-height", "1")
    .style("white-space", "pre-line")
    .style("pointer-events", "none")
    .style("opacity", 0);


    const bodies = g.selectAll('.body')
        .data(data);

    const toolTipText = (d) => {
        let text = `Name: ${d.name}\n`;
        if (d.radius) text += `<br>Radius: ${d.radius} km\n`;
        if (d.gravity) text += `<br>Gravity: ${d.gravity} m/s²\n`;
        if (d.discovery_date) text += `<br>Discovery: ${d.discovery_date.getFullYear()}\n`;
        if (d.discovered_by) text += `<br>Discovered by: ${d.discovered_by}\n`;
        if (d.avg_temp_kelvin) text += `<br>Avg. Temp: ${d.avg_temp_kelvin} K\n`;
        return text;
    }

    bodies.join(
        enter => {
            const group = enter.append('g').attr('class', 'body');

            // Main circle representing the body
            group.append('circle')
                .attr('class', 'main-circle')
                .attr('fill', d => d.color)
                .attr('r', d => d.vis.body.r)
                .attr('cx', d => d.vis.body.cx)
                .attr('cy', d => d.vis.body.cy)
                .on('mouseenter', (event, d) => {
                    tooltip.style("opacity", 1)
                        .html(toolTipText(d));
                })
                .on('mousemove', (event) => {
                    tooltip.style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 10}px`);
                })
                .on('mouseleave', () => {
                    tooltip.style("opacity", 0);
                });

            return group;
        },
        update => {
            update.select('.main-circle')
                .attr('r', d => d.vis.body.r)
                .attr('cx', d => d.vis.body.cx)
                .attr('cy', d => d.vis.body.cy)
                .attr('fill', d => d.color);

            return update;
        },
        exit => exit.remove()
    );
};


const drawMissionPaths = (missionsData, bodiesData, type) => {

    // Flatten all mission paths
    let allLinks = missionsData.reduce((acc, d) => {
        const newLinks = d.links.map(link => {
            return {
                ...link,
                mission: d
            };
        });
        acc.push(...newLinks);
        return acc;
    }, []);
    allLinks = allLinks.map(d => {
        const origin = bodiesData.find(planet => planet.name === d.origin.name);
        const destination = bodiesData.find(planet => planet.name === d.destination.name);
        return {
            ...d,
            origin,
            destination
        };
    });
    

    let linksPerSourceDestPair = allLinks.reduce((acc, d) => {
        const key = `${d.origin.name}-${d.destination.name}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(d);
        return acc;
    }, {});

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
    .style("font-size", "15px")
    .style("line-height", "1")
    .style("white-space", "pre-line")
    .style("pointer-events", "none")
    .style("opacity", 0);


    const toolTipText = (d) => {
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

    // const missionsPerSourceDestPair = missionsData.reduce((acc, d) => {
    //     const key = `${d.origin.name}-${d.destination.name}`;
    //     if (!acc[key]) acc[key] = [];
    //     acc[key].push(d.name);
    //     return acc;
    // }, {});

    // if (type === 'sourceDest') {
    //     linksPerSourceDestPair = missionsPerSourceDestPair;
    //     allLinks = missionsData;
    // }

    const drawBezierCurves = (d, i) => {
        // The idea is to create bezier curves from origin to destination, making
        // the curve more pronounced with increasing mission count with the same
        // origin and destination. For the same origin and destination, there are
        // two "ears" of missions, one on the right and one on the left.
        // The separation between the curves is controller by the number of missions
        // more missions = less separation so that they dont occupy too much space

        if (!linksPerSourceDestPair[`${d.origin.name}-${d.destination.name}`]) {
            console.error("No links for", d.origin.name, d.destination.name);
            return "";
        }
        const pairMissions = linksPerSourceDestPair[`${d.origin.name}-${d.destination.name}`];
        const missionCount = pairMissions.length;
        const halfMissionCount = Math.floor(missionCount / 2);

        // if elements of pairMissions are string, directly search
        let indexInMissionsPerSource = null;
        if (pairMissions[0].constructor === String) {
            indexInMissionsPerSource = pairMissions.indexOf(d.name);
        } else {
            indexInMissionsPerSource = pairMissions.findIndex(m => m.name === d.name);
        }

        const maxWidthForLineGroup = 40;
        const separation = Math.min(maxWidthForLineGroup / halfMissionCount, 5);
        const rightOrLeft = indexInMissionsPerSource % 2 === 0 ? 1 : -1;
        const indexInMissionsPerSourceHalf = Math.abs(indexInMissionsPerSource - halfMissionCount);

        let x1 = d.origin.vis.body.cx;
        let y1 = d.origin.vis.body.cy;
        let x2 = d.destination.vis.body.cx;
        let y2 = d.destination.vis.body.cy;

        // if any is Sun, set system center as the origin
        if (d.origin.name === 'Sun') {
            x1 = 0
            y1 = 0
        }
        if (d.destination.name === 'Sun') {
            x2 = 0
            y2 = 0
        }

        if (d.origin.name === d.destination.name) {

            // Define starting offsets for control points
            const radiusOfSource = planetRadiusScale(bodiesData.find(planet => planet.name === d.origin.name).radius);
            const startingOffset = radiusOfSource + 2; // Starting offset for the control points

            // Calculate the control points based on the index
            const offset = (startingOffset + indexInMissionsPerSourceHalf * separation) * rightOrLeft;

            // Control points
            const upperControlX = x1 + offset; // Right side control point for upper triangle vertex
            const upperControlY = y1 - offset; // Go higher for upper vertex

            const lowerControlX = x1 + offset; // Right side control point for lower triangle vertex
            const lowerControlY = y1 + offset; // Go lower for lower vertex

            // Create a quadratic Bezier curve with two control points
            return `M${x1},${y1} C${upperControlX},${upperControlY}
                    ${lowerControlX},${lowerControlY} ${x2},${y2}`;
        }

        // Calculate the direction vector from origin to destination
        const dx = x2 - x1;
        const dy = y2 - y1;
        // Calculate the length of the distance
        const length = Math.sqrt(dx * dx + dy * dy);
        // Get unit vectors
        const unitDx = dx / length;
        const unitDy = dy / length;
        // Create the perpendicular vector
        const perpDx = -unitDy;
        const perpDy = unitDx;

        // Calculate the offset
        const offsetMagnitude = indexInMissionsPerSourceHalf * separation * rightOrLeft;
        const offsetX = perpDx * offsetMagnitude;
        const offsetY = perpDy * offsetMagnitude;
        const cx = (x1 + x2) / 2 + offsetX;
        const cy = (y1 + y2) / 2 + offsetY;

        // Create the curve
        return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
    }

    g.selectAll('path.mission')
        .data(allLinks)
        .attr('d', drawBezierCurves);

    g.selectAll('.mission')
    .data(allLinks, d => d.name)
    .join(
        enter => enter.append('path')
                    .attr('class', 'mission')
                    .attr('d', drawBezierCurves)
                    .attr('fill', 'none')
                    .attr('stroke', 'red')
                    .attr('stroke-opacity', 0.5)
                    .attr('stroke-width', 0.2)
                    .on('mouseenter', (event, d) => {
                        tooltip
                            .style("opacity", 1)
                            .html(toolTipText(d))
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY + 10) + "px");
                    })
                    .on('mousemove', (event) => {
                        tooltip
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY + 10) + "px");
                    })
                    .on('mouseleave', () => {
                        tooltip.style("opacity", 0);
                    }),
        update => update,
        exit => exit.remove()
    );
}

const getPlanetRadiusScale = (data) => {
    const maxRadiusInPixels = Math.min(width, height) / 40;
    const minRadiusInPixels = maxRadiusInPixels / 10;
    data = data.filter(d => d.type === 'planet' || d.type === 'star');
    return d3.scaleLog()
        .domain(d3.extent(data, d => d.radius === 0? 1: d.radius))
        .range([minRadiusInPixels, maxRadiusInPixels]);
}

const getPlanetDistanceScale = (data) => {
    const planetsWithoutSun = data.filter(d => d.type === 'planet');
    const maxDistanceInPixels = Math.min(width, height) / 2 * 0.9;
    const minDistanceInPixels = 40;
    return d3.scaleLog()
        .domain(d3.extent(planetsWithoutSun, d => d.semi_major_axis))
        .range([minDistanceInPixels, maxDistanceInPixels]);
}

const updatePlanetPositions = (data, date) => {
    data.filter(d => d.type == 'planet' || d.type == 'star').forEach(d => {
        const newOrbitalParameters = calculatePlanetPosition(d, date);
        Object.assign(d, newOrbitalParameters);
    });
    return data;
}

const setupTooglePlanetMovement = () => {
    const accuratePositionsToggle = document.getElementById("accurate-positions");
    const switchTrack = document.getElementById("switch-track");
    const switchKnob = document.getElementById("switch-knob");

    accuratePositionsToggle.addEventListener("change", (event) => {
        const isChecked = event.target.checked;

        if (isChecked) {
            switchTrack.style.backgroundColor = "steelblue";
            switchKnob.style.transform = "translateX(25px)";
            enableAccuratePlanetPositions();
        } else {
            switchTrack.style.backgroundColor = "#ccc";
            switchKnob.style.transform = "translateX(0px)";
            disableAccuratePlanetPositions();
        }
    });

    const enableAccuratePlanetPositions = () => {
        movePlanets = true;
    };

    const disableAccuratePlanetPositions = () => {
        movePlanets = false;
    };

    if (accuratePositionsToggle.checked) {
        switchTrack.style.backgroundColor = "steelblue";
        switchKnob.style.transform = "translateX(25px)";
        enableAccuratePlanetPositions();
    }
};
