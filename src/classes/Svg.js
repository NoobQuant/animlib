import {AnimObject} from './AnimObject.js'
export class Svg extends AnimObject{
    /* Same as Canvas.js but extends AnimObject*/
	constructor(params, aoParent){
		super(params, aoParent)
        this.color       = params.color || "#080019"
		this.strokeColor = params.strokeColor || "black" 
        this.strokeWidth = params.strokeWidth || 0

        let svg = this.aoG
            .append("svg")
            .attr("width", this.aoParent.attrVar.xScale(this.attrVar.xRange[1]))
            .attr("height", this.aoParent.attrVar.yScale(this.aoParent.attrVar.yScale(this.aoParent.attrVar.pos[1]) - this.attrVar.yRange[1]))

        // rectangle for svg for filling
        svg.append("rect")
            .style("fill", this.color)
            .attr("width", this.aoParent.attrVar.xScale(this.attrVar.xRange[1]))
            .attr("height", this.aoParent.attrVar.yScale(this.aoParent.attrVar.yScale(this.aoParent.attrVar.pos[1]) - this.attrVar.yRange[1]))
            .style("stroke", this.strokeColor)
            .style("stroke-width", this.strokeWidth)

        // Make sure svg is on top
        svg.raise()
	}
}