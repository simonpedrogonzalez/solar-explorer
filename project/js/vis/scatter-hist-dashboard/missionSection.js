import { populateSelect } from "./utils.js";
import * as histogram from "./histogram.js";
import { getMissionsData } from "../../data/missions.js";
import * as globalState from "../utils/globalState.js";
import { ScatterPlot } from "./scatterPlot.js";
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

    histogram.draw(
        "mission-hist",
        missionData,
        missionVariables.find((v) => v.selector === missionHistogramVariableSelector.value),
        "mission-hist-reset-zoom-button"
    );
    missionHistogramVariableSelector.addEventListener("change", () => {
        histogram.draw(
            "mission-hist",
            missionData,
            missionVariables.find((v) => v.selector === missionHistogramVariableSelector.value),
            "mission-hist-reset-zoom-button"
        );

    });

    missionHistogramVariableSelector.dispatchEvent(new Event('change'));

    const scatterPlot = new ScatterPlot(
        scatterContainer,
        "mission-scatter-reset-zoom-button",
        globalState.SELECTION_TYPES.MISSION,
        missionData
    );

    missionScatterSelectors.x.addEventListener("change", () => {
        scatterPlot.draw(
            missionVariables.find((v) => v.selector === missionScatterSelectors.x.value),
            missionVariables.find((v) => v.selector === missionScatterSelectors.y.value)
        )
    });

    missionScatterSelectors.y.addEventListener("change", () => {
        scatterPlot.draw(
            missionVariables.find((v) => v.selector === missionScatterSelectors.x.value),
            missionVariables.find((v) => v.selector === missionScatterSelectors.y.value)
        )
    });

    missionScatterSelectors.x.value = "launch_date";
    missionScatterSelectors.y.value = "duration";

    missionScatterSelectors.x.dispatchEvent(new Event('change'));
}
