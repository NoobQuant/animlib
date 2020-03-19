import {AnimObject} from './AnimObject.js'
import {AddMathJax} from '../functions/AddMathJax.js'
import {PathTween} from '../functions/PathTween.js'
export class Plot extends AnimObject{

	constructor(params){
		super(params)
		this._UpdatePlotParams(params)

		// Scale types
		this.xAxisType = params.xAxisType || "scaleLinear"
		this.yAxisType = params.yAxisType || "scaleLinear"		
	}

	Draw({delay, duration, type="default"} = {}){				
		/* Draws axes 
		 - lineFunction probably could be moved under DrawLine().
		   Now it is included here as well as in _UpdateAxes().
		*/
	
		let that = this
		let yRangeInv = [this.yRange[1], this.yRange[0]]
		

		// Set x-axis call on plot type
		if (this.xAxisType == 'scaleLinear'){
			var xScale = d3.scaleLinear().range(this.xRange).domain(this.xDomain)
			
		} else if (this.xAxisType == 'scaleBand'){

			var xScale = d3.scaleBand()
							.domain(this.xDomain)
							.range(this.xRange)
							.paddingInner(0.05) // still ad hoc!	

		} else if (this.xAxisType == 'scaleTime'){			
			var xScale = d3.scaleTime().range(this.xRange).domain(this.xDomain)
		}

		// Set y-axis call on plot type
		if (this.yAxisType == 'scaleLinear'){
			var yScale = d3.scaleLinear().range(that.yRange.slice().reverse()).domain(this.yDomain)
		} else if (this.yAxisType == 'scaleBand'){
			var yScale = d3.scaleLinear()
							.domain(this.yDomain)
							.range(that.yRange.slice().reverse())
							.paddingInner(0.05) // still ad hoc!		
		} else if (this.yAxisType == 'scaleTime'){
			var yScale = d3.scaleLinear().range(that.yRange.slice().reverse()).domain(this.yDomain)
		}		

		// Axis calls
		let xAxis = d3.axisBottom().scale(xScale)
		let yAxis = d3.axisLeft().scale(yScale)

		// x-axis
		let xAxisGroup = this.group.append("g")
									.attr("transform", "translate("+ this.yRange[0] + "," + this.yRange[1] + ")")
									.call(xAxis																
											.tickSize(this.xTickSize)			  	
											.ticks(this.xTickNo)
											)

		// Format x-axis tick labels from number to string if not string to begin with 
		if (this.xTickFormat != "string"){
			xAxisGroup.call(xAxis.tickFormat(this.xTickFormat))
		}
		
		xAxisGroup		
			.selectAll("text")
			.style("font-size", this.xTickLabelSize)
			.style("fill",this.xTickLabelFill)
		xAxisGroup
			.selectAll("line")
			.style("stroke", this.xTickStroke)
			.style("stroke-width", this.xTickStrokeWidth)												
		xAxisGroup
			.selectAll("path")
			.attr("stroke" , this.axisStroke)
			.style("stroke-width", this.axisStrokeWidth)																						

		// x axis label
		this._XAxisLabel()			  

		// y-axis
		let yAxisGroup = this.group.append("g")
									.call(yAxis						
											.tickFormat(this.yTickFormat)
											.tickSize(this.yTickSize)
											.ticks(this.yTickNo)
											)
		yAxisGroup		
			.selectAll("text")
			.style("font-size", this.yTickLabelSize)
			.style("fill",this.yTickLabelFill)
		yAxisGroup
			.selectAll("line")
			.style("stroke", this.yTickStroke)
			.style("stroke-width", this.yTickStrokeWidth)												
		yAxisGroup
			.selectAll("path")
			.attr("stroke" , this.axisStroke)
			.style("stroke-width", this.axisStrokeWidth)									

		// y axis label
		this._YAxisLabel()
		
		// Show plot based on AnimObject Draw
		super.Draw({delay:delay, duration:duration, type:type})

		// Define a line function for to be used with these axes
		let lineFunction = d3.line()
							 .x(function(d) {return xScale(d[0])})
							 .y(function(d) {return yScale(d[1])})

		this.xScale    	  = xScale
		this.yScale    	  = yScale
		this.xAxis 		  = xAxis
		this.yAxis 		  = yAxis
		this.xAxisGroup   = xAxisGroup		
		this.yAxisGroup   = yAxisGroup 
		this.lineFunction = lineFunction
	}

