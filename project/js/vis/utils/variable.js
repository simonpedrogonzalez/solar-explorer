
export const SCALE_TYPES = {
    LINEAR: "LINEAR",
    LOG: "LOG",
    TIME: "TIME",
};

export const getScale = (data, scaleType, availablePixels) => {
    switch (scaleType) {
        case SCALE_TYPES.LINEAR:
            return d3.scaleLinear()
                .domain(d3.extent(data))
                .range([0, availablePixels]);
        case SCALE_TYPES.LOG:
            return d3.scaleLog()
                .domain(d3.extent(data))
                .range([0, availablePixels]);
        case SCALE_TYPES.TIME:
            return d3.scaleTime()
                .domain(d3.extent(data))
                .range([0, availablePixels]);
        default:
            throw new Error("Invalid scale type: " + scaleType);
    }
}


export class Variable {
    constructor(selector, label, scaleType, filter=null, transform=null) {
        this.selector = selector;
        this.label = label;
        this.scaleType = scaleType;
        this.filter = filter;
        this.transform = transform;
    }

    /**
     * Data must be already prepared
     * @param {Array<Object>} data 
     * @param {number} availablePixels 
     */
    getScale(data, availablePixels) {
        return getScale(data.map(d => d[this.selector]), this.scaleType, availablePixels);    
    }

    prepareData(data) {
        let filteredData = data.filter(d => d[this.selector] !== null && d[this.selector] !== undefined);
        if (this.filter) {
            filteredData = filteredData.filter(this.filter);
        }
        if (this.transform) {
            filteredData = filteredData.map(this.transform);
        }
        if (this.scaleType === SCALE_TYPES.LOG) {
            filteredData = filteredData.filter(d => d[this.selector] > 0);
        }
        if (this.scaleType === SCALE_TYPES.TIME) {
            filteredData.forEach(d => {
                d[this.selector] = new Date(d[this.selector]);
            });
        }
        return filteredData;
    }

    valueToText(value) {
        let text = this.label;
        switch (this.scaleType) {
            case SCALE_TYPES.TIME:
                text += timeToText(value);
            default:
                text += numberToText(value);
        }
        return text;
    }


}

export const numberToText = (value) => {
    if (value > 1000000) {
        return `${value / 1000000}M`;
    }
    if (value > 1000) {
        return `${value / 1000}K`;
    }
    if (value % 1 !== 0) {
        return value.toFixed(2);
    }
    return `${value}`;
}

export const timeToText = (value) => {
    return value.getFullYear();
}