import * as histogram from "./histogram.js";

export const populateSelect = (selectElement, options) => {
    selectElement.innerHTML = '';
    options.forEach(option => {
        const newOption = document.createElement('option');
        newOption.value = option.value;
        newOption.textContent = option.text;
        selectElement.appendChild(newOption);
    });

    selectElement.selectedIndex = 0;
}

export const callHistogram = (selectVarElement, options, data, containerID) => {
    let option = selectVarElement.options[selectVarElement.selectedIndex];
    option = options.find(o => o.value === option.value);
    const { value, text, scale, filter } = option;
    let filteredData = data.filter(d => d[value] !== null && d[value] !== undefined);
    if (filter) {
        filteredData = filteredData.filter(filter);
    }
    if (scale === 'log') {
        filteredData = filteredData.filter(d => d[value] > 0);
    }
    histogram.draw(containerID, filteredData.map(d => d[value]), text, scale);
}

export const getScale = (data, scaleType, availablePixels) => {
    if (scaleType === 'linear') {
        return d3.scaleLinear()
            .domain(d3.extent(data))
            .range([0, availablePixels]); // Scaled to inner width
    } else if (scaleType === 'log') {
        return d3.scaleLog()
            .domain(d3.extent(data))
            .range([0, availablePixels]); // Scaled to inner width
    } else if (scaleType === 'time') {
        return d3.scaleTime()
            .domain(d3.extent(data))
            .range([0, availablePixels]); // Scaled to inner width
    } else if (scaleType === 'sqrt') {
        return d3.scaleSqrt()
            .domain(d3.extent(data))
            .range([0, availablePixels]); // Scaled to inner width
    } else {
        throw new Error("Invalid scale type");
    }
}

export const bigNumberToText = (value) => {
    if (value > 1000000) {
        return `${value / 1000000}M`;
    }
    if (value > 1000) {
        return `${value / 1000}K`;
    }
    return `${value}`;
}