	HideObject({delay, duration, id}={}){

		/* Hide object attached to plot group */
		d3.timeout(() => {
			d3.select("#"+id)
				.transition()
				.duration(duration)
				.style("opacity", "0")
		},delay)
	}	

	RemoveObject(id){
		d3.select("#"+id).remove();
	}

	UpdateAxes({delay, duration, plotParams = {}}={}){
		// Updates axes but leaves content unchanged
		d3.timeout(() => {			
			this._UpdatePlotParams(plotParams)
			this._UpdateAxes(0, duration)
		},delay)
	}
	


	DrawHistogram({delay, duration, plotObjParams, plotParams={}}={}){
		d3.timeout(() => {

			// Update axes
			this._UpdatePlotParams(plotParams)
			this._UpdateAxes(0,duration)

			this[plotObjParams.id] = {}	
			this._UpdateHistParams(plotObjParams)			
			
			// Local (convenience) variables
			let that 	= this		
			let HEIGHT 	= this.yRange[1] - this.yRange[0]

			// Auxiliary function
			function height(d) {
				return HEIGHT - that.yScale(d.y)
			}
			function width(d) {
				if(['normal','precalculated'].includes(that[plotObjParams.id].datatype)){
					return that.xScale(d.x1) - that.xScale(d.x0)
				} else if(that[plotObjParams.id].datatype==="bar"){
					return that.xScale.bandwidth()
				}
			}			
			// create array histogram with elements representing each bin. Each element is an object with
			//	- y   : bar value
			//	- x0  : bar start position on x-axis
			//	- x1  : bar end position on x-axis
			//	- cum : cumualtive bar y values			
			let histogram
			if (this[plotObjParams.id].datatype == 'normal'){
				histogram = d3.histogram().domain(this.xScale.domain()).thresholds(this[plotObjParams.id].histBins)(this[plotObjParams.id].data)
				
				//Calculative cdf
				// https://stackoverflow.com/questions/34972419/d3-histogram-with-cumulative-frequency-distribution-line-in-the-same-chart-graph
				let noOfObservations = this[plotObjParams.id].data.length
				let last = 0
				for(let i=0; i < histogram.length; i++){
					// Current bin y value: number of observations in the bin divided by total number of observations 
					histogram[i]['y'] = histogram[i].length/noOfObservations
					histogram[i]['cum'] = last + histogram[i]['y']
					last = histogram[i]['cum']
				}

			} else if (this[plotObjParams.id].datatype == 'precalculated' || this[plotObjParams.id].datatype == 'bar'){
				histogram = this[plotObjParams.id].data
				
				//Calculative cdf
				let last = 0
				for(let i=0; i < histogram.length; i++){
					histogram[i]['cum'] = last + histogram[i].y
					last = histogram[i]['cum'];
				}			
			}

			// Group for data binding if drawn for first time
			if (d3.select("#"+plotObjParams.id).empty()){
				this.group.append("g")
						  .attr("id", plotObjParams.id)
			}

			// Define group for bars
			let bar = this.group.select("#"+plotObjParams.id)
								.selectAll(".bar")							  
								.data(histogram)
								
			// Save histogram to this
			this[plotObjParams.id].histogram = histogram

			// EXIT section
			bar.exit().remove()

			// UPDATE section
			bar.transition()
			.duration(duration)
			.attr("transform", (d, i) => 'translate( '+ that.xScale(d.x0) +','+ that.yScale(d.y) +')')

			bar.select("rect")
				.transition()
				.duration(duration)
				.attr('fill',this[plotObjParams.id].fill)	
				.attr("height", height)
				
			// handle new elements ENTER
			let barEnter = bar
							.enter()
							.append("g")
							.attr("class", "bar")
							.attr("transform", function(d) { return "translate(" + that.xScale(d.x0) + "," + HEIGHT + ")" })
			
			barEnter.transition()
					.duration(duration)
					.attr("transform", (d, i) => `translate(${that.xScale(d.x0)}, ${that.yScale(d.y)})`)
				
			let rect = barEnter.append("rect") 
							.attr('fill',this[plotObjParams.id].fill)
							.attr("width", width)							
							.attr("height", 0)

			// handle updated elements
			// not sure why both this and bar.select("rect").transition() are needed
			rect.transition()		
				.duration(duration)
				.attr("height",height)
				
		}, delay)
	}


