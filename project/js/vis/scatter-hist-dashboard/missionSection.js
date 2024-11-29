import { callHistogram, populateSelect } from "./utils.js";
import { getMissionsData } from "../../data/missions.js";
import * as tooltip from "../utils/tooltip.js";
import * as globalState from "../utils/globalState.js";
import * as scatterPlot from "./scatterPlot.js";
import { Variable, SCALE_TYPES } from "../utils/variable.js";

export const setup = async () => {

    const missionData = await getMissionsData();

    const missionVariables = [
        new Variable("launch_date", "Launch Date", SCALE_TYPES.TIME),
        new Variable("total_mass", "Total Mass (kg)", SCALE_TYPES.LOG),
        new Variable("num_pieces", "# Spacecraft Pieces", SCALE_TYPES.LINEAR),
        new Variable("duration", "Duration (days)", SCALE_TYPES.LOG),
    ];

    const histogramContainer = document.getElementById("mission-hist");
    const scatterContainer = document.getElementById("mission-scatter");

    const missionHistogramVariableSelector = document.getElementById("hist-mission");
    const missionScatterSelectors = {
        x: document.getElementById("x-mission"),
        y: document.getElementById("y-mission")
    };

    populateSelect(missionHistogramVariableSelector, missionVariables);
    populateSelect(missionScatterSelectors.x, missionVariables);
    populateSelect(missionScatterSelectors.y, missionVariables);

    callHistogram(missionHistogramVariableSelector, missionVariables, missionData, "mission-hist");
    missionHistogramVariableSelector.addEventListener("change", () => {
        // console.log(missionHistogramVariableSelector.value);
        callHistogram(missionHistogramVariableSelector, missionVariables, missionData, "mission-hist");

    });

    missionHistogramVariableSelector.dispatchEvent(new Event('change'));

    missionScatterSelectors.x.addEventListener("change", () => {
        // console.log(missionScatterSelectors.x.value);
        scatterPlot.draw(
            scatterContainer,
            missionData,
            missionScatterSelectors.x.value,
            missionScatterSelectors.y.value,
            missionVariables.find((v) => v.selector === missionScatterSelectors.x.value).label,
            missionVariables.find((v) => v.selector === missionScatterSelectors.y.value).label,
            missionVariables.find((v) => v.selector === missionScatterSelectors.x.value).scaleType.toLowerCase(),
            missionVariables.find((v) => v.selector === missionScatterSelectors.y.value).scaleType.toLowerCase(),
            tooltip.TEXT_TYPES.MISSION_XY,
            globalState.SELECTION_TYPES.MISSION
        );
    });

    missionScatterSelectors.y.addEventListener("change", () => {
        // console.log(missionScatterSelectors.y.value);
        scatterPlot.draw(
            scatterContainer,
            missionData,
            missionScatterSelectors.x.value,
            missionScatterSelectors.y.value,
            missionVariables.find((v) => v.selector === missionScatterSelectors.x.value).label,
            missionVariables.find((v) => v.selector === missionScatterSelectors.y.value).label,
            missionVariables.find((v) => v.selector === missionScatterSelectors.x.value).scaleType.toLowerCase(),
            missionVariables.find((v) => v.selector === missionScatterSelectors.y.value).scaleType.toLowerCase(),
            tooltip.TEXT_TYPES.MISSION_XY,
            globalState.SELECTION_TYPES.MISSION
        );
    });

    missionScatterSelectors.x.value = "launch_date";
    missionScatterSelectors.y.value = "duration";

    missionScatterSelectors.x.dispatchEvent(new Event('change'));
}
