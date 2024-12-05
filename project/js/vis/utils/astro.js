import { updateOrbitalParameter, dateToJ2000Centuries } from "./time.js"

const RAD = Math.PI / 180.0;

export const calculatePlanetPosition = (d, date) => {
    const time = dateToJ2000Centuries(date);

    let a_0 = d.semi_major_axis_0;
    let a_dot = d.semi_major_axis_rate;
    let Omega_0 = d.longitude_of_ascending_node_0;
    let Omega_dot = d.longitude_of_ascending_node_rate;
    let w_0 = d.argument_of_periapsis_0;
    let w_dot = d.argument_of_periapsis_rate;
    let P_0 = d.orbital_period_0;
    let P_dot = d.orbital_period_rate;
    let M_0 = d.mean_anomaly_0;
    let M_dot = d.mean_anomaly_rate;

    const a = updateOrbitalParameter(a_0, a_dot, time); // Semi-major axis
    const e = 0; // Eccentricity ignored for now (doesn't play well with log scale)
    const b = semiMinAxis(a, e); // Semi-minor axis
    const incl = 0; // Inclination ignored for now
    const Omega = updateOrbitalParameter(Omega_0, Omega_dot, time, true); // Longitude of ascending node
    const w = updateOrbitalParameter(w_0, w_dot, time, true); // Argument of perihelion
    const P = updateOrbitalParameter(P_0, P_dot, time); // Orbital period
    let M = updateOrbitalParameter(M_0, M_dot, time, true) * RAD; // Mean anomaly (in radians)
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
        semi_major_axis: a,
        semi_minor_axis: b,
        eccentricity: e,
        inclination: incl,
        longitude_of_ascending_node: Omega,
        argument_of_periapsis: w,
        orbital_period: P,
        radial_distance_from_primary: eclR,
        angular_position_in_ecliptic: eclTheta,
    };
};

/**
 * Calculate the semi-minor axis
 * @param {number} a semi-major axis
 * @param {number} e eccentricity
 * @return {number}
 */
export const semiMinAxis = (a, e) => {
    // Calculate the semi-minor axis
    return a * Math.sqrt(1 - Math.pow(e, 2));
}
