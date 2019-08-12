import {AnimObject} from './AnimObject.js'
export class Shape extends AnimObject{

	constructor(params){
		super(params)
    this.color       = params.color || "#666da3"
		this.strokeColor = params.strokeColor || "#D7E4DB" 
		this.strokeWidth = params.strokeWidth || 1
	}

	ChangeColor({color, delay, duration}={}){

		d3.select('#'+ this.id)
			.selectAll(".animShape")
		  .transition()
		  .duration(duration)
		  .delay(delay)
		  .style("fill", color)
	}
}