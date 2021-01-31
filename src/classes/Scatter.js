import {AnimObject} from './AnimObject.js'
export class Scatter extends AnimObject{


    constructor(params, aoParent){
    
        super(params, aoParent)
   
		this.scatter = this.aoG.append("g")

        let xScale = this.aoParent.attrVar.xScale
        let yScale = this.aoParent.attrVar.yScale

        // Clip area; can we move this to AnimObject?
        this.scatter.attr("clip-path", "url(#" + this.aoParent.attrFix.id + "_clip" + ")")
        
        // Initiate scatter
        this.scatter.selectAll("circle")
            .data(this.attrVar.data)
            .enter()
            .append("circle")
            .attr("r", function(d) {return d.r})
            .style("fill", function(d) {return d.color})
            .style("stroke", this.attrVar.strokeColor)
            .style("stroke-width", this.attrVar.strokeWidth)

            .attr("transform", function(d) {
                return " translate(" + (xScale(d.x)) +","+ (yScale(d.y)) +")"
            })
    }

	Draw({delay, duration, params={}}={}){

		d3.timeout(() => {
            
            // Pass extra draw parameter to circumvent position translating,
            // as path object is already positioned
            //params["disable_translation_pos"] = true
            super.Draw({delay:0, duration:duration, params:params})

		}, delay=delay)
    }
    
	Update({delay, duration, params={}}={}){
		let ease = params.ease || d3.easeCubic

		d3.timeout(() => {
            // Update common AnimObject
            //params["disable_translation_pos"] = true
			super.Update({delay:0, duration:duration, params:params})
		}, delay=delay)
		
		d3.timeout(() => {
            // Update Scatter specific
            let xScale = this.aoParent.attrVar.xScale
            let yScale = this.aoParent.attrVar.yScale
            this.scatter.selectAll("circle")
                .data(this.attrVar.data)
                .transition()
                .duration(duration)
                .ease(ease)
                .attr("r", function(d) {return d.r})
                .style("fill", function(d) {return d.color})
                .style("stroke", this.attrVar.strokeColor)
                .style("stroke-width", this.attrVar.strokeWidth)
                .attr("transform", function(d) {
                    return "translate(" + (xScale(d.x)) + "," + (yScale(d.y)) +")"
                })
		}, delay+25)
	}

}