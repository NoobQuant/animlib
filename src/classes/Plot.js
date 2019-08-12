import {AnimObject} from './AnimObject.js'
import {AddMathJax} from '../functions/AddMathJax.js'
export class Plot extends AnimObject{

	constructor(params){
		super(params)
		this._UpdatePlotParams(params)

		// Scale types
		this.xAxisType = params.xAxisType || "scaleLinear"
		this.yAxisType = params.yAxisType || "scaleLinear"		
	}

	Draw({delay, duration, type="default"} = {}){				
		/* Draws axes */
	
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
			var yScale = d3.scaleLinear().range(yRangeInv).domain(this.yDomain)
		} else if (this.yAxisType == 'scaleBand'){
			//var yScale = d3.scaleLinear().range(yRangeInv).domain(this.yDomain)
			//				.paddingInner(0.05) // still ad hoc!		
		} else if (this.yAxisType == 'scaleTime'){
			var yScale = d3.scaleLinear().range(yRangeInv).domain(this.yDomain)
		}		

		// Group needed here for update logic bound objects
		// THIS HAS BEEN MOVED TO INDIVIDUAL OBJECT DRAWS
		//this.vis = this.group.append("g")

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

		// Line function for later use
		let lineFunction = d3.line()
							 .x(function(d) {return xScale(d[0])})
							 .y(function(d) {return yScale(d[1])})

