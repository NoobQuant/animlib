import {AnimObject} from './AnimObject.js'
export class Svg extends AnimObject{

	constructor(params){
		super(params)
        this.color       = params.color || "#080019"
		this.strokeColor = params.strokeColor || "black" 
        this.strokeWidth = params.strokeWidth || 0
        this.dim         = params.dim || [1930, 1090]

        let svg = this.ao
                    .append("svg")
                    .attr("width", this.dim[0])
                    .attr("height", this.dim[1])

        // rectangle for svg for filling 	
        svg.append("rect")
            .style("fill", this.color)
            .attr("width", this.dim[0])
            .attr("height", this.dim[1])
            .style("stroke", this.strokeColor)
            .style("stroke-width", this.strokeWidth)		
        
        // Make sure svg is on top
        svg.raise()
	}
}