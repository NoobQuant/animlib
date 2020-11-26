import {AnimObject} from './AnimObject.js'
import {AddMathJax} from '../functions/AddMathJax.js'
import {PathTween} from '../functions/PathTween.js'
export class Plot extends AnimObject{

	constructor(params, aoParent){
		super(params, aoParent)
		this._UpdatePlotParams(params)
	}

	Draw({delay, duration, params={}} = {}){
		/* Draws axes 
		 - this._DefineLineData() probably could be moved under DrawLine().
		   Now it is included here as well as in _UpdateAxes().
		*/

		// init axes for plot
		let xAxis = d3.axisBottom().scale(this.attrVar.xScale)
		let yAxis = d3.axisLeft().scale(this.attrVar.yScale)

		// init x-axis decorations
		let xAxisGroup = this.ao.append("g")
			.attr("transform", "translate("+ 0 + "," +
				this.aoParent.attrVar.xScale(this.attrVar.yRange[1]) + ")")
			.call(xAxis
				.tickSize(this.xTickSize)
				.ticks(this.xTickNo)
			) 
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
		this._XAxisLabel()

		// init y-axis decorations
		let yAxisGroup = this.ao.append("g")
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
			.attr("stroke", this.axisStroke)
			.style("stroke-width", this.axisStrokeWidth)
		this._YAxisLabel()
		
		this.xAxis 		  = xAxis
		this.yAxis 		  = yAxis
		this.xAxisGroup   = xAxisGroup
		this.yAxisGroup   = yAxisGroup

		// Show plot based on AnimObject Draw
		super.Draw({delay:delay, duration:duration, params:params})

		// Define a line function for to be used with these axes
		// To be removed and use one defined on AnimObject
		//this._DefineLineData(this.xScale, this.yScale)		
		
	}

	HideObject({delay, duration, id}={}){
		/* Hide object attached to plot group*/
		d3.timeout(() => {
			d3.select("#"+id)
				.transition()
				.duration(duration)
				.style("opacity", "0")
		},delay)
	}	