	DrawScatter({delay, duration, plotObjParams, plotParams = {}}={}){

		// Create object to store plot object parameters
		this[plotObjParams.id] = {}		
		this._UpdateScatterParams(plotObjParams)

		// Update axes		
		this._UpdatePlotParams(plotParams)
		this._UpdateAxes(delay, duration)		

		let that = this

		// Plot object group
		let vis = this.group.append("g")
							.attr("id", plotObjParams.id)
							.style("opacity", 0.0)

		// Draw scatter
		this.group.select("#"+plotObjParams.id).selectAll("circle")
	      			.data(this[plotObjParams.id].data)
		  			.enter()
		  			.append("circle")
		  			.attr("r", function(d) {return d.r})
		  			.style("fill", function(d) {return d.color})		  
		  			.style("stroke", this[plotObjParams.id].stroke)
		  			.style("stroke-width", this[plotObjParams.id].strokeWidth)
		  			.attr("transform", function(d) {
						return " translate(" + (that.xScale(d.x)) +","+ (that.yScale(d.y)) +")"
		  			})	  			      
		
		// Show plot object
		vis.transition()
			.delay(delay)
			.duration(duration)
			.style("opacity", 1.0)

	}

	MoveScatter({delay, duration, plotObjParams, plotParams={}, ease = d3.easeCubic} = {}){
		/*
		Would be cool to merge this with DrawScatter()! As in DrawHistogram().
		Not sure how axis label update works here but it just does...
		*/

		// Update axes		
		this._UpdatePlotParams(plotParams)
		this._UpdateAxes(delay, duration)

		// Update all scatters
		if (!Array.isArray(plotObjParams)){
			plotObjParams = [plotObjParams]
		}
		plotObjParams.forEach((el) => {

			this._UpdateScatterParams(el)
			let that = this
			this.group.select("#"+el.id).selectAll("circle")
			.data(this[el.id].data)
			.transition()
			.delay(delay)
			.duration(duration) 
			.ease(ease)
			.attr("r", function(d) {return d.r})			
			.style("fill", function(d) {return d.color})
			.style("stroke", this[el.id].stroke)
			.style("stroke-width", this[el.id].strokeWidth)			
			.attr("transform", function(d) {
				return " translate(" + (that.xScale(d.x)) +","+ (that.yScale(d.y)) +")"
			})
		})
	}

	
	DrawLine({delay, duration, plotObjParams, plotParams={}}={}){

		// Create object to store plot object parameters
		this[plotObjParams.id] = {}		
		this._UpdateLineParams(plotObjParams)

		d3.timeout(() => {
			
			// Update axes
			this._UpdatePlotParams(plotParams)
			this._UpdateAxes(delay=0,duration=duration)	

			let that = this

			// Plot object group
			let vis = this.group.append("g")
								.attr("id", plotObjParams.id)

			// Draw line
			let linepath =  vis.append("path")
								.attr("d", this.lineFunction(that[plotObjParams.id].data))
			let totalLength = linepath.node().getTotalLength()
			if (this[plotObjParams.id].dashed == false){
				linepath
					.attr("stroke-dasharray", totalLength + " " + totalLength)
					.attr("stroke-dashoffset", totalLength)
					.attr("stroke", this[plotObjParams.id].strokeColor)
					.attr('fill','none')
					.attr("stroke-width", this[plotObjParams.id].strokeWidth)
					.transition()
					.duration(duration)
					.ease(this[plotObjParams.id].drawEase)
					.attr("stroke-dashoffset", 0)

			} else if (this[plotObjParams.id].dashed == true){
				linepath.style("opacity", 0)
				linepath
					.attr("stroke-dasharray", 6)
					.attr("stroke", this[plotObjParams.id].strokeColor)
					.attr('fill','none')
					.attr("stroke-width", this[plotObjParams.id].strokeWidth)
					.transition()
					.duration(duration)
					.ease(this[plotObjParams.id].drawEase)
					.style("opacity", 1)		
			}
		}, delay)
	}
	
	MoveLine({delay, duration, plotObjParams, plotParams={}, ease = d3.easeCubic} = {}){
		d3.timeout(() => {		
			/*
			Would be cool to merge this with DrawLine()!  As in DrawHistogram().
			Not sure how axis label update works here but it just does...
			*/

			// Update axes		
			this._UpdatePlotParams(plotParams)
			this._UpdateAxes(0, duration)

			// Update all lines
			if (!Array.isArray(plotObjParams)){
				plotObjParams = [plotObjParams]
			}
			plotObjParams.forEach((el) => {

				this._UpdateLineParams(el)
				let that = this
				this.group.select("#"+el.id).selectAll("path")
					.transition()
					.delay(0)
					.duration(duration)
					.ease(ease)
					.attrTween("d", PathTween(that.lineFunction(that[el.id].data) ,4))
			  })
		}, delay)		
	}



