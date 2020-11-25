import {AnimObject} from './AnimObject.js'
export class Svg extends AnimObject{
    /* Same as Canvas.js but extends AnimObject*/
	constructor(params, aoParent){
		super(params, aoParent)
        this.color       = params.color || "#080019"
		this.strokeColor = params.strokeColor || "black" 
        this.strokeWidth = params.strokeWidth || 0

        let svg = this.ao
                    .append("svg")
                    .attr("width", this.attrFix.aoParent.attrVar.xScale(this.attrVar.xRange[1]))
                    .attr("height", this.attrFix.aoParent.attrVar.yScale(this.attrVar.yRange[1]))

        // rectangle for svg for filling
        svg.append("rect")
            .style("fill", this.color)
            .attr("width", this.attrFix.aoParent.attrVar.xScale(this.attrVar.xRange[1]))
            .attr("height", this.attrFix.aoParent.attrVar.yScale(this.attrVar.yRange[1]))
            .style("stroke", this.strokeColor)
            .style("stroke-width", this.strokeWidth)

        // Make sure svg is on top
        svg.raise()
	}
}