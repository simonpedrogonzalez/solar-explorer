import { populateSelect } from "./utils.js";
import { getBodiesData } from "../../data/bodies.js";
import * as scatterPlot from "./scatterPlot.js";
import * as histogram from "./histogram.js";
import * as globalState from "../utils/globalState.js";
import { Variable, SCALE_TYPES } from "../utils/variable.js";

export const setup = async () => {

    const bodiesData = await getBodiesData();
    
    const bodiesVariables = [
        new Variable("radius", "Radius (km)", SCALE_TYPES.LOG, d => d.name !== "Sun"),
        new Variable("density", "Density (g/cm³)", SCALE_TYPES.LINEAR),
        new Variable("gravity", "Gravity (m/s²)", SCALE_TYPES.LINEAR),
        new Variable("sideral_orbit", "Sideral Orbit (days)", SCALE_TYPES.LOG),
        new Variable("sideral_rotation", "Sideral Rotation (hours)", SCALE_TYPES.LOG),
        new Variable("discovery_date", "Discovery Date", SCALE_TYPES.TIME),
        new Variable("avg_temp_kelvin", "Average Temperature (K)", SCALE_TYPES.LINEAR, d => d.name !== "Sun"),
        new Variable("mission_orbit_count", "Mission Orbit Count", SCALE_TYPES.LINEAR),
        new Variable("mission_dest_count", "Mission Destination Count", SCALE_TYPES.LINEAR),
        new Variable("semi_major_axis", "Semi Major Axis (AU)", SCALE_TYPES.LOG, null, (d) => {
            d['semi_major_axis'] = d.semi_major_axis ? d.semi_major_axis : d.semi_major_axis_0;
        }),
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

    histogram.draw(
        "bodies-hist",
        bodiesData,
        bodiesVariables.find((v) => v.selector === bodiesHistogramVariableSelector.value),
        "bodies-hist-reset-zoom-button"
    );
    bodiesHistogramVariableSelector.addEventListener("change", () => {
        histogram.draw(
            "bodies-hist",
            bodiesData,
            bodiesVariables.find((v) => v.selector === bodiesHistogramVariableSelector.value),
            "bodies-hist-reset-zoom-button"
        );
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
        scatterPlot.draw(
            scatterContainer,
            bodiesData,
            bodiesVariables.find((v) => v.selector === bodiesScatterSelectors.x.value),
            bodiesVariables.find((v) => v.selector === bodiesScatterSelectors.y.value),
            globalState.SELECTION_TYPES.BODY
        );
    });

    bodiesScatterSelectors.y.addEventListener("change", () => {
        scatterPlot.draw(
            scatterContainer,
            bodiesData,
            bodiesVariables.find((v) => v.selector === bodiesScatterSelectors.x.value),
            bodiesVariables.find((v) => v.selector === bodiesScatterSelectors.y.value),
            globalState.SELECTION_TYPES.BODY
        );
    });
}
