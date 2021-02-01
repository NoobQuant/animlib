import {Shape} from './Shape.js'
export class Circle extends Shape{	
	constructor(params, aoParent){

		super(params, aoParent)
		this.r     = params.r || 10
		let circle = this.aoG.append("circle")
			.attr("class", "animShape")
			.attr("r", this.r)
			.style("fill", this.color)
			.style("stroke", this.strokeColor)
			.style("stroke-width", params.strokeWidth)
	}

	Scale({delay, duration, newr}={}){
	// Scaling applying to circle radius element
		this.aoG
			.selectAll("circle")
			.transition()
			.delay(delay)
			.duration(duration)
			.attr("r", newr)
	}
}