	RemoveObject({delay, id}={}){
		/* Remove object attached to plot group*/
		d3.timeout(() => {
			d3.select("#"+id).remove()
		},delay)
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

			// Update AnimObject 
			this.Update({delay:0, duration:duration, params:plotParams})

			// Update plot parameters
			this._UpdatePlotParams(plotParams)

		}, delay=delay)

		// For some reason cannot get this to work without separating updating
		// and drwaing into two separate timeouts with this latter being delayed
		// by an amount epsilonm here 5
		d3.timeout(() => {

			// Update axes based on updated AnimObject
			this._UpdateAxes(0, duration)
			
			// From here on out updating bars

			this[plotObjParams.id] = {}	
			this._UpdateHistParams(plotObjParams)
			
			// Local (convenience) variables
			let that 	= this
			let HEIGHT 	= this.attrVar.yRange[1] - this.attrVar.yRange[0]

			// Auxiliary function
			function height(d) {
				return HEIGHT - that.attrVar.yScale(d.y)
			}
			function width(d) {
				if(['normal','precalculated'].includes(that[plotObjParams.id].datatype)){
					return that.attrVar.xScale(d.x1) - that.attrVar.xScale(d.x0)
				} else if(that[plotObjParams.id].datatype==="bar"){
					return that.attrVar.xScale.bandwidth()
				}
			}			
			// create array histogram with elements representing each bin. Each element is an object with
			//	- y   : bar value
			//	- x0  : bar start position on x-axis
			//	- x1  : bar end position on x-axis
			//	- cum : cumualtive bar y values			
			let histogram
			if (this[plotObjParams.id].datatype == 'normal'){
				histogram = d3.histogram().domain(this.attrVar.xScale.domain()).thresholds(this[plotObjParams.id].histBins)(this[plotObjParams.id].data)
				
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
				this.ao.append("g")
						  .attr("id", plotObjParams.id)
			}

			// Define group for bars
			let bar = this.ao.select("#"+plotObjParams.id)
								// needed for zoom clipping; ID changes when plot object is its own AnimObject
								.attr("clip-path", "url(#" + this.attrFix.id + "_clip" + ")")
								.selectAll(".bar")
								.data(histogram)
								
			// Save histogram to this
			this[plotObjParams.id].histogram = histogram

			// EXIT section
			bar.exit().remove()

			// UPDATE section
			bar.transition()
				.duration(duration)
				.attr("transform", (d, i) => 'translate( '+ that.attrVar.xScale(d.x0) +','+ that.attrVar.yScale(d.y) +')')

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
							.attr("transform", function(d) { return "translate(" + that.attrVar.xScale(d.x0) + "," + HEIGHT + ")" })
			
			barEnter.transition()
					.duration(duration)
					.attr("transform", (d, i) => `translate(${that.attrVar.xScale(d.x0)}, ${that.attrVar.yScale(d.y)})`)
				
			let rect = barEnter.append("rect") 
							.attr('fill',this[plotObjParams.id].fill)
							.attr("width", width)							
							.attr("height", 0)

			// handle updated elements
			// not sure why both this and bar.select("rect").transition() are needed
			rect.transition()
				.duration(duration)
				.attr("height",height)
		}, delay+25)
	}


	DrawScatter({delay, duration, plotObjParams, plotParams = {}}={}){

		d3.timeout(() => {

			// Update AnimObject 
			this.Update({delay:0, duration:duration, params:plotParams})

			// Update plot parameters
			this._UpdatePlotParams(plotParams)

		}, delay)

		d3.timeout(() => {

			// Update axes based on updated AnimObject
			this._UpdateAxes(0, duration)

			// Create object to store plot object parameters
			this[plotObjParams.id] = {}
			this._UpdateScatterParams(plotObjParams)

			let that = this

			// Plot object group
			let vis = this.ao.append("g")
								.attr("id", plotObjParams.id)
								// needed for zoom clipping; ID changes when plot object is its own AnimObject
								.attr("clip-path", "url(#" + this.attrFix.id + "_clip" + ")")
								.style("opacity", 0)

			// Draw scatter
			this.ao.select("#"+plotObjParams.id).selectAll("circle")
				.data(this[plotObjParams.id].data)
				.enter()
				.append("circle")
				.attr("r", function(d) {return d.r})
				.style("fill", function(d) {return d.color})
				.style("stroke", this[plotObjParams.id].stroke)
				.style("stroke-width", this[plotObjParams.id].strokeWidth)
				.attr("transform", function(d) {
					return " translate(" + (that.attrVar.xScale(d.x)) +","+ (that.attrVar.yScale(d.y)) +")"
				})
			
			// Show plot object
			vis.transition()
				.duration(duration)
				.style("opacity", 1)
		}, delay+25)
	}

	MoveScatter({delay, duration, plotObjParams, plotParams={}, ease = d3.easeCubic} = {}){
		/*
		Would be cool to merge this with DrawScatter()! As in DrawHistogram().
		Not sure how axis label update works here but it just does...
		*/

		d3.timeout(() => {

			// Update AnimObject
			this.Update({delay:0, duration:duration, params:plotParams})

			// Update plot parameters
			this._UpdatePlotParams(plotParams)

		}, delay)

		d3.timeout(() => {

			// Update axes based on updated AnimObject
			this._UpdateAxes(0, duration)

			// Update all scatters
			if (!Array.isArray(plotObjParams)){
				plotObjParams = [plotObjParams]
			}
			plotObjParams.forEach((el) => {

				this._UpdateScatterParams(el)
				let that = this
				this.ao.select("#"+el.id).selectAll("circle")
				.data(this[el.id].data)
				.transition()
				.delay(0)
				.duration(duration) 
				.ease(ease)
				.attr("r", function(d) {return d.r})
				.style("fill", function(d) {return d.color})
				.style("stroke", this[el.id].stroke)
				.style("stroke-width", this[el.id].strokeWidth)
				.attr("transform", function(d) {
					return " translate(" + (that.attrVar.xScale(d.x)) + "," +
						(that.attrVar.yScale(d.y)) +")"
				})
			})
		}, delay+25)
	}

	
	DrawLine({delay, duration, plotObjParams, plotParams={}}={}){

		d3.timeout(() => {

			// Update AnimObject
			this.Update({delay:0, duration:duration, params:plotParams})

			// Update plot parameters
			this._UpdatePlotParams(plotParams)

		}, delay)

		d3.timeout(() => {
			
			// Update axes
			this._UpdateAxes(0, duration)

			// Create object to store plot object parameters
			this[plotObjParams.id] = {}
			this._UpdateLineParams(plotObjParams)

			let that = this

			// Plot object group
			let vis = this.ao.append("g")
								.attr("id", plotObjParams.id)
								.attr("class","plotLine")
								// needed for zoom clipping; ID changes when plot object is its own AnimObject
								.attr("clip-path", "url(#" + this.attrFix.id + "_clip" + ")")

			// Draw line
			let linepath =  vis.append("path")
								.attr("d", this.lineFunction(that[plotObjParams.id].data))
			let totalLength = linepath.node().getTotalLength()
			if (this[plotObjParams.id].drawType == "drawpath"){
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
					// Set stroke-dasharray to 0 after line has been drawn,
					// otherwise bad behavior when moved/zoomed
					.on('end', function () {
						linepath.attr("stroke-dasharray", 0)
					})

			} else if (this[plotObjParams.id].drawType == "appear"){
				linepath.style("opacity", 0)
				linepath
					//.attr("stroke-dasharray", 6)
					.attr("stroke", this[plotObjParams.id].strokeColor)
					.attr('fill','none')
					.attr("stroke-width", this[plotObjParams.id].strokeWidth)
					.transition()
					.duration(duration)
					.ease(this[plotObjParams.id].drawEase)
					.style("opacity", 1)		
			}
		}, delay+25)
	}
	
	MoveLine({delay, duration, plotObjParams, plotParams={}, ease = d3.easeCubic} = {}){
		
		d3.timeout(() => {

			// Update AnimObject
			this.Update({delay:0, duration:duration, params:plotParams})

			// Update plot parameters
			this._UpdatePlotParams(plotParams)

		}, delay=delay)
		
		d3.timeout(() => {

			// Update axes based on updated AnimObject
			this._UpdateAxes(0, duration)
			/*
			Would be cool to merge this with DrawLine()!  As in DrawHistogram().
			Not sure how axis label update works here but it just does...
			*/

			// Update axes		
			//this._UpdatePlotParams(plotParams)
			//this._UpdateAxes(0, duration)

			// Update all lines
			if (!Array.isArray(plotObjParams)){
				plotObjParams = [plotObjParams]
			}
			plotObjParams.forEach((el) => {

				this._UpdateLineParams(el)
				let that = this
				this.ao.select("#"+el.id).selectAll("path")
					.transition()
					.duration(duration)
					.ease(ease)
					.attrTween("d", PathTween(that.lineFunction(that[el.id].data) ,4))
			  })
		}, delay+25)
	}

	_YAxisLabel(){
		this.yLabelFo = this.ao.append('foreignObject')
					        .attr('width',1000) // ad hoc
						    .attr('height',100) // ad hoc
						    .attr("transform",
						    "translate(" + (this.attrVar.xRange[0] - this.yLabelCorrector[0]) + " ," + (this.attrVar.yRange[1] / 2 + this.yLabelCorrector[1]) + ") rotate(-90)")
						    .style('opacity',1)

		this.yLabelDiv = this.yLabelFo.append('xhtml:div')
		   							  .style("color", this.yLabelColor)										
									  .style("font-size", this.yLabelSize + "px")
		
		// Update call with immediate transition
		this._AxisLabelUpdate("y",d3.transition().duration(0))
	}

	_XAxisLabel(){
		this.xLabelFo = this.ao.append('foreignObject')
					        .attr('width',1000) // ad hoc
						    .attr('height',100) // ad hoc
						    .attr("transform",
						   		"translate(" + (this.attrVar.xRange[1]/2 + this.xLabelCorrector[0]) + " ," + (this.attrVar.yRange[1] + this.xLabelCorrector[1] ) + ")")
							.style('opacity',1)

		this.xLabelDiv = this.xLabelFo.append('xhtml:div')			
		   			 .style("color", this.xLabelColor)										
		   			 .style("font-size", this.xLabelSize + "px")
						
		// Update call with immediate transition
		this._AxisLabelUpdate("x",d3.transition().duration(0))						
	}	

	_AxisLabelUpdate(label, t){

		// Letting exit selection exit first beofre entering new. Otherwise entering text
		// will aling after exiting text in the div
		const halfDuration = t.duration()/2
		const t2 = d3.transition().delay(t.delay()).duration(halfDuration)
		const t3 = d3.transition().delay(t.delay()+halfDuration).duration(halfDuration)
		
		let selection
		let labelText
		if (label=="y"){
			selection = this.yLabelDiv
			labelText = this.yLabel
		} else if(label=="x"){
			selection = this.xLabelDiv
			labelText = this.xLabel			
		}

		selection.selectAll("text")
			.data([labelText], d => d)
			.join(
				enter => enter.append("text")
							  .style("opacity",0)
							  .text(d => d)
								.call(enter => enter.transition(t3)
												.style("opacity",1)
							),
				update => update
							.call(update => update.transition(t3)
												  .style("opacity",1)
							),
				exit => exit.call(exit => exit.transition(t2)
											  .style("opacity",0)
											  .remove()
							)
			)
	}		

	_UpdateAxes(delay, duration, type="update"){
		//let yAxis = this.yAxis

		if (type=="update"){
			
			this.xAxis.scale(this.attrVar.xScale)
			this.yAxis.scale(this.attrVar.yScale)

		} else if(type=="zoom"){
						
			this.xAxis.scale(this.attrVar.zoomedXScale)
			this.yAxis.scale(this.attrVar.zoomedYScale)
		}

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
		
		const transition = d3.transition()
								.delay(delay)
								.duration(duration)

		// Update yLabel
		this._AxisLabelUpdate("y", transition)

		// Update xLabel
		this._AxisLabelUpdate("x", transition)
		
		// Update line function bound to the axes
		// This is problematic if axis scales change and this change
		// is not reflected in xScale and yScale! Should be taken care of now..?
		this._DefineLineData(this.attrVar.xScale, this.attrVar.yScale)
		
		// Refresh math symbols on the svg that plot AnimObject is defined on
		AddMathJax(d3.select('#'+this.parentId))
	}

	_UpdatePlotParams(params){
		/* Updates plot axis paramters */
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
		this[id].drawType 	  	  = params.drawType  	 || this[id].drawType 	    || "drawpath"
		this[id].strokeWidth   	  = params.strokeWidth   || this[id].strokeWidth    || 1
		this[id].strokeColor   	  = params.strokeColor   || this[id].strokeColor    || "steelblue"
		this[id].drawEase   	  = params.drawEase   	 || this[id].drawEase 	    || d3.easeLinear	
	}
	
}