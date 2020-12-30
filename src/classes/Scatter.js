import {AnimObject} from './AnimObject.js'
//import {AddMathJax} from '../functions/AddMathJax.js'
export class Scatter extends AnimObject{


    constructor(params, aoParent){
    
        super(params, aoParent)
   
		this.scatter = this.aoG.append("g")

        let xScale = this.aoParent.attrVar.xScale
        let yScale = this.aoParent.attrVar.yScale
        // Initiate scatter
        this.scatter.selectAll("circle")
            .data(this.attrVar.data)
            .enter()
            .append("circle")
            .attr("r", function(d) {return d.r})
            .style("fill", function(d) {return d.color})
            .style("stroke", this.attrVar.stroke)
            .style("stroke-width", this.attrVar.strokeWidth)
            .attr("transform", function(d) {
                return " translate(" + (xScale(d.x)) +","+ (yScale(d.y)) +")"
            })
    }

	Draw({delay, duration, params={}}={}){

		d3.timeout(() => {
            
            // Pass extra draw parameter to circumvent position translating,
            // as path object is already positioned
            params["disable_translation_pos"] = true
            super.Draw({delay:0, duration:duration, params:params})

		}, delay=delay)
	}

}