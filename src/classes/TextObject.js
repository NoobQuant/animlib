import {AnimObject} from './AnimObject.js'
export class TextObject extends AnimObject{

	constructor(params){
		super(params)
        this.textAreaWidth   = params.textAreaWidth || 200
        this.textAreaHeight  = params.textAreaHeight || 100
        this.text            = params.text || "empty"
        this.fontFamily      = params.fontFamily || "Calibri"
        this.fontSize        = params.fontSize || 20
        this.textColor       = params.textColor || "white"        
		this.textAlign       = params.textAlign || "left"

		// Foreign object to hold html text
		let fo = this.group.append('foreignObject')
					       .attr('width',this.textAreaWidth)
					       .attr('height',this.textAreaHeight)			

		fo.append('xhtml:div')
		   .attr('id',this.id + "_xhtml")
		   .style("font-family",this.fontFamily)				
		   .style("color", this.textColor)
		   .attr("align", this.textAlign)											
		   .style("font-size", this.fontSize + "px")
		   .append("text")
		   .html(this.text)
	}

	UpdateText({delay, duration, params}={}){
		// Update text "text1" -> "text2"

		/*
		To make swap and cross-fade to work, need to hide fade out
		old xhtml:div and replace it w/ new, while somehow keeping old
		ID. Not sure if this works with other kinds of transitions.
		*/
		let type = params.type || "swap"
	
		d3.select("#"+this.id + "_xhtml")
			.transition()
			.delay(delay)
			.duration(duration)
			.text("$y = \\alpha + \\beta \\mathbf{X}$")	
	}



}