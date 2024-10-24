import { updateOrbitalParameter, daysToCenturies, dateToJ2000Day, shiftEpoch, dateToJulianDay, dateToJ2000Centuries } from "./timeUtils.js"





// this dont work
export const calculatePlanetPosition2 = (d) => {

    // const dd = new Date();
    // 19 april 1990
    const date = new Date(1990, 4, 19);
    const dd = dateToJ2000Centuries(date);
    const a = updateOrbitalParameter(d.a_0, d.a_dot, dd); // Semi-major axis
    const e = updateOrbitalParameter(d.e_0, d.e_dot, dd); // Eccentricity
    const b = semiMinAxis(a, e); // Semiminor axis
    const incl = updateOrbitalParameter(d.incl_0, d.incl_dot, dd, true); // Inclination
    let Omega = updateOrbitalParameter(d.Omega_0, d.Omega_dot, dd); // Longitude of the ascending node
    let w = updateOrbitalParameter(d.w_0, d.w_dot, dd); // Argument of perihelion
    const Tp = updateOrbitalParameter(d.Tp_0, d.Tp_dot, dd); // Time of perihelion passage
    let P = updateOrbitalParameter(d.P_0, d.P_dot, dd); // Orbital period (centuries)
    P = daysToCenturies(P); // Convert days to centuries
    const n = updateOrbitalParameter(d.n_0, d.n_dot, dd); // Mean motion
    
    let rad = Math.PI / 180;
    let M = d.curr_M * rad;
    if (M > Math.PI) M -= 2*Math.PI; // Mean anomaly -π to π
    let E = M + e * Math.sin(M);
    let delE = 1;
    while (Math.abs(delE) > 1e-6) {
        let delM = M - (E - e * Math.sin(E));
        delE = delM / (1 - e * Math.cos(E));
        E = E + delE;
    }
    const orbX = a * (Math.cos(E) - e);
    const orbY = b * Math.sin(E);
    const eclR = Math.sqrt(Math.pow(orbX, 2) + Math.pow(orbY, 2));
    const eclTheta = -(Math.atan2(orbY, orbX) + w*rad + Omega*rad);

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
        Tp: Tp,
        P: P,
        eclR: eclR,
        eclTheta: eclTheta,
    }
}

export const calculatePlanet2DOrbit = (d) => {
    const dd = new Date();
    const semiMajAxis = updateOrbitalParameter(d.a_0, d.a_dot, dd); // Semi-major axis
    const ecc = updateOrbitalParameter(d.e_0, d.e_dot, dd); // Eccentricity
    const semiMinAxis = semiMinAxis(semiMajAxis, ecc); // Semi-minor axis
    const longAscNode = updateOrbitalParameter(d.Omega_0, d.Omega_dot, dd); // Longitude of the ascending node
    const perihelion = updateOrbitalParameter(d.w_0, d.w_dot, dd); // Argument of perihelion
    const orbitRotation = (longAscNode + perihelion) % 360.0; // Orbit rotation
    return {
        semiMajAxis,
        semiMinAxis,
        orbitRotation
    }
}


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