	_YAxisLabel(opacity=1){
		this.foYLabel = this.group.append('foreignObject')
					       .attr('width',1000) // ad hoc
						   .attr('height',1000) // ad hoc
						   .attr("transform",
						   "translate(" + (this.xRange[0] - this.yLabelCorrector[0]) + " ," + (this.yRange[1] / 2 + this.yLabelCorrector[1]) + ") rotate(-90)")
						   .style('opacity',opacity)
		this.foYLabel.append('xhtml:div')			
		   		.style("color", this.yLabelColor)										
		   		.style("font-size", this.yLabelSize + "px")
		   		.append("text")
		   		.html(this.yLabel)
	}

	_XAxisLabel(opacity=1){
		this.foXLabel = this.group.append('foreignObject')
					        .attr('width',1000) // ad hoc
						    .attr('height',1000) // ad hoc
						    .attr("transform",
						   		"translate(" + (this.xRange[1]/2 + this.xLabelCorrector[0]) + " ," + (this.yRange[1] + this.xLabelCorrector[1] ) + ")")
							.style('opacity',opacity)		
		this.foXLabel.append('xhtml:div')			
		   			 .style("color", this.xLabelColor)										
		   			 .style("font-size", this.xLabelSize + "px")
		   			 .append("text")
		   			 .html(this.xLabel)	
	}	

	_UpdateAxes(delay, duration){

		// Update axis calls
		this.xScale.range(this.xRange).domain(this.xDomain)
		this.yScale.range(this.yRange.slice().reverse()).domain(this.yDomain)
		this.xAxis.scale(this.xScale)
		this.yAxis.scale(this.yScale)		

		// Update y axis
		this.yAxisGroup
				 .transition()
				 .delay(delay)
				 .duration(duration)
				 .call(this.yAxis
				 	.tickSize(this.yTickSize)				
				 	.ticks(this.yTickNo)
				  )
		this.yAxisGroup		
			.selectAll("text")
			.style("font-size", this.yTickLabelSize)
			.style("fill",this.yTickLabelFill)
		this.yAxisGroup
			.selectAll("line")
			.style("stroke", this.yTickStroke)
			.style("stroke-width", this.yTickStrokeWidth)												
		this.yAxisGroup
			.selectAll("path")
			.attr("stroke" , this.axisStroke)
			.style("stroke-width", this.axisStrokeWidth)

		// Update x axis
		this.xAxisGroup
				 .transition()
				 .delay(delay)
				 .duration(duration)
				 .call(this.xAxis	
				 	.tickSize(this.xTickSize)				
				 	.ticks(this.xTickNo)
				  )

		this.xAxisGroup		
			.selectAll("text")
			.style("font-size", this.xTickLabelSize)
			.style("fill",this.xTickLabelFill)
		this.xAxisGroup
			.selectAll("line")
			.style("stroke", this.xTickStroke)
			.style("stroke-width", this.xTickStrokeWidth)												
		this.xAxisGroup
			.selectAll("path")
			.attr("stroke" , this.axisStroke)
			.style("stroke-width", this.axisStrokeWidth)
		
		// Update yLabel
		// HACKY, MAYBE THERE IS ENTER+UPDATE+EXIT LOGIC POSSIBILITY
		this.foYLabel
				 .transition()
				 .delay(delay)
				 .duration(1000)
				 .style("opacity",0)		
		this._YAxisLabel(0)
		this.foYLabel
				.transition()
				.delay(delay)
				.duration(1000)
				.style("opacity",1)

		// Update xLabel
		// HACKY, MAYBE THERE IS ENTER+UPDATE+EXIT LOGIC POSSIBILITY
		this.foXLabel
				 .transition()
				 .delay(delay)
				 .duration(1000)
				 .style("opacity",0)		
		this._XAxisLabel(0)
		this.foXLabel
				.transition()
				.delay(delay)
				.duration(1000)
				.style("opacity",1)

		// Update line function bound to the axes
		let that = this
		this.lineFunction = d3.line()
							 .x(function(d) {return that.xScale(d[0])})
							 .y(function(d) {return that.yScale(d[1])})						
		
		// Refresh math symbols on the svg that plot AnimObject is defined on
		AddMathJax(d3.select('#'+this.svgid))
	}

