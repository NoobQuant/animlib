import {AnimObject} from './AnimObject.js'
import {PathTween} from '../functions/PathTween.js'
export class Path extends AnimObject{

	constructor(params, aoParent){
		super(params, aoParent)

		// These are Path spesific
		this.curve		     = params.curve || d3.curveLinear
		this.pathSurfaceType = params.pathSurfaceType ||"parent"
		this.fill		   	 = params.fill || "none"

		let path = this.aoG.append("path")

		// Common path attributes
		path.style("fill", this.fill)
			.style('stroke-width', this.attrVar.strokeWidth)
			.style("stroke", this.attrVar.strokeColor)
			.attr("class", "lineAnimObject")
			// Clip area; can we move this to AnimObject?
			.attr("clip-path", "url(#" + this.aoParent.attrFix.id + "_clip" + ")")
			.attr("data", this.attrVar.data)

		this.path = path
	}

	Draw({delay, duration, params={}}={}){
		//let type = params.type || "drawpath"
		//let ease = params.ease || d3.easeLinear

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
			this.totalLength = this.path.node().getTotalLength()
		
			// Make sure draw parameters get updated for if caluse; if we go to normal AnimObject
			// draw this will happen twice, but hsould not matter
			this._UpdateDrawParams(params)

			// Draw
			if (this.attrDraw.drawType == "drawpath"){

				// Skip AnimObject draw, make sure draw parameters get updated and
				// show container group immediately
				this._UpdateDrawParams(params)
				d3.select('#'+ this.attrFix.id).style("opacity",1)
				
				this.path
					// Needed as AnimObject translate won't kick in with drawpath
					//.attr("transform",
					//"translate(" + this.aoParent.attrVar.xScale(this.attrVar.pos[0]) + "," +
					//	(this.aoParent.attrVar.yRange[1] - this.aoParent.attrVar.yScale(this.attrVar.pos[1])) + ")")
					.style('opacity',1)
					.attr("stroke-dasharray", this.totalLength + " " + this.totalLength)
					.attr("stroke-dashoffset", this.totalLength)
					.transition()
					.duration(duration)
					.ease(this.attrDraw.drawEase)
					.attr("stroke-dashoffset", 0)
					.on('end', function () {
						d3.select(this)
							.attr("stroke-dasharray", null)
							.attr("stroke-dashoffset", null)
					})
			

			} else {
			// If not specific draw for this class, use parent draws

				// First make sure path is visible withing the group
				this.path.style('opacity',1)
				
				// Also pass extra draw parameter to circumvent position translating,
				// as path object is already positioned
				//params["disable_translation_pos"] = true
				
				super.Draw({delay:0, duration:duration, params:params})

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

	Update({delay, duration, params={}}={}){
		let ease = params.ease || d3.easeCubic

		d3.timeout(() => {
			// Update common AnimObject
            //params["disable_translation_pos"] = true
			super.Update({delay:0, duration:duration, params:params})
		}, delay=delay)
		
		d3.timeout(() => {
		// Update Path specific
			let that = this
			this.aoG.selectAll("path")
				.transition()
				.duration(duration)
				.ease(ease)
				.attrTween("d", PathTween(
					that.aoParent.lineFunction(that.attrVar.data), 4)
				)
		}, delay+25)
	}
}