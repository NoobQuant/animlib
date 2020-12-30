import {Shape} from './Shape.js'
export class Rectangle extends Shape{
    constructor(params, aoParent){
        super(params, aoParent)
        this.dim = params.dim
        let rectangle = this.aoG.append("rect")
            .attr("class", "animShape")
            .attr("width", this.dim[0])
            .attr("height", this.dim[1])
            .style("fill", this.color)
            .style("stroke", this.strokeColor)
            .style("stroke-width", params.strokeWidth)
    }
}
