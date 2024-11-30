import { populateSelect, callHistogram } from "./utils.js";
import { getBodiesData } from "../../data/bodies.js";
import * as scatterPlot from "./scatterPlot.js";
import * as tooltip from "../utils/tooltip.js";
import * as globalState from "../utils/globalState.js";
import { Variable, SCALE_TYPES } from "../utils/variable.js";

export const setup = async () => {

    const bodiesData = await getBodiesData();
    
    const bodiesVariables = [
        new Variable("radius", "Radius (km)", SCALE_TYPES.LOG, d => d.name !== "Sun"),
        new Variable("density", "Density (g/cm³)", SCALE_TYPES.LINEAR),
        new Variable("gravity", "Gravity (m/s²)", SCALE_TYPES.LINEAR),
        new Variable("sideral_orbit", "Sideral Orbit (days)", SCALE_TYPES.LINEAR),
        new Variable("sideral_rotation", "Sideral Rotation (hours)", SCALE_TYPES.LINEAR),
        new Variable("discovery_date", "Discovery Date", SCALE_TYPES.TIME),
        new Variable("avg_temp_kelvin", "Average Temperature (K)", SCALE_TYPES.LINEAR),
        new Variable("mission_orbit_count", "Mission Orbit Count", SCALE_TYPES.LINEAR),
        new Variable("mission_dest_count", "Mission Destination Count", SCALE_TYPES.LINEAR),
        new Variable("semi_major_axis", "Semi Major Axis (AU)", SCALE_TYPES.LOG),
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

    // console.log(bodiesData);

    callHistogram(bodiesHistogramVariableSelector, bodiesVariables, bodiesData, "bodies-hist");
    bodiesHistogramVariableSelector.addEventListener("change", () => {
        callHistogram(bodiesHistogramVariableSelector, bodiesVariables, bodiesData, "bodies-hist");
    });

    bodiesHistogramVariableSelector.dispatchEvent(new Event('change'));


    bodiesScatterSelectors.x.value = "discovery_date";
    bodiesScatterSelectors.y.value = "semi_major_axis";

    scatterPlot.draw(
        scatterContainer,
        bodiesData,
        bodiesVariables.find((v) => v.selector === bodiesScatterSelectors.x.value),
        bodiesVariables.find((v) => v.selector === bodiesScatterSelectors.y.value),
        globalState.SELECTION_TYPES.BODY
    );

    bodiesScatterSelectors.x.addEventListener("change", () => {
        // console.log(bodiesScatterSelectors.x.value);
        scatterPlot.draw(
            scatterContainer,
            bodiesData,
            bodiesVariables.find((v) => v.selector === bodiesScatterSelectors.x.value),
            bodiesVariables.find((v) => v.selector === bodiesScatterSelectors.y.value),
            globalState.SELECTION_TYPES.BODY
        );
    });

    bodiesScatterSelectors.y.addEventListener("change", () => {
        // console.log(bodiesScatterSelectors.y.value);
        scatterPlot.draw(
            scatterContainer,
            bodiesData,
            bodiesVariables.find((v) => v.selector === bodiesScatterSelectors.x.value),
            bodiesVariables.find((v) => v.selector === bodiesScatterSelectors.y.value),
            globalState.SELECTION_TYPES.BODY
        );
    });
}
