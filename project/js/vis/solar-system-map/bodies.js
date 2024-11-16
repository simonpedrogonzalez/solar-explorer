import { getBodiesData, getPlanetsData, getMissionsData, getMissionSimplePathData, getSatellitesData } from "../../data/datasets.js";
import { calculatePlanetPosition2, semiMinAxis } from "../utils/astro.js";

// Default canvas radius for bodies that don't have a radius
// value, like small satellites and asteroids
const defaultRadius = 10;

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
export const getOrbitEllipse = (d, primary, distanceScale) => {
    const cx = primary.vis.body.cx;
    const cy = primary.vis.body.cy;
    const rx = distanceScale(d.semi_major_axis);
    const ry = distanceScale(d.semi_minor_axis ? 
        d.semi_minor_axis :
        semiMinAxis(d.semi_major_axis, d.eccentricity)
    );
    let rotation = (d.longitude_of_ascending_node + d.argument_of_periapsis) % 360;
    let rotationInstruction = `rotate(${rotation}, ${cx}, ${cy})`;

    // Check for invalid data
    if (cx == null || cy == null || rx == null || ry == null || 
        isNaN(cx) || isNaN(cy) || isNaN(rx) || isNaN(ry)) {
        console.log("Invalid orbit data", d.name, cx, cy, rx, ry);
        throw new Error("Invalid orbit data");
    }


    if (d.name == "Charon") {
        console.log("Charon", d, primary);
    }
    

    return {
        cx,
        cy,
        rx,
        ry,
        rotation: rotationInstruction
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
export const getBodyCircle = (d, primary, radiusScale, distanceScale) => {
    const primaryX = primary.vis.body.cx;
    const primaryY = primary.vis.body.cy;
    const { radial_distance_from_primary, angular_position_in_ecliptic, radius } = d;
    const rd = distanceScale(radial_distance_from_primary);
    let cx = (isNaN(rd) || rd === 0) ? 0 : rd * Math.cos(angular_position_in_ecliptic);
    cx += primaryX;
    let cy = (isNaN(rd) || rd === 0) ? 0 : rd * Math.sin(angular_position_in_ecliptic);
    cy += primaryY;
    const r = radius ? radiusScale(radius) : defaultRadius;

    if (cx == null || cy == null || r == null ||
        isNaN(cx) || isNaN(cy) || isNaN(r)) {
        console.log("Invalid body data", d.name, cx, cy, r);
        throw new Error("Invalid body data");
    }

    if (d.name == "Charon") {
        console.log("Charon", d, primary);
    }

    return {
        cx,
        cy,
        r
    }
}

/**
 * Get the circle that represents the sun
 * @param {Object} d
 * @param {Function} radiusScale
 * @return {Object}
 */
export const getSunCircle = (d, radiusScale) => {
    return {
        cx: 0,
        cy: 0,
        r: radiusScale(d.radius)
    }
}


export const updateBodiesVisData = (data, distanceScale, radiusScale) => {
    // Update the sun
    data.find(d => d.name === 'Sun').vis = {
        body: getSunCircle(data.find(d => d.name === 'Sun'), radiusScale)
    };
    // Update Sun orbiting bodies
    data.filter(d => d.name !== 'Sun' && d.primary === 'Sun').forEach(d => {
        d.vis = {
            body: getBodyCircle(d, data.find(p => p.name === d.primary), radiusScale, distanceScale),
            orbit: getOrbitEllipse(d, data.find(p => p.name === d.primary), distanceScale)
        }
        // Update the bodies orbiting this body
        data.filter(p => p.primary === d.name).forEach(p => {
            p.vis = {
                body: getBodyCircle(p, d, radiusScale, distanceScale),
                orbit: getOrbitEllipse(p, d, distanceScale)
            }
        });
    });

    return data;
}