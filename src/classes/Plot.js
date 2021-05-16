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
		this.xAxis = d3.axisBottom().scale(this.attrVar.xScale)
		this.yAxis = d3.axisLeft().scale(this.attrVar.yScale)

		// init x-axis decorations
		this.xAxisGroup = this.aoG.append("g")
			.attr("transform", "translate("+ 0 + "," +
				this.aoParent.attrVar.xScale(this.attrVar.yRange[1]) + ")")
			.call(this.xAxis
				.tickSize(this.xTickSize)
				.ticks(this.xTickNo)
			)
		// Need to do this separately
		if (this.xTickFormat != "string"){
			this.xAxisGroup.call(this.xAxis.tickFormat(this.xTickFormat))
		}

		this._UpdateXAxisGroup()
		this._XAxisLabel()

		// init y-axis decorations
		this.yAxisGroup = this.aoG.append("g")
			.call(this.yAxis
				.tickSize(this.yTickSize)
				.ticks(this.yTickNo)
		)
		// Need to do this separately
		if (this.yTickFormat != "string"){
			this.yAxisGroup.call(this.yAxis.tickFormat(this.yTickFormat))
		}
		this._UpdateYAxisGroup()
		this._YAxisLabel()

		// Show plot based on AnimObject Draw
		super.Draw({delay:delay, duration:duration, params:params})

	}

	UpdateAxes({delay, duration, params = {}}={}){
		let ease = params.ease || d3.easeCubic
		// Updates axes but leaves content unchanged
		d3.timeout(() => {
			this._UpdatePlotParams(params)
			this._UpdateAxes(0, duration, ease)
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
		let labelSize
		if (label=="y"){
			selection = this.yLabelDiv
			labelText = this.yLabel
			labelSize = this.yLabelSize
		} else if(label=="x"){
			selection = this.xLabelDiv
			labelText = this.xLabel
			labelSize = this.xLabelSize
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
												  .style("font-size", labelSize + "px")
							),
				exit => exit.call(exit => exit.transition(t2)
											  .style("opacity",0)
											  .remove()
							)
			)
	}

	_UpdateAxes(delay, duration, ease=delay.easeLinear){
		/**
		 * Update scales of plot axes to match scales of current inner space,
		 * and update axis labels and ticks accordingly.
		 */

		const transition = d3.transition()
			.delay(delay)
			.duration(duration)
		
		// Update plot axes scales to match those of AO inner space
		this.xAxis.scale(this.attrVar.xScale)
		this.yAxis.scale(this.attrVar.yScale)

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
		// Need to do this separately
		if (this.yTickFormat != "string"){
			this.yAxisGroup
				.transition()
				.delay(delay)
				.duration(duration)
				.call(this.yAxis.tickFormat(this.yTickFormat))
		}
		this._UpdateYAxisGroup()

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
		// Need to do this separately
		if (this.xTickFormat != "string"){
			this.xAxisGroup
				.transition()
				.delay(delay)
				.duration(duration)
				.call(this.xAxis.tickFormat(this.xTickFormat))
		}
		this._UpdateXAxisGroup()

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

	_UpdateXAxisGroup(){
		/**
		 * Updates X axis decorations.
		*/
		//this.xAxisGroup.call(this.xAxis.tickFormat(this.xTickFormat))
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
	}

	_UpdateYAxisGroup(){
		/**
		 * Updates Y axis decorations.
		*/
		//this.yAxisGroup.call(this.yAxis.tickFormat(this.yTickFormat))
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
			.attr("stroke", this.axisStroke)
			.style("stroke-width", this.axisStrokeWidth)
	}

	_UpdatePlotParams(params){
		/* Updates plot axis paramters */

		// Numbers that can evaluate to zero need to be dealt with carefully to
		// avoid zero being treated "falsey"
		this.xLabelSize 	  	= Number(params.xLabelSize===0 && '0' 		|| params.xLabelSize		|| this.xLabelSize===0 && '0' 		|| this.xLabelSize 			|| 30)
		this.yLabelSize 	  	= Number(params.yLabelSize===0 && '0' 		|| params.yLabelSize		|| this.yLabelSize===0 && '0' 		|| this.yLabelSize 			|| 30)
		this.xTickLabelSize   	= Number(params.xTickLabelSize===0 && '0' 	|| params.xTickLabelSize 	|| this.xTickLabelSize===0 && '0' 	|| this.xTickLabelSize  	|| 20)
		this.yTickLabelSize   	= Number(params.yTickLabelSize===0 && '0' 	|| params.yTickLabelSize 	|| this.yTickLabelSize===0 && '0' 	|| this.yTickLabelSize  	|| 20)
		this.xTickNo 		  	= Number(params.xTickNo===0 && '0' 			|| params.xTickNo			|| this.xTickNo===0 && '0' 			|| this.xTickNo 			|| 5)
		this.yTickNo 		  	= Number(params.yTickNo===0 && '0' 			|| params.yTickNo 			|| this.yTickNo===0 && '0' 			|| this.yTickNo 			|| 5)
		this.xTickSize 		  	= Number(params.xTickSize===0 && '0' 		|| params.xTickSize 		|| this.xTickSize===0 && '0' 		|| this.xTickSize 			|| 10)
		this.yTickSize 		  	= Number(params.yTickSize===0 && '0' 		|| params.yTickSize 		|| this.yTickSize===0 && '0' 		|| this.yTickSize 			|| 10)
		this.xTickStrokeWidth 	= Number(params.xTickStrokeWidth===0 && '0' || params.xTickStrokeWidth 	|| this.xTickStrokeWidth===0 && '0' || this.xTickStrokeWidth 	|| 1)
		this.yTickStrokeWidth 	= Number(params.yTickStrokeWidth===0 && '0' || params.yTickStrokeWidth 	|| this.yTickStrokeWidth===0 && '0' || this.yTickStrokeWidth 	|| 1)
		this.axisStrokeWidth 	= Number(params.axisStrokeWidth===0 && '0' 	|| params.axisStrokeWidth 	|| this.axisStrokeWidth===0 && '0' 	|| this.axisStrokeWidth 	|| 1)

		// Rest
		this.xLabel 			= params.xLabel 	 	   || this.xLabel 	 	   	|| ""
		this.xLabelColor 		= params.xLabelColor 	   || this.xLabelColor 	   	|| "#D7E4DB"
		this.yLabel 			= params.yLabel 	 	   || this.yLabel 	 	   	|| ""
		this.yLabelColor 		= params.yLabelColor 	   || this.yLabelColor 	   	|| "#D7E4DB"
		this.yLabelCorrector    = params.yLabelCorrector   || this.yLabelCorrector 	|| [100, 0]
		this.xLabelCorrector    = params.xLabelCorrector   || this.xLabelCorrector 	|| [0, 70]
		this.xTickStroke 		= params.xTickStroke 	   || this.xTickStroke 	   	|| "#D7E4DB"
		this.yTickStroke 		= params.yTickStroke 	   || this.yTickStroke 	   	|| "#D7E4DB"
		this.xTickLabelFill 	= params.xTickLabelFill    || this.xTickLabelFill  	|| "#D7E4DB"
		this.xTickFormat		= params.xTickFormat 	   || this.xTickFormat 	   	|| d3.format('.1f')
		this.yTickLabelFill 	= params.yTickLabelFill    || this.yTickLabelFill  	|| "#D7E4DB"
		this.yTickFormat		= params.yTickFormat 	   || this.yTickFormat	   	|| d3.format('.1f')
		this.axisStroke			= params.axisStroke 	   || this.axisStroke	   	|| "#D7E4DB"

	}

}