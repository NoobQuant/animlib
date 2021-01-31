/**
 * Special class that serves as canvas for animations.
 * 
 * Canvas defines the canvas for animations. All AnimObjects are placed on it; otherwise they
 * will not be recorded. Canvas defines the so-called pixel dimension. Pixel dimesion is 1930
 * pixels wide and 1080 pixels high, and positions are considered from left to right, bottom to top.
 * The pixel dimension is to be differentiated from usual browser window space, which runs from top
 * to bottom.
 * 
 * To do:
 *  - Consider Canvas also an an AnimObject, probably can be done.
 */

export class Canvas{

	constructor(params){

        let id          = params.id || "bgsvg"
        let dim			 = params.dim || [1930, 1090]
        let color        = params.bolor || "#080019"
        let opacity      = params.opacity || 1
        let strokeColor  = params.strokeColor || "black"
        let strokeWidth  = params.strokeWidth || 0

        let width = dim[0]
        let height = dim[1]
    
        this.svg = d3.select("body")
            .append("svg")
            .attr('id', id)
            .attr("width", width)
            .attr("height", height)

        this.attrVar = {}
        this.attrFix = {}
        this.aoChildren = []

        // Rectangle for canvas for filling
        this.svg.append("rect")
            .style("fill", color)
            .style("fill-opacity", opacity)
            .attr("width", width)
            .attr("height", height)
            .style("stroke", strokeColor)
            .style("stroke-width", strokeWidth)
        
        // Init similar linear inner space as AnimObject can have
        this.attrVar.xScale = d3.scaleLinear()
            .range([0, width])
            .domain([0, width])
        this.attrVar.yScale = d3.scaleLinear()
            .range([0, height].slice().reverse())
            .domain([0, height])
        //this.attrVar.InnerSpaceXStart = 0
        //this.attrVar.InnerSpaceYStart = 0

        // Copy variable attributes to match what we have in AnimObject
        // for ease of reference
        this.attrFix.id = id
        this.attrVar.xRange = [0, width]
        this.attrVar.yRange = [0, height]
        this.attrVar.xDomain = [0, width]
        this.attrVar.yDomain = [0, height]
        this.attrVar.pos = [0, 0]

        this._DefineLineData(this.attrVar.xScale, this.attrVar.yScale)

    }

	_DefineLineData(xScale, yScale){
        // Line function for current AnimObject.
            let lineFunction = d3.line()
                .x(function(d) {return xScale(d[0])})
                .y(function(d) {return yScale(d[1])})
            this.lineFunction = lineFunction
        }	    
}
