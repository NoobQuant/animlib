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
		let xAxisGroup = this.aoG.append("g")
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
		let yAxisGroup = this.aoG.append("g")
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

	UpdateAxes({delay, duration, params = {}, type="update"}={}){
		let ease = params.ease || d3.easeCubic
		// Updates axes but leaves content unchanged
		d3.timeout(() => {
			this._UpdatePlotParams(params)
			this._UpdateAxes(0, duration, type, ease)
		},delay)
	}
	
	_YAxisLabel(){
		this.yLabelFo = this.aoG.append('foreignObject')
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
		this.xLabelFo = this.aoG.append('foreignObject')
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

	_UpdateAxes(delay, duration, type="update", ease=delay.easeLinear){
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
			.ease(ease)
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
			.ease(ease)
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

}