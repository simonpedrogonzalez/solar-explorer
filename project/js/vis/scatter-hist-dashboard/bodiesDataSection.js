import { populateSelect, callHistogram } from "./utils.js";
import { getBodiesData } from "../../data/bodies.js";

export const setup = async () => {

    const bodiesData = await getBodiesData();
    
    const bodiesVariables = [
        { value: "radius", text: "Radius (km)", scale: "log", filter: d => d.name !== "Sun" },
        // { value: "mass_value", text: "Mass Value (10^x kg)" },
        // { value: "mass_exponent", text: "Mass Exponent (kg)" },
        // { value: "vol_value", text: "Volume Value (10^x km³)" },
        // { value: "vol_exponent", text: "Volume Exponent (km³)" },
        { value: "density", text: "Density (g/cm³)", scale: "linear" },
        { value: "gravity", text: "Gravity (m/s²)", scale: "linear" },
        { value: "sideral_orbit", text: "Sideral Orbit (days)", scale: "linear" },
        { value: "sideral_rotation", text: "Sideral Rotation (hours)", scale: "linear" },
        { value: "discovered_by", text: "Discovered By", scale: "linear" },
        { value: "discovery_date", text: "Discovery Date", scale: "linear" },
        { value: "avg_temp_kelvin", text: "Average Temperature (K)", scale: "linear" },
    ];

    const histogramContainer = document.getElementById("bodies-hist");
    const scatterContainer = document.getElementById("bodies-scatter");

    const bodiesHistogramVariableSelector = document.getElementById("bodies-hist-var-select");

    const bodiesScatterSelectors = {
        x: document.getElementById("bodies-scatter-x-select"),
        y: document.getElementById("bodies-scatter-y-select")
    };

    populateSelect(bodiesHistogramVariableSelector, bodiesVariables);
    populateSelect(bodiesScatterSelectors.x, bodiesVariables);
    populateSelect(bodiesScatterSelectors.y, bodiesVariables);

    console.log(bodiesData);

    callHistogram(bodiesHistogramVariableSelector, bodiesVariables, bodiesData, "bodies-hist");
    bodiesHistogramVariableSelector.addEventListener("change", () => {
        callHistogram(bodiesHistogramVariableSelector, bodiesVariables, bodiesData, "bodies-hist");
    });

    bodiesScatterSelectors.x.addEventListener("change", () => {
        console.log(bodiesScatterSelectors.x.value);
    });

    bodiesScatterSelectors.y.addEventListener("change", () => {
        console.log(bodiesScatterSelectors.y.value);
    });
}