		this.xScale    	  = xScale
		this.yScale    	  = yScale
		this.yRangeInv 	  = yRangeInv
		this.xAxis 		  = xAxis
		this.yAxis 		  = yAxis
		this.xAxisGroup   = xAxisGroup		
		this.yAxisGroup   = yAxisGroup 
		this.lineFunction = lineFunction
	}

	Hide({delay, duration}={}){
		this.group
			.transition()
			.duration(duration)
			.delay(delay)
		    .style("opacity",0);		
	}

	HideObject({delay, duration, id}={}){

		/* Hide object attached to plot group */
		d3.timeout(() => {
			d3.select("#"+id)
				.transition()
				//.delay(delay)
				.duration(duration)
				.style("opacity", "0")
		},delay)
	}	

	RemoveObject(id){
		d3.select("#"+id).remove();
	}	


	DrawScatter({delay= 0, duration = 500, scatterParams ={}, plotParams = {}}={}){

		this.scatterParams = {}
		this._UpdateScatterParams(scatterParams)

		// Update axes		
		this._UpdatePlotParams(plotParams)
		this._UpdateAxes(delay, duration)		

		let that = this

		// Group for data binding
		if (this.vis === undefined){
			this.vis = this.group.append("g").attr("id", this.scatterParams.id)
		}
		this.vis.style("opacity", 0.0)

		this.vis.selectAll("circle")
	      			.data(this.scatterParams.data)
		  			.enter()
		  			.append("circle")
		  			.attr("r", function(d) {return d.r})		  
		  			.style("fill", function(d) {return d.color})		  
		  			.style("stroke", this.scatterParams.stroke)
		  			.style("stroke-width", this.scatterParams.strokeWidth)
		  			.attr("transform", function(d) {
						return " translate(" + (that.xScale(d.x)) +","+ (that.yScale(d.y)) +")"
		  			})	  			      

		this.vis.transition()
					.delay(delay)
					.duration(duration)
					.style("opacity", 1.0)

	}

	MoveScatter({delay, duration, scatterParams, plotParams={}, ease = d3.easeCubic} = {}){
		/* Not sure how axis label update works here but it just does... */

		// Update axes		
		this._UpdatePlotParams(plotParams)
		this._UpdateAxes(delay, duration)

		// Update scatter params
		this._UpdateScatterParams(scatterParams)

		// Local scope this
		let that = this

		// Update scatter
		this.vis.selectAll("circle")
			.data(this.scatterParams.data)
			.transition()
			.delay(delay)
			.duration(duration) 
			.ease(ease)
			.style("fill", function(d) {return d.color})
			.style("stroke", this.scatterParams.stroke)
			.style("stroke-width", this.scatterParams.strokeWidth)			
			.attr("transform", function(d) {
				return " translate(" + (that.xScale(d.x)) +","+ (that.yScale(d.y)) +")"
			})	
	}


	DrawHistogram({delay, duration, histParams, plotParams={}}={}){
		d3.timeout(() => {

			// Update axes
			this._UpdatePlotParams(plotParams)
			this._UpdateAxes(0,duration)

			// Update histogram parameters
			if (typeof this.histParams === 'undefined'){
				this.histParams = {}
			}
			this._UpdateHistParams(histParams)			
			
			// Local (convenience) variables
			let that 	= this		
			let HEIGHT 	= this.yRange[1] - this.yRange[0]

			// Auxiliary function
			function height(d) {
				return HEIGHT - that.yScale(d.y)
			}
			function width(d) {
				if(['normal','precalculated'].includes(that.histParams.datatype)){
					return that.xScale(d.x1) - that.xScale(d.x0)
				} else if(that.histParams.datatype==="bar"){
					return that.xScale.bandwidth()
				}
			}			
			// create array histogram with elements representing each bin. Each element is an object with
			//	- y   : bar value
			//	- x0  : bar start position on x-axis
			//	- x1  : bar end position on x-axis
			//	- cum : cumualtive bar y values			
			let histogram
			if (this.histParams.datatype == 'normal'){
				histogram = d3.histogram().domain(this.xScale.domain()).thresholds(this.histParams.histBins)(this.histParams.data)
				
				//Calculative cdf
				// https://stackoverflow.com/questions/34972419/d3-histogram-with-cumulative-frequency-distribution-line-in-the-same-chart-graph
				let noOfObservations = this.histParams.data.length
				let last = 0
				for(let i=0; i < histogram.length; i++){
					// Current bin y value: number of observations in the bin divided by total number of observations 
					histogram[i]['y'] = histogram[i].length/noOfObservations
					histogram[i]['cum'] = last + histogram[i]['y']
					last = histogram[i]['cum']
				}

			} else if (this.histParams.datatype == 'precalculated' || this.histParams.datatype == 'bar'){
				histogram = this.histParams.data
				
				//Calculative cdf
				let last = 0
				for(let i=0; i < histogram.length; i++){
					histogram[i]['cum'] = last + histogram[i].y
					last = histogram[i]['cum'];
				}			
			}

			// Group for data binding
			if (this.vis === undefined){
				this.vis = this.group.append("g").attr("id", this.histParams.id)
			}

			// Define group for bars
			let bar = this.vis.selectAll('.bar')
							  .data(histogram)

			// Save histogram to this
			this.histParams.histogram = histogram

			// EXIT section
			bar.exit().remove()

			// UPDATE section
			bar.transition()
			.duration(duration)
			.attr("transform", (d, i) => 'translate( '+ that.xScale(d.x0) +','+ that.yScale(d.y) +')')

			bar.select("rect")
				.transition()
				.duration(duration)
				.attr('fill',this.histParams.fill)	
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
							.attr('fill',this.histParams.fill)
							.attr("width", width)							
							.attr("height", 0)

			// handle updated elements
			// not sure why both this and bar.select("rect").transition() are needed
			rect.transition()		
				.duration(duration)
				.attr("height",height)
				
		}, delay)
	}


	DrawLine({delay, duration, lineParams ={}, plotParams={}}={}){
		d3.timeout(() => {
			
			// Update line parameters
			if (typeof this.lineParams === 'undefined'){
				this.lineParams = {}
			}			
			this._UpdateLineParams(lineParams)

			// Update axes
			this._UpdatePlotParams(plotParams)
			this._UpdateAxes(delay=0,duration=duration)	

			// Group for data binding
			if (this.vis === undefined){
				this.vis = this.group.append("g").attr("id", this.lineParams.id)
			}

			let linepath =  this.vis.append("path")
									.attr("d", this.lineFunction(this.lineParams.data))

			let totalLength = linepath.node().getTotalLength()
		
			if (this.lineParams.dashed == false){
				linepath
					.attr("stroke-dasharray", totalLength + " " + totalLength)
					.attr("stroke-dashoffset", totalLength)
					.attr("stroke", this.lineParams.strokeColor)
					.attr('fill','none')
					.attr("stroke-width", this.lineParams.strokeWidth)
					.transition()
					.duration(duration)
					.ease(this.lineParams.drawEase)
					.attr("stroke-dashoffset", 0)

			} else if (this.lineParams.dashed == true){
				linepath.style("opacity", 0)
				linepath
					.attr("stroke-dasharray", 6)
					.attr("stroke", this.lineParams.strokeColor)
					.attr('fill','none')
					.attr("stroke-width", this.lineParams.strokeWidth)
					.transition()
					.duration(duration)
					.ease(this.lineParams.drawEase)
					.style("opacity", 1)		
			}
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
		this.xScale.domain(this.xDomain)
		this.yScale.domain(this.yDomain)
		this.xAxis.scale(this.xScale)
		this.yAxis.scale(this.yScale)		

		// Update y axis
		this.yAxisGroup
				 .transition()
				 .delay(delay)
				 .duration(duration)
				 .call(this.yAxis
				 	.tickFormat(this.yTickFormat)
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
		// Format x-axis tick labels from number to string if not string to begin with 
		if (this.xTickFormat != "string"){
			this.xAxisGroup.call(this.xAxis.tickFormat(this.xTickFormat))
		}				  
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
		
		// Refresh math symbols on the svg that plot AnimObject is defined on
		AddMathJax(d3.select('#'+this.svgid))
	}

	_UpdatePlotParams(params){
		/* Updates plot axis paramters */
		this.xRange 		    = params.xRange  		 || this.xRange
		this.yRange 			= params.yRange  		 || this.yRange
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
		this.scatterParams.data   	   = params.data
		this.scatterParams.stroke 	   = params.stroke 		 || this.scatterParams.stroke 	   || "#D7E4DB"
		this.scatterParams.strokeWidth = params.strokeWidth  || this.scatterParams.strokeWidth || 1

		if (this.scatterParams.id === undefined){
			this.scatterParams.id = params.id
		}		
	}

	_UpdateHistParams(params){
		this.histParams.data   	  	  = params.data
		this.histParams.histBins  	  = params.histBins 	 || this.histParams.histBins       || 10
		this.histParams.fill	  	  = params.fill			 || this.histParams.fill 	       || "#666da3"
		this.histParams.datatype  	  = params.datatype		 || this.histParams.datatype       || "normal"
		
		if (this.histParams.id === undefined){
			this.histParams.id = params.id
		}					
	}
	
	_UpdateLineParams(params){
		this.lineParams.data   	  	  = params.data
		this.lineParams.dashed 	  	  = params.dashed  	     || this.lineParams.dashed 	       || false
		this.lineParams.strokeWidth   = params.strokeWidth   || this.lineParams.strokeWidth    || 1
		this.lineParams.strokeColor   = params.strokeColor   || this.lineParams.strokeColor    || "steelblue"
		this.lineParams.drawEase   	  = params.drawEase   	 || this.lineParams.drawEase 	   || d3.easeLinear		
		
		if (this.lineParams.id === undefined){
			this.lineParams.id = params.id
		}		
	}		
}