import {AnimObject} from './AnimObject.js'
export class Path extends AnimObject{

	constructor(params, aoParent){
		super(params, aoParent)
		// There need moving to AnimObject
        this.color         = params.color || "steelblue"
		this.strokeWidth   = params.strokeWidth || 1
		this.fill		   = params.fill || "none"

		// These are Path spesific
		this.curve		   = params.curve || d3.curveLinear
		this.pathSurfaceType = params.pathSurfaceType ||"parent"

		let path
		if (this.pathSurfaceType === "parent"){
			path = this.ao.append("path")
				.attr("class", "line")
				.style('stroke', this.color)
				.style("opacity", 0)
				.style("fill", this.fill)
				.style('stroke-width', this.strokeWidth)
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
			path = this.ao.append("path")
				.data([this.attrVar.data])
				.attr("class", "line")
				.style('stroke', this.color)
				.style("opacity", 0)
				.style("fill", this.fill)
				.style('stroke-width', this.strokeWidth)
				.attr("d", (d) =>{ return that._LineData(d, this.curve)} )
		}

		this.path 		 = path
		this.totalLength = path.node().getTotalLength()
	}

	Draw({delay, duration, type = 'drawpath'}={}){

		if (type == 'drawpath'){

			// Show container group immediately
			d3.select('#'+ this.attrFix.id).style("opacity",1)

			// Draw path
			this.path
				.attr("transform", "translate(" + this.attrVar.pos[0] + "," + this.attrVar.pos[1] + ")")
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

	_LineData(d,curve){
		if (typeof(d) == "object"){
			return d3.line()
					.curve(curve)(d)
		} else if (typeof(d) == "string"){
			return d
		}
	}	
}