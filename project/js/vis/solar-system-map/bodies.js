import { getBodiesData, getPlanetsData, getMissionsData, getMissionSimplePathData, getSatellitesData } from "../../data/datasets.js";
import { calculatePlanetPosition, semiMinAxis } from "../utils/astro.js";

// Default canvas radius for bodies that don't have a radius
// value, like small satellites and asteroids
const defaultRadius = 1;

/**
 * Calculate the orbit of a body as a ellipse around
 * the primary
 * @param {Object} d
 * expects the following properties:
 * - semi_major_axis
 * - eccentricity
 * - longitude_of_ascending_node
 * - argument_of_periapsis
 * @param {Function} distanceScale
 * @param {Object} primary
 * expects the following properties:
 * - vis.body.cx
 * - vis.body.cy
 * @return {Object}
 */
const getOrbitEllipse = (d, primary, distanceScale) => {
    if (d.name == "Moon") {
        console.log("Moon", d, primary);
    }
    const cx = primary.vis.body.cx;
    const cy = primary.vis.body.cy;
    const rx = distanceScale(d.semi_major_axis);
    const ry = distanceScale(d.semi_minor_axis ? 
        d.semi_minor_axis :
        semiMinAxis(d.semi_major_axis, d.eccentricity)
    );

    let transform = `translate(${cx}, ${cy})`;
    if (!!d.longitude_of_ascending_node || !!d.argument_of_periapsis) {
        // transform = `translate(${50}, ${50})`;
        console.log(transform);
    } else {
        let rotation = (d.longitude_of_ascending_node + d.argument_of_periapsis) % 360;
        transform = transform + ` rotate(${rotation})`;
    }
    
    // Check for invalid data
    if (cx == null || cy == null || rx == null || ry == null || 
        isNaN(cx) || isNaN(cy) || isNaN(rx) || isNaN(ry)) {
        console.log("Invalid orbit data", d.name, cx, cy, rx, ry);
        throw new Error("Invalid orbit data");
    }


    if (d.name == "Moon") {
        console.log("Moon", d, primary);
    }
    

    return {
        cx,
        cy,
        rx,
        ry,
        transform
    }
}

/**
 * 
 * @param {Object} d
 * expects the following properties:
 * - radial_distance_from_primary
 * - angular_position_in_ecliptic
 * - radius
 * @param {Function} distanceScale
 * @param {Object} primary
 * expects the following properties:
 * - vis.body.cx
 * - vis.body.cy
 * @return {Object}
 */
const getBodyCircle = (d, primary, radiusScale, distanceScale) => {
    const primaryX = primary.vis.body.cx;
    const primaryY = primary.vis.body.cy;
    const {
        radial_distance_from_primary,
        angular_position_in_ecliptic,
        semi_major_axis,
        radius
    } = d;

    let cx, cy;
    if (radial_distance_from_primary && radial_distance_from_primary) {

        const rd = distanceScale(radial_distance_from_primary);
        cx = (isNaN(rd) || rd === 0) ? 0 : rd * Math.cos(angular_position_in_ecliptic);
        cx += primaryX;
        cy = (isNaN(rd) || rd === 0) ? 0 : rd * Math.sin(angular_position_in_ecliptic);
        cy += primaryY;
    } else {
        // For satellites we don't have the accurate angular position
        // or radial distance, so we place it in an approximate circular
        // orbit
        const theta = Math.random() * 2 * Math.PI;
        cx = primaryX + distanceScale(semi_major_axis) * Math.cos(theta);
        cy = primaryY + distanceScale(semi_major_axis) * Math.sin(theta);
    }

        const r = radius ? radiusScale(radius) : defaultRadius;

    if (cx == null || cy == null || r == null ||
        isNaN(cx) || isNaN(cy) || isNaN(r)) {
        console.log("Invalid body data", d.name, cx, cy, r);
        throw new Error("Invalid body data");
    }

    if (d.name == "Moon") {
        console.log("Moon", d, primary);
    }

    return {
        cx,
        cy,
        r
    }
}

// const getChildrenDistanceScale = (primary, data, maxVisDistance) => {
//     const children = data.filter(d => d.primary === primary.name && d.primary !== d.name);
//     const distances = children.map(d => d.semi_major_axis);
//     const primaryVisRadius = primary.vis.body.r;
//     const minVisDistance = 1.1 * primaryVisRadius;
//     return d3.scaleLog()
//         .domain(d3.extent(distances))
//         .range([minVisDistance, maxVisDistance]);
// }

export const updateBodiesVisData = (
    canvas,
    data,
    planetDistanceScale,
    planetRadiusScale
) => {

    // Create vis elements for the sun which is the main primary
    let sun = data.find(d => d.name === 'Sun');
    sun.vis = getSunVis(data, planetRadiusScale);
    

    // Create vis elements for the sun orbiting bodies
    const sunChildren = data.filter(d => d.name !== 'Sun' && d.primary === 'Sun');

    const allSatellites = data.filter(d => d.type === 'satellite');
    let allPrimaries = allSatellites.map(d => d.primary);
    allPrimaries = data.filter(d => allPrimaries.includes(d.name));
    const smallest = d3.min(allPrimaries.map(d => d.radius));
    const samllestPrimaryInPixels = planetRadiusScale(smallest);
    const satelliteDistanceScale = d3.scaleLog()
        .domain(d3.extent(allSatellites.map(d => d.semi_major_axis)))
        .range([samllestPrimaryInPixels + 5, Math.min(canvas.width, canvas.height) / 20]);

    sunChildren.forEach(d => {
        d.vis = {
            body: getBodyCircle(d, sun, planetRadiusScale, planetDistanceScale),
            orbit: getOrbitEllipse(d, sun, planetDistanceScale)
        }
        // Update the bodies orbiting this body
        let planetChildren = data.filter(d2 => d2.primary === d.name);
        // let maxVisDistance = Math.min(canvas.width, canvas.height) / 20;
        // let distanceScale = getChildrenDistanceScale(d, data, Math.min(canvas.width, canvas.height) / 20);
        planetChildren.forEach(d2 => {
            d2.vis = {
                body: getBodyCircle(d2, d, planetRadiusScale, satelliteDistanceScale),
                orbit: getOrbitEllipse(d2, d, satelliteDistanceScale)
            }
        });
    });

    return data;
}

const getSunVis = (data, radiusScale) => {
    const sun = data.find(d => d.name === 'Sun');
    return {
        body: {
            cx: 0,
            cy: 0,
            r: radiusScale(sun.radius)
        }
    }
}
