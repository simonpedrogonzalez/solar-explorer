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
};