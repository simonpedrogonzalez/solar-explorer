import { populateSelect } from "./utils.js";
import { getBodiesData } from "../../data/bodies.js";
import * as histogram from "./histogram.js";

export const setup = async () => {

    const bodiesData = await getBodiesData();

    const bodiesVariables = [
        { value: "radius", text: "Radius (km)" },
        // { value: "mass_value", text: "Mass Value (10^x kg)" },
        // { value: "mass_exponent", text: "Mass Exponent (kg)" },
        // { value: "vol_value", text: "Volume Value (10^x km³)" },
        // { value: "vol_exponent", text: "Volume Exponent (km³)" },
        { value: "density", text: "Density (g/cm³)" },
        { value: "gravity", text: "Gravity (m/s²)" },
        { value: "sideral_orbit", text: "Sideral Orbit (days)" },
        { value: "sideral_rotation", text: "Sideral Rotation (hours)" },
        { value: "discovered_by", text: "Discovered By" },
        { value: "discovery_date", text: "Discovery Date" },
        { value: "avg_temp_kelvin", text: "Average Temperature (K)" }
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

    bodiesHistogramVariableSelector.addEventListener("change", () => {
        console.log(bodiesHistogramVariableSelector.value);
        histogram.draw(histogramContainer, bodiesData, bodiesHistogramVariableSelector.value);
        
    });

    bodiesScatterSelectors.x.addEventListener("change", () => {
        console.log(bodiesScatterSelectors.x.value);
    });

    bodiesScatterSelectors.y.addEventListener("change", () => {
        console.log(bodiesScatterSelectors.y.value);
    });
}
