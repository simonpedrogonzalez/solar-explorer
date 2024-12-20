import { getBodiesData, getMissionSimplePathData, getMissionsData, getPlanetsData } from "../../data/datasets.js";
import { calculatePlanetPosition } from "../utils/astro.js";
import { dateToFractionalYear, fractionalYearToDate } from "../utils/time.js";
import { updateBodiesVisData } from "./bodies.js";
import * as zoom from "./zoom.js";
import timeSliderVisualization from "./timeSliderVisualization.js";
import * as globalState from "../utils/globalState.js";
import * as tooltip from "../utils/tooltip.js";

let svg, g;
let width = window.innerWidth, height=window.innerHeight; // - 200;
let systemCenter = { x: width / 2, y: height / 2 };
let bodiesData;
let planetsData;
let missionsData;
let planetRadiusScale, planetDistanceScale;
let date = new Date();
let movePlanets = true;

/**
 * Initialize module
 * @param {string} containerId
 * */
export const setup = async (containerId) => {

    // Suscribe to object selection updates
    globalState.suscribeToObjectSelection(onBodySelection, globalState.SELECTION_TYPES.BODY);
    globalState.suscribeToObjectSelection(onMissionPathSelection, globalState.SELECTION_TYPES.MISSION);

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
        .attr('stroke-width', d => d.type === 'satellite' ? Math.min(0.05, d.vis.body.r) : 0.3)
        .attr('stroke-opacity', d => d.type === 'satellite' ? 0.5 : 0.8);
        
    // Update
    orbits.attr('transform', d => d.vis.orbit.transform);

    // Exit
    orbits.exit().remove();
}

const drawBodies = (data) => {
    const bodies = g.selectAll('.body')
        .data(data);
    bodies.join(
        enter => {
            const group = enter.append('g')
            .attr('class', 'body')
            .attr('data-name', d => d.name);

            // Main circle representing the body
            group.append('circle')
                .attr('class', 'main-circle')
                .attr('fill', d => d.color)
                .attr('r', d => d.vis.body.r)
                .attr('cx', d => d.vis.body.cx)
                .attr('cy', d => d.vis.body.cy)
                .on('mouseenter', (event, d) => {
                    const content = tooltip.textParser.getTextFromtAllBodyData(d);
                    tooltip.onMouseEnter(event, content);
                })
                .on('mousemove', (event) => {
                    tooltip.onMouseMove(event);
                })
                .on('mouseleave', () => {
                    tooltip.onMouseLeave();
                })
                .on('click', (event, d) => {
                    globalState.updateObjectSelection(d, globalState.SELECTION_TYPES.BODY);
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


const drawMissionPaths = (missionsData, bodiesData) => {

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
    })
    allLinks = allLinks.filter((d, i, self) =>
        i === self.findIndex(t => (
            t.origin.name === d.origin.name && t.destination.name === d.destination.name && t.mission.name === d.mission.name
        ))
    );
    

    let linksPerSourceDestPair = allLinks.reduce((acc, d) => {
        const key = `${d.origin.name}-${d.destination.name}`;
        const key2 = `${d.destination.name}-${d.origin.name}`;
        if (!acc[key]) {
            if (!acc[key2]) {
                acc[key] = [];
                acc[key].push(d);
            } else {
                acc[key2].push(d);
            }
        } else {
            acc[key].push(d);
        }

        return acc;
    }, {});


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
        let pairMissions = linksPerSourceDestPair[`${d.origin.name}-${d.destination.name}`];
        const missionCount = pairMissions.length;
        const halfMissionCount = Math.ceil(missionCount / 2);

        // if elements of pairMissions are string, directly search
        let indexInMissionsPerSource = null;
        indexInMissionsPerSource = pairMissions.findIndex(m => m.name === d.name);

        const maxWidthForLineGroup = 40;
        const separation = Math.min(maxWidthForLineGroup / halfMissionCount, 5);

        let rightOrLeft = indexInMissionsPerSource >= missionCount / 2 ? 1 : -1;
        let indexInMissionsPerSourceHalf;
        const isSecondHalf = indexInMissionsPerSource >= halfMissionCount;
        
        indexInMissionsPerSourceHalf = isSecondHalf
            ? indexInMissionsPerSource - halfMissionCount
            : indexInMissionsPerSource;
        indexInMissionsPerSourceHalf += 1

        if (missionCount % 2 === 1 && missionCount !== 1) {
            if (!isSecondHalf) {
                indexInMissionsPerSourceHalf -= 1;
            }
        }

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
                    .attr('data-name', d => d.mission.name)
                    .attr('class', 'mission')
                    .attr('d', drawBezierCurves)
                    .attr('fill', 'none')
                    .attr('stroke', d => globalState.isObjectSelected(d.mission, globalState.SELECTION_TYPES.MISSION) ? 'red' : 'steelblue')
                    .attr('stroke-opacity', d => globalState.isObjectSelected(d.mission, globalState.SELECTION_TYPES.MISSION) ? 1 : 0.5)
                    .attr('stroke-width', d => globalState.isObjectSelected(d.mission, globalState.SELECTION_TYPES.MISSION) ? 0.5 : 0.2)
                    .on('mouseenter', (event, d) => {
                        const content = tooltip.textParser.getTextFromMissionSegment(d);
                        tooltip.onMouseEnter(event, content);
                    })
                    .on('mousemove', (event) => {
                        tooltip.onMouseMove(event);
                    })
                    .on('mouseleave', () => {
                        tooltip.onMouseLeave();
                    })
                    .on('click', (event, d) => {
                        globalState.updateObjectSelection(d.mission, globalState.SELECTION_TYPES.MISSION);
                    }),
        update => update
        .attr('data-name', d => d.mission.name)
        .attr('d', drawBezierCurves)
        .attr('stroke', d => globalState.isObjectSelected(d.mission, globalState.SELECTION_TYPES.MISSION) ? 'red' : 'steelblue')
        .attr('stroke-opacity', d => globalState.isObjectSelected(d.mission, globalState.SELECTION_TYPES.MISSION) ? 1 : 0.5)
        .attr('stroke-width', d => globalState.isObjectSelected(d.mission, globalState.SELECTION_TYPES.MISSION) ? 0.5 : 0.2),
exit => exit.remove(),
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

/**
 * Handle object selection change. Is triggered by globalState.updateObjectSelection
 * Has to respect this function signature
 * @param {Object} d
 * @param {boolean} isSelected 
 */
export const onBodySelection = (d, isSelected) => {
    const target = g.selectAll(`.body[data-name="${d.name}"]`);
    const circle = target.select('g circle.main-circle');
    circle
        .attr('stroke', isSelected ? 'white' : 'none')
        .attr('stroke-width', isSelected ? Math.max(d.vis.body.r / 10, 0.2) : 0)
};

/**
 * Handle object selection change. Is triggered by globalState.updateObjectSelection
 * Has to respect this function signature
 * @param {Object} d
 * @param {boolean} isSelected 
 */
export const onMissionPathSelection = (d, isSelected) => {
    const missionPath = g.selectAll('.mission').filter(d1 => d1.mission.name === d.name);
    missionPath.attr('stroke', isSelected ? 'red' : 'steelblue')
        .attr('stroke-opacity', isSelected ? 1 : 0.5)
        .attr('stroke-width', isSelected ? 0.5 : 0.2);
};
