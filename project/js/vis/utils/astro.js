import { updateOrbitalParameter, dateToJ2000Centuries } from "./time.js"

const RAD = Math.PI / 180.0;

export const calculatePlanetPosition = (d, date) => {
    const time = dateToJ2000Centuries(date);

    const a = updateOrbitalParameter(d.a_0, d.a_dot, time); // Semi-major axis
    const e = 0; // Eccentricity ignored for now (doesn't play well with log scale)
    const b = semiMinAxis(a, e); // Semi-minor axis
    const incl = 0; // Inclination ignored for now
    const Omega = updateOrbitalParameter(d.Omega_0, d.Omega_dot, time, true); // Longitude of ascending node
    const w = updateOrbitalParameter(d.w_0, d.w_dot, time, true); // Argument of perihelion
    const P = updateOrbitalParameter(d.P_0, d.P_dot, time); // Orbital period
    let M = updateOrbitalParameter(d.M_0, d.M_dot, time, true) * RAD; // Mean anomaly (in radians)
    if (M > Math.PI) M -= 2*Math.PI; // Mean anomaly -π to π

    // Calculate eccentric anomaly from Mean anomaly and eccentricity
    let E = M + e * Math.sin(M);
    let delE = 1;
    while (Math.abs(delE) > 1e-6) {
        let delM = M - (E - e * Math.sin(E));
        delE = delM / (1 - e * Math.cos(E));
        E = E + delE;
    }

    // Calculate position in orbital plane
    const orbX = a * (Math.cos(E) - e);
    const orbY = b * Math.sin(E);

    // Convert to radial and angular coordinates
    const eclR = Math.sqrt(Math.pow(orbX, 2) + Math.pow(orbY, 2));
    const eclTheta = -(Math.atan2(orbY, orbX) + w*RAD + Omega*RAD);

    return {
        id: d.id,
        name: d.name,
        color: d.color,
        radius: d.radius,
        rotperiod: d.rotperiod,
        mass: d.mass,
        primary: d.primary,
        a: a,
        b: b,
        e: e,
        incl: incl,
        Omega: Omega,
        w: w,
        P: P,
        eclR: eclR,
        eclTheta: eclTheta,
    };
}

// export const calculatePlanet2DOrbit = (d) => {
//     const dd = new Date();
//     const semiMajAxis = updateOrbitalParameter(d.a_0, d.a_dot, dd); // Semi-major axis
//     const ecc = updateOrbitalParameter(d.e_0, d.e_dot, dd); // Eccentricity
//     const semiMinAxis_ = semiMinAxis(semiMajAxis, ecc); // Semi-minor axis
//     const longAscNode = updateOrbitalParameter(d.Omega_0, d.Omega_dot, dd, true); // Longitude of the ascending node
//     const perihelion = updateOrbitalParameter(d.w_0, d.w_dot, dd, true); // Argument of perihelion
//     const orbitRotation = (longAscNode + perihelion) % 360.0; // Orbit rotation
//     return {
//         semiMajAxis,
//         semiMinAxis_,
//         orbitRotation
//     }
// }


/**
 * Calculate the semi-minor axis
 * @param {number} a semi-major axis
 * @param {number} e eccentricity
 * @return {number}
 */
const semiMinAxis = (a, e) => {
    // Calculate the semi-minor axis
    return a * Math.sqrt(1 - Math.pow(e, 2));
}


