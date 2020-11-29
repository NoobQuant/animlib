import {AnimObject} from './AnimObject.js'
import {PathTween} from '../functions/PathTween.js'
export class Path extends AnimObject{

	constructor(params, aoParent){
		super(params, aoParent)

		// These are Path spesific
		this.curve		     = params.curve || d3.curveLinear
		this.pathSurfaceType = params.pathSurfaceType ||"parent"
		this.fill		   	 = params.fill || "none"

		let path = this.ao.append("path")
		//if (this.pathSurfaceType === "parent"){
		//	path = this.ao.append("path")
		//		.style("opacity", 0)
		//		.attr("d", this.aoParent.lineFunction(this.attrVar.data))
		//} else if (this.pathSurfaceType === "canvas") {
		//	// This is an alternative solution leveraging _LineData method. It has
		//	// possibility to draw intepolated curves and curves from SVG path definition.
		//	// It essentially assumes that the parent on which path is drawn has full
		//	// pixel dimension size 1930 x 1090 and 1-to-1 data domain with this.
		//	// This does not go straightforwardly with inner space definitions of more
		//	// complicated prant objects, such paths should only be drawn on canvas.
		//	// Here we check whether this is the case; if-clause could be made to leverage
		//	// type of parent and to get rid of the extra variable pathSurfaceType
		//	let that = this
		//	path = this.ao.append("path")
		//		.data([this.attrVar.data])
		//		.style("opacity", 0)
		//		.attr("d", (d) =>{ return that._LineData(d, this.curve)} )
		//}

		// Common path attributes
		path.style("fill", this.fill)
			.style('stroke-width', this.attrVar.strokeWidth)
			.style("stroke", this.attrVar.strokeColor)
			.attr("class", "plotLine")
			.attr("clip-path", "url(#" + this.aoParent.attrFix.id + "_clip" + ")")

		this.path 		 = path
	}

	Draw({delay, duration, type = 'drawpath'}={}){

		d3.timeout(() => {

			// Transform path data in this.attrVar.data into pixel space positions
			// based on current inner space scales in parent AnimObject
			if (this.pathSurfaceType === "parent"){
				this.path.style("opacity", 0)
					.attr("d", this.aoParent.lineFunction(this.attrVar.data))
			} else if (this.pathSurfaceType === "canvas") {
				// This is an alternative solution leveraging _LineData method. It has
				// possibility to draw intepolated curves and curves from SVG path definition.
				// It essentially assumes that the parent on which path is drawn has full
				// pixel dimension size 1930 x 1090 and 1-to-1 data domain with this.
				// This does not go straightforwardly with inner space definitions of more
				// complicated prant objects, such paths should only be drawn on canvas.
				// Here we check whether this is the case; if-clause could be made to leverage
				// type of parent and to get rid of the extra variable pathSurfaceType
				let that = this
				this.path.data([this.attrVar.data])
					.style("opacity", 0)
					.attr("d", (d) =>{ return that._LineData(d, this.curve)} )
			}

			// Draw path
			if (type == 'drawpath'){

				// Show container group immediately
				d3.select('#'+ this.attrFix.id).style("opacity",1)
				let totalLength = this.path.node().getTotalLength()
				this.path
					.attr("transform",
					"translate(" + this.aoParent.attrVar.xScale(this.attrVar.pos[0]) + "," +
						(this.aoParent.attrVar.yRange[1] - this.aoParent.attrVar.yScale(this.attrVar.pos[1])) + ")")
					.style('opacity',1)
					.attr("stroke-dasharray", totalLength + " " + totalLength)
					.attr("stroke-dashoffset", totalLength)
					.transition()
					.duration(duration)
					.ease(d3.easeLinear)
					.attr("stroke-dashoffset", 0)
			} else {
			// If not specific draw for this class, use parent draws
			// Make sure path is visible first!
				this.path.style('opacity',1)
				super.Draw({delay:0, duration:duration, type:type})

			}
		}, delay=delay)
	}

	_LineData(d,curve){
		if (typeof(d) == "object"){
			return d3.line()
					.curve(curve)(d)
		} else if (typeof(d) == "string"){
			return d
		}
	}

	Update({delay, duration, params={}, ease = d3.easeCubic}={}){

		d3.timeout(() => {

			// Update AnimObject
			super.Update({delay:0, duration:duration, params:params})


		}, delay=delay)
		
		d3.timeout(() => {

		/*
		Would be cool to merge this with Draw As in DrawHistogram().
		Not sure how axis label update works here but it just does...
		*/

		// Update Path AnimObject
		let that = this
		this.ao.selectAll("path")
			.transition()
			.duration(duration)
			.ease(ease)
			.attrTween("d", PathTween(that.aoParent.lineFunction(that.attrVar.data), 4))

		}, delay+25)




	}

}