
export class AnimObject{

	constructor(params){
		this.id          = params.id		
		this.pos         = params.pos || [[0,0]]
		this.entPoint    = params.entPoint || [0,0]
		this.moveInScale = params.moveInScale || 1/5		
		this.moveInEase  = params.moveInEase || d3.easeBack
		this.svgid       = params.svgid || "bgsvg"

		this.group = d3.select('#'+this.svgid)
					   .append("g")
				       .attr("id", this.id)
					   .style("opacity", 0.0)
		this.currentAttr = {}
	}

	Draw({delay, duration, type = 'default'}={}){

		if (type == 'default'){
			d3.select('#'+ this.id)
				.attr("transform", "translate(" + this.pos[0][0] + "," + this.pos[0][1]  + ")")
				.transition()
				.duration(duration)
				.delay(delay)
				.style("opacity",1)
		} else if (type == 'movein'){
			d3.select("#"+this.id)
				.attr("transform", "translate(" + this.entPoint[0] + "," + this.entPoint[1]  + ")")
				.transition()
				.delay(delay)
				.duration(duration)
				.style("opacity",1.0)					
				.attr("transform", "translate(" + this.pos[0][0] + "," + this.pos[0][1]  + ")")
				.ease(this.moveInEase)			
		} else if (type == 'scalein'){
			d3.select("#"+this.id)
				.attr("transform", "translate(" + this.pos[0][0] + "," + this.pos[0][1]  + ") scale("+ this.moveInScale +")")
				.transition()
				.delay(delay)
				.duration(duration)
				.attr("transform", "translate(" + this.pos[0][0] + "," + this.pos[0][1]  + ") scale("+ 1 +")")
				.style("opacity",1.0)
				.ease(this.moveInEase)
		}
		// Save current basic attributes
		this.currentAttr.pos = this.pos[0]
		this.currentAttr.scale = 1		
	}

	Hide({delay, duration}={}){
		d3.select('#'+ this.id)
		  .transition()
		  .duration(duration)
		  .delay(delay)
		  .style("opacity",0.0)
	}

	Remove({delay}={}){
		/* Remove AnimObject*/
		d3.timeout(() => {
			d3.select('#'+ this.id).remove()
		},delay)
	}	

	Update({delay, duration, params}={}){
	// General update method for AnimObject: position and scale

		let ease = params.ease || d3.easePoly

		// Update current attributes
		this.currentAttr.pos 	 = params.moveStepNo == null ? this.currentAttr.pos : this.pos[params.moveStepNo]
		this.currentAttr.scale 	 = params.newScale || this.currentAttr.scale

		d3.select("#"+this.id)
	      .transition()
	      .delay(delay)
	      .duration(duration)
		  .attr("transform", "translate(" + this.currentAttr.pos[0] + "," + this.currentAttr.pos[1]  + ") scale("+ this.currentAttr.scale +")")
		  .ease(ease)	
	}
}