	_UpdatePlotParams(params){
		/* Updates plot axis paramters */
		
		this.xRange 		    = params.xRange  		 || this.xRange
		this.yRange 		    = params.yRange  		 || this.yRange		
		this.xDomain 			= params.xDomain 		 || this.xDomain
		this.yDomain 			= params.yDomain 		 || this.yDomain
	    this.xLabelSize 		= params.xLabelSize  	 || this.xLabelSize  	  || this.xLabelSize || 30
		this.xLabel 			= params.xLabel 	 	 || this.xLabel 	 	  || ""
		this.xLabelColor 		= params.xLabelColor 	 || this.xLabelColor 	  || "#D7E4DB" 
	    this.yLabelSize 		= params.yLabelSize  	 || this.yLabelSize  	  || 30
		this.yLabel 			= params.yLabel 	 	 || this.yLabel 	 	  || ""
		this.yLabelColor 		= params.yLabelColor 	 || this.yLabelColor 	  || "#D7E4DB" 		
		this.yLabelCorrector    = params.yLabelCorrector || this.yLabelCorrector  || [100,0]
		this.xLabelCorrector    = params.xLabelCorrector || this.xLabelCorrector  || [0,70]
		this.xTickLabelSize		= params.tickLabelSize   || this.xTickLabelSize	  || params.xTickLabelSize || 20
		this.yTickLabelSize		= params.tickLabelSize   || this.yTickLabelSize	  || params.yTickLabelSize || 20
	    this.xTickNo 			= params.tickNo 		 || this.xTickNo 		  || 5		
		this.xTickStroke 		= params.tickStroke 	 || this.xTickStroke 	  || "#D7E4DB"
	    this.xTickSize 			= params.tickSize 		 || this.xTickSize 		  || 10		
		this.xTickStrokeWidth	= params.tickStrokeWidth || this.xTickStrokeWidth || 1
		this.xTickLabelFill 	= params.tickLabelFill 	 || this.xTickLabelFill   || "#D7E4DB"		
		this.xTickFormat		= params.xTickFormat 	 || this.xTickFormat 	  || d3.format('.1f')
	    this.yTickNo 			= params.tickNo 		 || this.yTickNo 		  || 5
		this.yTickStroke 		= params.tickStroke 	 || this.yTickStroke 	  || "#D7E4DB"
	    this.yTickSize 			= params.tickSize 		 || this.yTickSize 		  || 10		
		this.yTickStrokeWidth	= params.tickStrokeWidth || this.yTickStrokeWidth || 1
		this.yTickLabelFill 	= params.tickLabelFill   || this.yTickLabelFill   || "#D7E4DB"
		this.yTickFormat		= params.yTickFormat 	 || this.yTickFormat	  || d3.format('.1f')
		this.axisStroke			= params.axisStroke 	 || this.axisStroke		  || "#D7E4DB"
		this.axisStrokeWidth	= params.axisStrokeWidth || this.axisStrokeWidth  || 1		
	}

	_UpdateScatterParams(params){
		let id = params.id
		this[id].data   	   = params.data
		this[id].stroke 	   = params.stroke 		 || this[id].stroke 	   || "#D7E4DB"
		this[id].strokeWidth   = params.strokeWidth  || this[id].strokeWidth   || 1		
	}

	_UpdateHistParams(params){
		let id = params.id
		this[id].data   	  = params.data
		this[id].histBins  	  = params.histBins 	 || this[id].histBins       || 10
		this[id].fill	  	  = params.fill			 || this[id].fill 	      || "#666da3"
		this[id].datatype  	  = params.datatype		 || this[id].datatype       || "normal"				
	}
	
	_UpdateLineParams(params){
		let id = params.id
		this[id].data   	  	  = params.data
		this[id].dashed 	  	  = params.dashed  	     || this[id].dashed 	    || false
		this[id].strokeWidth   	  = params.strokeWidth   || this[id].strokeWidth    || 1
		this[id].strokeColor   	  = params.strokeColor   || this[id].strokeColor    || "steelblue"
		this[id].drawEase   	  = params.drawEase   	 || this[id].drawEase 	    || d3.easeLinear	
	}		
}