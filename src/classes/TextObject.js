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
	};
}