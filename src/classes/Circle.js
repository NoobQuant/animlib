import {Shape} from './Shape.js'
export class Circle extends Shape{	
	constructor(params){

		super(params)
		this.r     = params.r || 10
		let circle = this.group.append("circle")
								.attr("class", "animShape")
		                		.attr("r", this.r)
		                		.style("fill", this.color)
								.style("stroke", this.strokeColor)
		                		.style("stroke-width", params.strokeWidth)
	}

	Scale({delay, duration, newr}={}){
	// Scaling applying to circle radius element
		d3.select("#"+this.id)
		  .selectAll("circle")
	      .transition()
	      .delay(delay)
	      .duration(duration)
		  .attr("r", newr)
	}	
}
