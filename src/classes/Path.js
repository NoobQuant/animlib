import {AnimObject} from './AnimObject.js'
import {LineData} from '../functions/LineData.js'
export class Path extends AnimObject{
	/*
	Draws a svg path.
		- pathData: either array of arrays (designating [x,y] points) or svg path string.

	Extends AnimObject. If params.pos for group container is is given, all path coordinates
	are to be understood relative to that position. 
	*/

	constructor(params){
		super(params)
		this.pathData      = params.pathData
        this.color         = params.color || "steelblue"
		this.strokeWidth   = params.strokeWidth || 1
		this.curve		   = params.curve || d3.curveLinear
		this.fill		   = params.fill || "none"		
		
		let path = this.ao.append("path")
							 .data([this.pathData])						
							 .attr("class", "line")
							 .style('stroke', this.color)
							 .style("opacity", 0)
							 .style("fill",this.fill)
							 .style('stroke-width', this.strokeWidth)
							 .attr("d", (d) =>{ return LineData(d, this.curve)} )		  
		
		//this.ao 		 = group
		this.path 		 = path
		this.totalLength = path.node().getTotalLength()
	}

	Draw({delay, duration, type = 'drawpath'}={}){

		if (type == 'drawpath'){

			// Show container group immediately
			d3.select('#'+ this.id).style("opacity",1)

			// Draw path
			this.path
				    .attr("transform", "translate(" + this.pos[0][0] + "," + this.pos[0][1] + ")")
					.style('opacity',1)
					.attr("stroke-dasharray", this.totalLength + " " + this.totalLength)
					.attr("stroke-dashoffset", this.totalLength)
					.transition()
					.delay(delay)
					.duration(duration)        
					.ease(d3.easeLinear)
					.attr("stroke-dashoffset", 0)
		} else {
		// If not specific draw for this class, use parent draws
		// Make sure path is visible first!
			this.path.style('opacity',1)
			super.Draw({delay:delay, duration:duration, type:type})

		}
	}
}