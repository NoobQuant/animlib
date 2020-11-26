import {Path} from './Path.js'
export class Arrow extends Path {
    constructor(params, aoParent) {

		super(params, aoParent)
		var arrow = this.ao
					  .append("svg:path")
					  .attr("d", d3.symbol().type(d3.symbolTriangle))
					  .style('stroke', this.color)
					  .style('fill', this.color)
					  .style("opacity",0)
		this.arrow = arrow
	}
	
	_TranslateAlong(path){
		var l = path.getTotalLength();
		var ps = path.getPointAtLength(0);
		var pe = path.getPointAtLength(l);
		var angl = Math.atan2(pe.y - ps.y, pe.x - ps.x) * (180 / Math.PI) - 270;
		var rot_tran = "rotate(" + angl + ")";

		return function(d, i, a) {
			return function(t) {
			  var p = path.getPointAtLength(t * l);
			  return "translate(" + p.x + "," + p.y + ") " + rot_tran;
			};
		};
	};

	Draw({delay,duration, type="drawpath"}={}){

		if(type === "drawpath"){
			super.Draw({delay:delay,duration:duration,type:type})
			this.arrow.style("opacity",1)
			this.arrow.transition()
					.delay(delay)
					.duration(duration)
					.ease(d3.easeLinear)
					.attrTween("transform", this._TranslateAlong(this.path.node()))
		} else {

			// This is slightly inconvenient; it first transfers the arrow
			// to its end position
			this.arrow.transition()
					  .delay(0)
					  .duration(0)
					  .attrTween("transform", this._TranslateAlong(this.path.node()))
			
            super.Draw({delay:delay,duration:duration,type:type})
			this.arrow.transition()
					  .delay(delay)
					  .duration(duration)
					  .style("opacity",1)
		}
	}

}