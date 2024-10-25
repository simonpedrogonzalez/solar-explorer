

/**
 * Get the Julian day of a given epoch
 * @param {string} epoch
 * @return {number}
 */
export const getEpochJulianDay = (epoch) => {
    switch (epoch.toLowerCase()) {
        case "j2000":
            return 2451545.0;
        case "unix":
            return 2440587.5;
        case "julian":
            return 0.0;
        default:
            throw new Error(`Unknown epoch: ${epoch}`);
    }
}

/**
 * Convert a day in a given epoch to a reference epoch
 * @param {number} daysSinceEpoch
 * @param {string} epochFrom
 * @param {string} epochTo
 * @return {number}
 */
export const shiftEpoch = (daysSinceEpoch, epochFrom, epochTo) => {
    const julianDayFrom = getEpochJulianDay(epochFrom);
    const julianDayTo = getEpochJulianDay(epochTo);
    return daysSinceEpoch + julianDayFrom - julianDayTo;
}

export const daysToCenturies = (days) => {
    return days / 36525.0;
}

export const millisToDays = (millis) => {
    return millis / 86400000;
}

export const dateToJulianDay = (date) => {
    return date.getTime() / 86400000 + 2440587.5;
}

export const dateToJ2000Day = (date) => {
    const julianDay = dateToJulianDay(date);
    return shiftEpoch(julianDay, "julian", "j2000");
}

/**
 * Convert a date to Julian centuries since J2000
 * @param {Date} date
 * @return {number}
 */
export const dateToJ2000Centuries = (date) => {
    const julianDay = dateToJulianDay(date);
    const j2000Day = shiftEpoch(julianDay, "julian", "j2000");
    return daysToCenturies(j2000Day);
}

/**
 * Update parameter to the given date
 * @param {number} x0 initial value of the parameter in J2000
 * @param {number} xDot rate of change of the parameter in centuries
 * @param {number} time in centuries since J2000
 * @param {boolean} isAngular true if the parameter is angular
 * @return {number} updated parameter
 */
export const updateOrbitalParameter = (x0, xDot, time, isAngular=false) => {
    if(isAngular){
        return (x0 + xDot * time) % 360;
    }
    return x0 + xDot * time;
}
