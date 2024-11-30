import * as globalState from "../utils/globalState.js";
import * as tooltip from "../utils/tooltip.js";
import { addZoom } from "./zoom.js";

const MARGIN = { left: 80, bottom: 50, top: 10, right: 10 };
const ANIMATION_DURATION = 300;
const MARKER_SIZE = 3;

let width, height;

export class ScatterPlot {

    constructor(containerID, resetZoomButtonID, globalStateSelectionType, data){
        this.containerID = containerID;
        const box = d3.select(containerID).node().getBoundingClientRect();
        this.width = box.width;
        this.height = box.height;
        this.resetZoomButtonID = resetZoomButtonID;
        
        this.data = data;
        
        this.globalStateSelectionType = globalStateSelectionType;
        // "Run this when the object selection changes"
        this.listenerID = globalState.suscribeToObjectSelection(this.onObjectSelection, globalStateSelectionType);

        this.svg = null;
        this.g = null;
    }

    reset(){
        d3.select(this.containerID).selectAll("*").remove();

        this.svg = d3.select(this.containerID)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        this.g = this.svg.append("g")
            .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);
        
        const zoomCenter = { x: this.width / 2 - MARGIN.left, y: this.height / 2 - MARGIN.top };
        addZoom(this.svg, this.g, this.width, this.height, zoomCenter, this.resetZoomButtonID);
    }

    onObjectSelection = (d, isSelected) => {
        console.log(d.name, isSelected);
        const g = this.g;
        const target = g.selectAll(`circle`).filter((d1) => d1.name === d.name);
        console.log(target.nodes());
        target
        .attr("fill", isSelected ? "red" : "steelblue")
    }

    draw(xVariable, yVariable){
        
        this.reset();

        const g = this.g;
        const width = this.width;
        const height = this.height;
        const xSelector = xVariable.selector;
        const ySelector = yVariable.selector;
        const xLabel = xVariable.label;
        const yLabel = yVariable.label;

        // Prepare the data by running variable-specific data preparation functions
        const data = yVariable.prepareData(xVariable.prepareData(this.data));
        
        // Get the scales but accounting for the margins
        let x = xVariable.getScale(data, width - MARGIN.left - MARGIN.right);
        x.range([0, width - MARGIN.left - MARGIN.right]);
        let y = yVariable.getScale(data, height - MARGIN.top - MARGIN.bottom);
        y.range([height - MARGIN.top - MARGIN.bottom, 0]);
        const xAxis = d3.axisBottom(x);
        const yAxis = d3.axisLeft(y);

        g.append("g")
        .attr("transform", `translate(0, ${height - MARGIN.top - MARGIN.bottom})`)
        .call(xAxis);

        g.append("g")
            .call(yAxis);

        // Add axis labels
        g.append("text")
            .attr("x", width / 2)
            .attr("y", height - MARGIN.bottom + 30)
            .style("text-anchor", "middle")
            .style("fill", "white")
            .text(xLabel);

        g.append("text")
            .attr("x", -(height-MARGIN.bottom) / 2)
            .attr("y",  MARGIN.left - 130)
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .style("fill", "white")
            .text(yLabel);


        g.selectAll("circle")
            .data(data)
            .join("circle")
            .attr('data-name', d => d.name)
            .attr("cx", d => x(d[xSelector]))
            .attr("cy", d => y(d[ySelector]))
            .on("mouseenter", (event, d) => {
                const content = tooltip.textParser.getTextFromVariables(d, xVariable, yVariable);
                tooltip.onMouseEnter(content);
            })
            .on("mousemove", (event) => tooltip.onMouseMove(event))
            .on("mouseleave", tooltip.onMouseLeave)
            .attr("r", MARKER_SIZE)
            .attr("fill", d =>  globalState.isObjectSelected(d, this.globalStateSelectionType) ? "red" : "steelblue")
            .transition()
            .duration(ANIMATION_DURATION);
    }
}
