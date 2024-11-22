import { populateSelect, callHistogram } from "./utils.js";
import { getBodiesData } from "../../data/bodies.js";
<<<<<<< HEAD:project/js/vis/scatter-hist-dashboard/bodySection.js
import * as histogram from "./histogram.js";
import * as scatterPlot from "./scatterPlot.js";
=======
>>>>>>> histogram-changes:project/js/vis/scatter-hist-dashboard/bodiesDataSection.js

export const setup = async () => {

    const bodiesData = await getBodiesData();
    
    const bodiesVariables = [
<<<<<<< HEAD:project/js/vis/scatter-hist-dashboard/bodySection.js
        { value: "radius", text: "Radius (km)", scale: "log" },
=======
        { value: "radius", text: "Radius (km)", scale: "log", filter: d => d.name !== "Sun" },
>>>>>>> histogram-changes:project/js/vis/scatter-hist-dashboard/bodiesDataSection.js
        // { value: "mass_value", text: "Mass Value (10^x kg)" },
        // { value: "mass_exponent", text: "Mass Exponent (kg)" },
        // { value: "vol_value", text: "Volume Value (10^x km³)" },
        // { value: "vol_exponent", text: "Volume Exponent (km³)" },
        { value: "density", text: "Density (g/cm³)", scale: "linear" },
        { value: "gravity", text: "Gravity (m/s²)", scale: "linear" },
<<<<<<< HEAD:project/js/vis/scatter-hist-dashboard/bodySection.js
        { value: "sideral_orbit", text: "Sideral Orbit (days)", scale: "log" },
        { value: "sideral_rotation", text: "Sideral Rotation (hours)", scale: "linear" },
        // { value: "discovered_by", text: "Discovered By" },
        { value: "discovery_date", text: "Discovery Date", scale: "time" },
=======
        { value: "sideral_orbit", text: "Sideral Orbit (days)", scale: "linear" },
        { value: "sideral_rotation", text: "Sideral Rotation (hours)", scale: "linear" },
        { value: "discovered_by", text: "Discovered By", scale: "linear" },
        { value: "discovery_date", text: "Discovery Date", scale: "linear" },
>>>>>>> histogram-changes:project/js/vis/scatter-hist-dashboard/bodiesDataSection.js
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

    bodiesHistogramVariableSelector.dispatchEvent(new Event('change'));

    bodiesScatterSelectors.x.addEventListener("change", () => {
        console.log(bodiesScatterSelectors.x.value);
        scatterPlot.draw(
            scatterContainer,
            bodiesData,
            bodiesScatterSelectors.x.value,
            bodiesScatterSelectors.y.value,
            bodiesVariables.find((v) => v.value === bodiesScatterSelectors.x.value).text,
            bodiesVariables.find((v) => v.value === bodiesScatterSelectors.y.value).text,
            bodiesVariables.find((v) => v.value === bodiesScatterSelectors.x.value).scale,
            bodiesVariables.find((v) => v.value === bodiesScatterSelectors.y.value).scale
        );
    });

    bodiesScatterSelectors.y.addEventListener("change", () => {
        console.log(bodiesScatterSelectors.y.value);
        scatterPlot.draw(
            scatterContainer,
            bodiesData,
            bodiesScatterSelectors.x.value,
            bodiesScatterSelectors.y.value,
            bodiesVariables.find((v) => v.value === bodiesScatterSelectors.x.value).text,
            bodiesVariables.find((v) => v.value === bodiesScatterSelectors.y.value).text,
            bodiesVariables.find((v) => v.value === bodiesScatterSelectors.x.value).scale,
            bodiesVariables.find((v) => v.value === bodiesScatterSelectors.y.value).scale
        );
    });
<<<<<<< HEAD:project/js/vis/scatter-hist-dashboard/bodySection.js

    bodiesScatterSelectors.x.value = "radius";
    bodiesScatterSelectors.y.value = "sideral_orbit";

    bodiesScatterSelectors.x.dispatchEvent(new Event('change'));
}
=======
}
>>>>>>> histogram-changes:project/js/vis/scatter-hist-dashboard/bodiesDataSection.js
