import {Path} from './Path.js'
export class Arrow extends Path {
    constructor(params, aoParent) {

		super(params, aoParent)
		var arrow = this.aoG
			.append("svg:path")
			.attr("d", d3.symbol().type(d3.symbolTriangle))
			.style('stroke', this.attrVar.strokeColor)
			.style('fill', this.attrVar.strokeColor)
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

	Draw({delay,duration, params={}}={}){
		let type = params.drawType || "drawpath"
		d3.timeout(() => {

			if(type === "drawpath"){

				// Draw shaft of arrow (path object)
				super.Draw({delay:0, duration:duration, params:params})
				
				d3.timeout(() => {
					this.arrow
						.style("opacity",1)
					
					this.arrow.transition()
						.duration(duration)
						.ease(this.attrDraw.drawEase)
						.attrTween("transform", this._TranslateAlong(this.path.node()))
				}, delay=0)
			} else {

				super.Draw({delay:0, duration:duration, params:params})
				
				d3.timeout(() => {
					// This is slightly inconvenient; it first transfers the arrow
					// to its end position
					this.arrow.transition()
						.duration(0)
						.attrTween("transform", this._TranslateAlong(this.path.node()))
					
					this.arrow.transition()
						.duration(duration)
						.ease(this.attrDraw.drawEase)
						.style("opacity",1)
				}, delay=0)
			}
		}, delay=delay)
	}
}