import * as histogram from "./histogram.js";
import { Variable } from "../utils/variable.js";

/**
 * Calculate the semi-minor axis
 * @param {HTMLElement} selectElement
 * @param {Array<Variable>} options
 */
export const populateSelect = (selectElement, options) => {
    selectElement.innerHTML = '';
    options.forEach(option => {
        const newOption = document.createElement('option');
        newOption.value = option.selector;
        newOption.textContent = option.label;
        selectElement.appendChild(newOption);
    });

    selectElement.selectedIndex = 0;
}

/**
 * Call histogram
 * @param {HTMLElement} selectVarElement
 * @param {Array<Variable>} options
 * @param {Array} data
 * @param {HTMLElement} containerID
 */
export const callHistogram = (selectVarElement, options, data, containerID) => {
    let option = selectVarElement.options[selectVarElement.selectedIndex];
    option = options.find(o => o.selector === option.value);
    histogram.draw(containerID, data, option);
}