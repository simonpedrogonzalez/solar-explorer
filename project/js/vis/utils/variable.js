
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
                break;
        case SCALE_TYPES.LOG:
            return d3.scaleLog()
                .domain(d3.extent(data))
                .range([0, availablePixels]);
                break;
        case SCALE_TYPES.TIME:
            return d3.scaleTime()
                .domain(d3.extent(data))
                .range([0, availablePixels]);
                break;
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
        if (!data[0].hasOwnProperty(this.selector)) {
            throw new Error(`Data does not have property ${this.selector}`);
        }
        return getScale(data.map(d => d[this.selector]), this.scaleType, availablePixels);    
    }

    prepareData(data) {
        let filteredData = data;
        if (this.transform) {
            filteredData.forEach(this.transform);
        }
        filteredData = data.filter(d => d[this.selector] !== null && d[this.selector] !== undefined);
        if (this.filter) {
            filteredData = filteredData.filter(this.filter);
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

    valueAndLabelToText(value) {
        let text = this.label + ": ";
        switch (this.scaleType) {
            case SCALE_TYPES.TIME:
                text += timeToText(value);
                break;
            case SCALE_TYPES.LINEAR:
            case SCALE_TYPES.LOG:
                text += numberToText(value);
                break;
        }
        return text;
    }

    valueToText(value) {
        let text = "";
        switch (this.scaleType) {
            case SCALE_TYPES.TIME:
                text += timeToText(value);
                break;
            case SCALE_TYPES.LINEAR:
            case SCALE_TYPES.LOG:
                text += numberToText(value);
                break;
        }
        return text;
    }
}

export const numberToText = (value) => {
    if (value > 1000000) {
        return `${(value / 1000000).toFixed(2)}M`;
    }
    if (value > 1000) {
        return `${(value / 1000).toFixed(2)}K`;
    }
    if (value % 1 !== 0) {
        const decimalPart = value.toString().split('.')[1];
        if (decimalPart) {
            let result = '';
            let count = 0;
            for (const char of decimalPart) {
                result += char;
                if (char !== '0') count++;
                if (count === 2) break;
            }
            return `${Math.floor(value)}.${result}`;
        }
    }
    return `${value}`;
};



export const timeToText = (value) => {
    return value.getFullYear();
}