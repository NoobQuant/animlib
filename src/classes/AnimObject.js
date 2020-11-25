export class AnimObject{

	constructor(params, aoParent){

		// Fixed attributes		
		this.attrFix 		= {}
		this.attrFix.id     = params.id
		this.attrFix.aoParent = aoParent

		// Varying attributes
		this.attrVar = {}
		this._UpdateParams(params)

		// Init AnimObject
		this.ao = d3.select('#'+ this.attrFix.aoParent.attrFix.id)
			.append("g")
			.attr("id", this.attrFix.id)
			.style("opacity", 0)

		// Define inner space if it exists
		if (this.attrFix.hasInnerSpace === true){
			this._InitInnerSpace()
		}

		// Append plot base area, equal to xRange and yRange.
		// Zooming behavior will use this area as base.
		// Append same size clip area. All object on plot
		// will be clipped relative to this area.
		// https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs
		//d3.select("#"+this.attrFix.id)
		//  .append("group:clipPath")
		//  .attr("id","clip")
		//  .append("rect")
		//  .attr("class","rect")
		//  .attr("width", this.attrVar.xRange[1])
		//  .attr("height", this.attrVar.yRange[1])
		//d3.select("#"+this.attrFix.id)
		//  .append("g")
		//  .attr("id","baseAreaGroup")
		//  .append("rect")
		//  .attr("id","baseArea")
		//  .attr("class","rect")
		//  .attr("width", this.attrVar.xRange[1] )
		//  .attr("height", this.attrVar.yRange[1] )
		//  .style("fill", "none")

	}

	Draw({delay, duration, params={}}={}){
		/* Draw AnimObject*/
		d3.timeout(() => {

			// Update draw attributes
			this.attrDraw = {}
			this._UpdateDrawParams(params)

			// Draw AnimObject
			if (this.attrDraw.type === "show"){
				d3.select("#"+this.attrFix.id)
					.attr("transform",
						"translate(" + this.attrFix.aoParent.attrVar.xScale(this.attrVar.pos[0]) +
							"," + this.attrFix.aoParent.attrVar.yScale(this.attrFix.aoParent.attrVar.yScale(this.attrFix.aoParent.attrVar.pos[1]) - this.attrVar.pos[1]) + ")")
					.transition()
					.duration(duration)
					.style("opacity",this.attrVar.opacity)
			} else if (this.attrDraw.type === "movein"){
				d3.select("#"+this.attrFix.id)
					.attr("transform",
						"translate(" + this.attrFix.aoParent.attrVar.xScale(this.attrDraw.entPoint[0]) + "," +
						this.attrFix.aoParent.attrVar.yScale(this.attrFix.aoParent.attrVar.yScale(this.attrFix.aoParent.attrVar.pos[1]) - this.attrDraw.entPoint[1]) + ")")
					.transition()
					.duration(duration)
					.style("opacity",this.attrVar.opacity)	
					.attr("transform",
						"translate(" + this.attrFix.aoParent.attrVar.xScale(this.attrVar.pos[0]) + "," +
						this.attrFix.aoParent.attrVar.yScale(this.attrFix.aoParent.attrVar.yScale(this.attrFix.aoParent.attrVar.pos[1]) - this.attrVar.pos[1]) + ")")
					.ease(this.attrDraw.moveInEase)
			} else if (this.attrDraw.type === "scalein"){
				d3.select("#"+ this.attrFix.id)
					.attr("transform",
						"translate(" + this.attrFix.aoParent.attrVar.xScale(this.attrVar.pos[0]) + "," +
							this.attrFix.aoParent.attrVar.yScale(this.attrVar.pos[1]) +
								") scale("+ this.attrDraw.moveInScale +")")
					.transition()
					.duration(duration)
					.attr("transform",
						"translate(" + this.attrFix.aoParent.attrVar.xScale(this.attrVar.pos[0]) + "," +
						this.attrFix.aoParent.attrVar.yScale(this.attrFix.aoParent.attrVar.yScale(this.attrFix.aoParent.attrVar.pos[1]) - this.attrVar.pos[1]) +
							") scale("+ this.attrVar.scale +")")
					.style("opacity",this.attrVar.opacity)
					.ease(this.attrDraw.moveInEase)
			}
		},delay)
	}

	Update({delay, duration, params={}}={}){
		/*
		General AnimObject update method. Currently supports update for
			- position
			- scale
			- inner space
		*/
		d3.timeout(() => {
			let ease = params.ease || d3.easePoly

			// Update varying AnimObject parameters
			this._UpdateParams(params)

			// Update inner space if it exists
			if (this.attrFix.hasInnerSpace === true){
				this._UpdateInnerSpace(0, 0)
			}			

			// Update position and scale
			d3.select("#"+this.attrFix.id)
			.transition()
			.duration(duration)
			.attr("transform",
				"translate(" + this.attrFix.aoParent.attrVar.xScale(this.attrVar.pos[0]) + "," +
					this.attrFix.aoParent.attrVar.yScale(this.attrFix.aoParent.attrVar.yScale(this.attrFix.aoParent.attrVar.pos[1]) - this.attrVar.pos[1]) +
						") scale("+ this.attrVar.scale +")")
			.ease(ease)
		},delay)
	}

	Hide({delay, duration}={}){
		/* Hide AnimObject*/
		d3.timeout(() => {
			d3.select('#'+ this.attrFix.id)
			.transition()
			.duration(duration)
			.style("opacity",0)
		},delay)
	}

	Remove({delay}={}){
		/* Remove AnimObject from DOM*/
		d3.timeout(() => {
			d3.select('#'+ this.attrFix.id).remove()
		},delay)
	}

	Zoom({delay, duration, zoomParams = {}}={}){

		d3.timeout(() => {

			// These now rely on the assumption that scales are updated!
			let xDomain 		= zoomParams.xDomain || this.xScale.domain()
			let yDomain 		= zoomParams.yDomain || this.yScale.domain().reverse()
			let zoomEase		= zoomParams.zoomEase || d3.easeLinear

			let zoom = this.zoom

			let dataSpaceXStartOld  = this.attrVar.xScale.domain()[0]
			let dataSpaceXEndOld 	= this.attrVar.xScale.domain()[1]
			let dataSpaceYStartOld  = this.attrVar.yScale.domain()[0]
			let dataSpaceYEndOld    = this.attrVar.yScale.domain()[1]
			let dataSpaceXStartNew  = xDomain[0]
			let dataSpaceXEndNew	= xDomain[1]
			let dataSpaceYStartNew  = yDomain[0]
			let dataSpaceYEndNew    = yDomain[1]

			// Notice the pixel space values are "inverted" as per what is "new" and what is "old"
			// This means we need to "start" the zoom from value we want to be the resulting domain limit
			// Notice also inverted y-axis values (zero is in top-left corner)
			let pixelSpaceXStartNew  = this.attrVar.xScale(dataSpaceXStartOld)
			let pixelSpaceXEndNew 	 = this.attrVar.xScale(dataSpaceXEndOld)
			let pixelSpaceYEndNew    = this.attrVar.yScale(dataSpaceYStartOld)
			let pixelSpaceYStartNew  = this.attrVar.yScale(dataSpaceYEndOld)
			let pixelSpaceXStartOld  = this.attrVar.xScale(dataSpaceXStartNew)
			let pixelSpaceXEndOld 	 = this.attrVar.xScale(dataSpaceXEndNew)
			let pixelSpaceYEndOld    = this.attrVar.yScale(dataSpaceYStartNew)
			let pixelSpaceYStartOld  = this.attrVar.yScale(dataSpaceYEndNew)
			let tx = (pixelSpaceXEndOld * pixelSpaceXStartNew  -  pixelSpaceXEndNew * pixelSpaceXStartOld) / (pixelSpaceXEndOld - pixelSpaceXStartOld)
			let ty = (pixelSpaceYEndOld * pixelSpaceYStartNew  -  pixelSpaceYEndNew * pixelSpaceYStartOld) / (pixelSpaceYEndOld - pixelSpaceYStartOld)			
			let kx =  pixelSpaceXEndNew / pixelSpaceXEndOld -  tx / pixelSpaceXEndOld
			let ky =  pixelSpaceYEndNew / pixelSpaceYEndOld -  ty / pixelSpaceYEndOld
			
			let zoomTransform = d3.xyzoomIdentity
								  .translate(tx, ty)
								  .scale(kx,ky)
		
			this.ao.select("#baseArea")
			  .transition()
			  .duration(duration)
			  .ease(zoomEase)
			  .call(zoom.transform, zoomTransform)

		},delay)

	}

	_InitInnerSpace(){

		if (this.attrVar.xScaleType === "scaleLinear"){
			this.attrVar.xScale = d3.scaleLinear()
									.range(this.attrVar.xRange)
									.domain(this.attrVar.xDomain)
		} else if (this.attrVar.xScaleType == 'scaleBand'){
			this.attrVar.xScale = d3.scaleBand()
									.domain(this.attrVar.xDomain)
									.range(this.attrVar.xRange)
									.paddingInner(0.05) // still ad hoc!
		} else if (this.attrVar.xScaleType === "scaleTime"){
			this.attrVar.xScale = d3.scaleTime()
							.range(this.attrVar.xRange)
							.domain(this.attrVar.xDomain)
		} else {
			this.attrVar.xScale = undefined
		}

		if (this.attrVar.yScaleType === "scaleLinear"){
			this.attrVar.yScale = d3.scaleLinear()
									.range(this.attrVar.yRange.slice().reverse())
									.domain(this.attrVar.yDomain)
		} else if (this.attrVar.yScaleType === "scaleBand"){
			this.attrVar.yScale = d3.scaleLinear()
									domain(this.attrVar.yDomain)
 									.range(this.attrVar.yRange.slice().reverse())
									.paddingInner(0.05) // still ad hoc!
		} else if (this.attrVar.yScaleType === "scaleTime"){
			this.attrVar.yScale = d3.scaleLinear()
									.range(this.attrVar.yRange.slice().reverse())
									.domain(this.attrVar.yDomain)
		} else {
			this.attrVar.yScale = undefined
		}
	}

	_UpdateParams(params){
		this.attrVar.pos 	 = params.pos 	  || this.attrVar.pos     || [0,0]
		this.attrVar.scale	 = params.scale   || this.attrVar.scale   || 1
		this.attrVar.opacity = params.opacity || this.attrVar.opacity || 1
		this.attrVar.data    = params.data	  || this.attrVar.data	  || undefined

		// Attributes related to inner space
		this.attrVar.xRange = params.xRange || this.attrVar.xRange || undefined
		this.attrVar.yRange = params.yRange || this.attrVar.yRange || undefined

		// If both xRange and yRange exist, then considered to have inner space
		if (typeof this.attrVar.xRange !== 'undefined' && typeof this.attrVar.yRange !== 'undefined'){
			this.attrFix.hasInnerSpace = true
			this.attrVar.xDomain  	= params.xDomain 	|| this.attrVar.xDomain || this.attrVar.xRange
			this.attrVar.yDomain  	= params.yDomain 	|| this.attrVar.yDomain || this.attrVar.yRange
			this.attrVar.xScaleType = params.xScaleType || this.attrVar.xScaleType 	|| "scaleLinear"
			this.attrVar.yScaleType = params.yScaleType || this.attrVar.yScaleType 	|| "scaleLinear"
		} else {
			this.attrFix.hasInnerSpace = false
			this.attrVar.xDomain  	= undefined
			this.attrVar.yDomain  	= undefined
			this.attrVar.xScaleType = undefined
			this.attrVar.yScaleType = undefined
		}
	}

	_UpdateDrawParams(params){
		this.attrDraw.type		  = params.type 		|| this.attrVar.type 	 	|| "show"
		this.attrDraw.entPoint    = params.entPoint 	|| this.attrVar.entPoint 	|| [0,0]
		this.attrDraw.moveInScale = params.moveInScale  || this.attrVar.moveInScale || 1/5
		this.attrDraw.moveInEase  = params.moveInEase 	|| this.attrVar.moveInEase  || d3.easeBack
	}

	_UpdateInnerSpace(delay, duration, type="update"){
		// Similar to _UpdateAxes

		d3.timeout(() => {

			const t = d3.transition()
						.duration(duration)

			if (type=="update"){

				this.attrVar.xScale = this.attrVar.xScale
								.copy()
								.range(this.attrVar.xRange)
								.domain(this.attrVar.xDomain)
				this.attrVar.yScale = this.attrVar.yScale
								.copy()
								.range(this.attrVar.yRange.slice().reverse())
								//.range(this.attrVar.yRange)
								.domain(this.attrVar.yDomain)

				// Re-define base area and clip
				let mydata = [
								{"width":this.attrVar.xRange[1],
								"height":this.attrVar.yRange[1],
								"fill":"none",
								"id":"baseArea"}
							]

				// https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs
				this.ao.select("#baseAreaGroup")
					.selectAll(".rect")
					.data(mydata, function(d) { return d })
					.join(
						enter => enter.append("rect")
							.attr("class","rect")
							.attr("id", d => d.id)
							.attr("fill", d => d.fill)
						.call(enter => enter.transition(t)
							.attr("width", d => d.width)
							.attr("height", d => d.height)),
						update => update
							.attr("fill", d => d.fill)
						.call(update => update.transition(t)
							.attr("width", d => d.width)
							.attr("height", d => d.height)),
						exit => exit
						.call(exit => exit.transition(t)
							.remove()
							)				
					)
					this.ao.select("#clip")
					.selectAll(".rect")
					.data(mydata, function(d) { return d })
					.join(
						enter => enter.append("rect")
							.attr("class","rect")
						.call(enter => enter.transition(t)
							.attr("width", d => d.width)
							.attr("height", d => d.height)),
						update => update
						.call(update => update.transition(t)
							.attr("width", d => d.width)
							.attr("height", d => d.height)),
						exit => exit
						.call(exit => exit.transition(t)
							.remove()
							)				
					)				

				// If axes are updated, re-define zoom area and behavior also
				//this._DefineZoom()

			} else if(type=="zoom"){

				this.attrVar.zoomedXScale = d3.event.transform.rescaleX(this.attrVar.xScale)
				this.attrVar.zoomedYScale = d3.event.transform.rescaleY(this.attrVar.yScale)
							
				this.xAxis.scale(this.attrVar.zoomedXScale)
				this.yAxis.scale(this.attrVar.zoomedYScale)
			}
		}, delay)
	
	}

	_DefineZoom(){
		
		this.zoom = d3.xyzoom(this)
					 .extent([[this.attrVar.xScale.range()[0], this.attrVar.yScale.range()[0]], [this.attrVar.xScale.range()[1], this.attrVar.yScale.range()[1]]])
					 .scaleExtent([],[]) // scale extent [0, inf] for both
					 .on('zoom', this._ZoomUpdate.bind(this))

		// When zoom ends, update scales
		this.zoom.on("end", d => {
			this.attrVar.xScale = this.zoomedXScale
			this.attrVar.yScale = this.zoomedYScale
			this.attrVar.xDomain = this.attrVar.xScale.domain()
			this.attrVar.yDomain = this.attrVar.yScale.domain()

			// Update baseArea such that new zoomed position is zoomIdentity
			this.ao.select("#baseArea")._groups[0][0].__zoom.kx = 1
			this.ao.select("#baseArea")._groups[0][0].__zoom.ky = 1		
			this.ao.select("#baseArea")._groups[0][0].__zoom.x = 0
			this.ao.select("#baseArea")._groups[0][0].__zoom.y = 0		
		})

		d3.select("#"+this.id).select("#baseArea")
		  .call(this.zoom)
	}

	_ZoomUpdate(){
	
		this._UpdateAxes(0, 0, "zoom")

		// Update plot object - now only scatter! NEEDS GENERALIZATION!
		let that = this

		// Zoom all scatter circles
		this.ao
			.selectAll("circle")
			.attr("transform", function(d) {	
				return " translate(" + (that.zoomedXScale(d.x)) +","+ (that.zoomedYScale(d.y)) +")"				
		})

		// Zoom all lines (only in class plotLine)
		let zoomedLineFunction = d3.line()
							 .x(function(d) {return that.zoomedXScale(d[0])})
							 .y(function(d) {return that.zoomedYScale(d[1])})
		let gg = this.ao.selectAll(".plotLine")._groups[0]		
		gg.forEach((el) => {
			that.group.select("#"+el.id)
			.selectAll("path")
			.attr("d", zoomedLineFunction(that[el.id].data))
		})							 

		// Zoom all histograms

	}

}