import {AnimObject} from './AnimObject.js'
export class TextObject extends AnimObject{

	constructor(params, aoParent){
		super(params, aoParent)
        this.textAreaWidth   = params.textAreaWidth || 200
        this.textAreaHeight  = params.textAreaHeight || 100
        this.text            = params.text || "empty"
        this.fontFamily      = params.fontFamily || "Calibri"
        this.fontSize        = params.fontSize || 20
        this.textColor       = params.textColor || "white"
		this.textAlign       = params.textAlign || "left"

		// Foreign object to hold html text
		let fo = this.aoG.append('foreignObject')
			.attr('width',this.textAreaWidth)
			.attr('height',this.textAreaHeight)
			.style("position", "relative")

		fo.append('xhtml:div')
		   .attr('id',this.attrFix.id + "_xhtml")
		   .style("position", "absolute")
		   .style("top", 0)
		   .style("left", 0)
		   .style("bottom", 0)
		   .style("right", 0)		   
		   .style("font-family",this.fontFamily)
		   .style("color", this.textColor)
		   .attr("align", this.textAlign)
		   .style("font-size", this.fontSize + "px")
		   .append("text")
		   .html(this.text)

		// Save foreign object
		this.fo = fo;
	}

	UpdateText({delay, duration, params={}}={}){

		d3.timeout(() => {

			// Update text "text1" -> "text2"
			// Params is of same type as in initialization.
			
			// This prolly should extend Update! Or dunno of this is possible...

			// Write parameter update still!
			// if params = {}, then take those from before. Text should be included
			// in the params passed in here, other not.
			//let type = params.type || "crossfade"

			this.text = params.text || this.text
			let extraDelayShare = params.extraDelayShare ||  0.2

			// Change ID of text to be hidden
			d3.select("#"+this.attrFix.id + "_xhtml")
			  .attr("id",this.attrFix.id + "_xhtml" + "_old")	
			
			// New xhtml text to fo with same ID as the old
			this.fo.append('xhtml:div')
			.attr('id',this.attrFix.id + "_xhtml")
			.style("position", "absolute")
			.style("top", 0)
			.style("left", 0)
			.style("bottom", 0)
			.style("right", 0)
			.style("font-family",this.fontFamily)
			.style("opacity",0.0)		   				
			.style("color", this.textColor)
			.attr("align", this.textAlign)											
			.style("font-size", this.fontSize + "px")
			.append("text")
			.html(this.text)

			// Fade out old and fade in new
			d3.select("#"+this.attrFix.id + "_xhtml" + "_old")
			.transition()
			.delay(0)
			.duration(duration)
			.style("opacity",0)
			.remove()
			d3.select("#"+this.attrFix.id + "_xhtml")
			.transition()
			.delay(extraDelayShare*duration)
			.duration(duration)
			.style("opacity",1)

			// Make sure latex works
			window.AddMathJax(d3.select('#'+this.parentId))			
			
		},delay)

	}



}