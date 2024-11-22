import { callHistogram, populateSelect } from "./utils.js";
import { getMissionsData } from "../../data/missions.js";
import * as histogram from "./histogram.js";
import * as scatterPlot from "./scatterPlot.js";

export const setup = async () => {

    const missionData = await getMissionsData();

    const missionVariables = [
        { value: "launch_date", text: "Launch Date", scale: "time" },
        { value: "total_mass", text: "Total Mass (kg)", scale: "log" },
        { value: "num_pieces", text: "# Spacecraft Pieces", scale: "linear" },
        { value: "duration", text: "Duration (days)", scale: "log" },
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
            missionVariables.find((v) => v.value === missionScatterSelectors.x.value).text,
            missionVariables.find((v) => v.value === missionScatterSelectors.y.value).text,
            missionVariables.find((v) => v.value === missionScatterSelectors.x.value).scale,
            missionVariables.find((v) => v.value === missionScatterSelectors.y.value).scale
        );
    });

    missionScatterSelectors.y.addEventListener("change", () => {
        // console.log(missionScatterSelectors.y.value);
        scatterPlot.draw(
            scatterContainer,
            missionData,
            missionScatterSelectors.x.value,
            missionScatterSelectors.y.value,
            missionVariables.find((v) => v.value === missionScatterSelectors.x.value).text,
            missionVariables.find((v) => v.value === missionScatterSelectors.y.value).text,
            missionVariables.find((v) => v.value === missionScatterSelectors.x.value).scale,
            missionVariables.find((v) => v.value === missionScatterSelectors.y.value).scale
        );
    });

    missionScatterSelectors.x.value = "launch_date";
    missionScatterSelectors.y.value = "duration";

    missionScatterSelectors.x.dispatchEvent(new Event('change'));
}
