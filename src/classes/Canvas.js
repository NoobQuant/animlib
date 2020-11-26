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
