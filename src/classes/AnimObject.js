/**
 * AnimObject is a general class for animatable objects. In browser document AnimObject is represented
 * as a <g> element that stores SVG elements belonging to AnimObject.
 * 
 * AnimObjects are most typically positioned on pixel dimension of Canvas, in which case Canvas is the parent
 * of AnimObject. However, each AnimObject can also be placed on other AnimObjects with inner spaces, or domain
 * dimensions (which can be same as pixel space, but need not to). In this case the first AnimObject is a child
 * of the latter. If parent AnimObject does not have inner space (domain space), then it is just  an abstract
 * <g> element grouping AnimObjects.
 * 
 * To do:
 *  - With aoParent, is it indeed a pointer or a copy of the object? If a copy, then changes to the object
 *    are not visible in stored aoParent version of the object.
 */

export class AnimObject{
	/**
	 * @param {Object} params Parameters for AnimObject.
	 * @param {Object} aoParent See property aoParent.
	 */
	constructor(params, aoParent){
		
		/**
		 * @property {Object} aoParent Object of AnimObject or Canvas, which is considered
 		 * 	as parent of current AnimObject.
		 */
		this.aoParent = aoParent
		
		/**
		 * @property {array} aoChildren Children AnimObjects of current AnimObject.
		 */
		this.aoChildren = []

		/**
		 * Fixed attributes of AnimObject
		 * @param {Object} attrFix Fixed attributes.
		 * @property {string} attrFix.id ID of <g> element corresponding to this.aoG.
		 * @property {boolean} attrFix.hasInnerSpace Whether AnimObject is assumed to have notion of inner space.
		 */
		// Fixed attributes
		this.attrFix 	= {}
		this.attrFix.id = params.id
		
		/**
		 * Varying attributes of AnimObject
		 * @param {Object} attrVar Variying attributes
		 * @property {array} attrVar.pos [x, y] position relative to parent which is assumed to have inner space.
		 * @property {float} attrVar.opacity Opacity of this.aoG <g> element.
		 * @property {float} attrVar.scale Scale (i.e. size) of this.aoG <g> element.
		 * @property {Object} attrVar.data Object storing data for AnimObject.
		 * @property {array} attrVar.xRange Horizontal dimension range of inner space.
		 * @property {array} attrVar.yRange Vertical dimension range of inner space.
		 * @property {array} attrVar.xDomain Horizontal domain range of inner space.
		 * @property {array} attrVar.yDomain Vertical domain range of inner space.
		 * @property {Object} attrVar.xScaleType Type of inner space horizontal domain. 
		 * @property {Object} attrVar.yScaleType Type of inner space vertical domain.
		 */
		this.attrVar = {}
		this._UpdateParams(params)

		// Make sure container for draw attributes always exists
		/**
		 * Varying attributes of AnimObject
		 * @param {Object} attrDraw Draw attributes
		 * @property {string} attrDraw.drawType How object is drawn.
		 * @property {d3Ease} attrDraw.drawEase Ease for draw.
		 * @property {array} attrDraw.entPoint Entry position.
		 * @property {float} attrDraw.moveInScale Starting scale for drawType "scalein".
		 * @property {d3Ease} attrDraw.moveInEase Ease for entry.
		*/
		this.attrDraw = {}
		
		/**
		 * @property {Object} aoG Pointer to <g> of AnimObject svg elements.
		 */
		this.aoG = d3.select('#'+ this.aoParent.attrFix.id)
			.append("g")
			.attr("id", this.attrFix.id)
			.style("opacity", 0)

		// Append current AnimObject as property of parent AnimObject.
		this.aoParent.aoChildren.push(this)
		
		// Define inner space for AnimObject should it have one
		if (this.attrFix.hasInnerSpace === true){
			
			this._InitInnerSpace()

			// Append zoom base and clipping areas to current AnimObject. Dimensions are equal to
			// xRange and yRange and position is same as for AnimObject group. Zooming behavior
			// will use this area as base and objects appended on current AnimObject on plot will
			// be clipped relative to this area.
			// https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs
			d3.select("#"+this.attrFix.id)
				.append("group:clipPath")
				.attr("id", this.attrFix.id + "_clip")
				.append("rect")
				.attr("class","rect")
				.attr("width", this.aoParent.attrVar.xScale(this.attrVar.xRange[1]))
				.attr("height", this.aoParent.attrVar.yScale(this.aoParent.attrVar.yScale(this.aoParent.attrVar.pos[1]) - this.attrVar.yRange[1]))
			d3.select("#"+this.attrFix.id)
				.append("g")
				.attr("id", this.attrFix.id + "_baseAreaGroup")
				.append("rect")
				.attr("id", this.attrFix.id + "_baseArea")
				.attr("class","rect")
				.attr("width", this.aoParent.attrVar.xScale(this.attrVar.xRange[1]))
				.attr("height", this.aoParent.attrVar.yScale(this.aoParent.attrVar.yScale(this.aoParent.attrVar.pos[1]) - this.attrVar.yRange[1]))
				.style("fill", "none")

			// If inners pace exists, define zoom also
			this._DefineZoom()
		}
	}
	/**
	 * 
	 * @property {Function} Draw Draw AnimObject
	 */
	Draw({delay, duration, params={}}={}){

		d3.timeout(() => {

			// Update draw attributes
			this._UpdateDrawParams(params)

			// Set positions
			let xEntPos
			let yEntPos
			if (this.attrDraw.drawType === "movein"){
				xEntPos = this.attrDraw.entPoint[0]
				yEntPos = this.attrDraw.entPoint[1]
			}
			let xPos 
			let yPos
			if (this.attrVar.pos === undefined){
				xPos = undefined
				yPos = undefined
			} else {
				xPos = this.attrVar.pos[0]
				yPos = this.attrVar.pos[1]
			}
 
			// Draw AnimObject
			if (this.attrVar.pos === undefined){
				// Check if we should skip translation positioning and just display the object. This is for
				// objects that have their position already determined via data preparation.
				d3.select("#"+this.attrFix.id)
				.transition()
				.duration(duration)
				.style("opacity",this.attrVar.opacity)

			} else if (this.attrDraw.drawType === "show"){
				d3.select("#"+this.attrFix.id)
					.attr("transform",
							`translate(${this.aoParent.attrVar.xScale(xPos)}, 
								${this.aoParent.attrVar.yScale(yPos)})`
					)
					.transition()
					.duration(duration)
					.style("opacity",this.attrVar.opacity)

			} else if (this.attrDraw.drawType === "movein"){
				d3.select("#"+this.attrFix.id)
					.attr("transform",
						`translate(${this.aoParent.attrVar.xScale(xEntPos)}, 
							${this.aoParent.attrVar.yScale(yEntPos)})`
					)
					.transition()
					.duration(duration)
					.style("opacity",this.attrVar.opacity)
					.attr("transform",
						`translate(${this.aoParent.attrVar.xScale(xPos)}, 
							${this.aoParent.attrVar.yScale(yPos)})`
					)
					.ease(this.attrDraw.moveInEase)

			} else if (this.attrDraw.drawType === "scalein"){
				d3.select("#"+ this.attrFix.id)
					.attr("transform",
						`translate(${this.aoParent.attrVar.xScale(xPos)}, 
							${this.aoParent.attrVar.yScale(yPos)}) 
							scale (${this.attrDraw.moveInScale})`
					)
					.transition()
					.duration(duration)

					.attr("transform",
						`translate(${this.aoParent.attrVar.xScale(xPos)}, 
							${this.aoParent.attrVar.yScale(yPos)}) 
							scale (${this.attrVar.scale})`
					)
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
			let ease = params.ease || d3.easeLinear

			// Update varying AnimObject parameters
			this._UpdateParams(params)
			this._UpdateDrawParams(params)

			// Update inner space if it exists
			if (this.attrFix.hasInnerSpace === true){
				this._UpdateInnerSpace(duration, "update")
			}

			if (this.attrVar.pos === undefined){
				// If there is no position for AnimObject group, update other stuff but not position
				d3.select("#"+this.attrFix.id)
				.transition()
				.duration(duration)
				.attr("transform", `scale(${this.attrVar.scale})`)
				.ease(ease)
			} else {
				// Update position and scale
				d3.select("#"+this.attrFix.id)
				.transition()
				.duration(duration)
				.attr("transform",
					`translate(${this.aoParent.attrVar.xScale(this.attrVar.pos[0])}, 
						${(this.aoParent.attrVar.yScale(this.attrVar.pos[1]))})
					scale(${this.attrVar.scale})`
				)
				.ease(ease)
			}
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
			let xDomain  = zoomParams.xDomain  || this.xScale.domain()
			let yDomain  = zoomParams.yDomain  || this.yScale.domain().reverse()
			let zoomEase = zoomParams.zoomEase || d3.easeLinear

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
		
			this.aoG.select("#"+ this.attrFix.id + "_baseArea")
				.transition()
				.duration(duration)
				.ease(zoomEase)
				.call(zoom.transform, zoomTransform)

		},delay)

	}

	_InitInnerSpace(){

		this._DefineXscale()
		this._DefineYscale()

		// Define line function after inner space is known
		this._DefineLineData(this.attrVar.xScale, this.attrVar.yScale)
	}

	_UpdateParams(params){
		this.attrVar.pos 			= params.pos			|| this.attrVar.pos			|| undefined
		this.attrVar.scale	 	 	= params.scale   	  	|| this.attrVar.scale   	|| 1
		this.attrVar.opacity 	 	= params.opacity 	  	|| this.attrVar.opacity 	|| 1
		this.attrVar.data    	 	= params.data	  	  	|| this.attrVar.data	  	|| undefined
		this.attrVar.strokeColor 	= params.strokeColor 	|| this.attrVar.strokeColor || "white"
		this.attrVar.strokeWidth 	= params.strokeWidth 	|| this.attrVar.strokeWidth || 1
		this.attrVar.fill 	 	 	= params.fill 	  	  	|| this.attrVar.fill 		|| "#666da3"

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
		this.attrDraw.drawType	  = params.drawType 	|| this.attrDraw.drawType 	 	|| "show"
		this.attrDraw.drawEase    = params.drawEase 	|| this.attrDraw.drawEase  		|| d3.easeCubic
		this.attrDraw.entPoint    = params.entPoint 	|| this.attrDraw.entPoint 		|| [0, 1090]
		this.attrDraw.moveInScale = params.moveInScale  || this.attrDraw.moveInScale 	|| 1/5
		this.attrDraw.moveInEase  = params.moveInEase 	|| this.attrDraw.moveInEase  	|| d3.easeBack
	}

	_UpdateInnerSpace(duration, type){

		const t = d3.transition()
			.duration(duration)

		if (type=="update"){

			// Redefine scales
			this._DefineXscale()
			this._DefineYscale()

			// Re-define base area and clip
			let mydata = [{
				"width":this.aoParent.attrVar.xScale(this.attrVar.xRange[1]),
				"height":this.aoParent.attrVar.yScale(
					this.aoParent.attrVar.yScale(
						this.aoParent.attrVar.pos[1]) - this.attrVar.yRange[1]),
				"fill":"none",
				"id":this.attrFix.id + "_baseArea"
			}]
			
			// https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs
			this.aoG.select("#" + this.attrFix.id + "_baseAreaGroup")
				.selectAll(".rect")
				.data(mydata, function(d) { return d })
				.join(
					enter => enter
						.append("rect")
						.attr("class","rect")
						.attr("id", d => d.id)
						.attr("fill", d => d.fill)
						.call(
							enter => enter
								.transition(t)
								.attr("width", d => d.width)
								.attr("height", d => d.height)
						),
					update => update
						.attr("fill", d => d.fill)
						.call(
							update => update
								.transition(t)
								.attr("width", d => d.width)
								.attr("height", d => d.height)
						),
					exit => exit.call(
							exit => exit
							.transition(t)
							.remove()
						)
				)
			this.aoG.select("#" + this.attrFix.id + "_clip")
				.selectAll(".rect")
				.data(mydata, function(d) { return d })
				.join(
					enter => enter
						.append("rect")
						.attr("class","rect")
						.call(
							enter => enter
								.transition(t)
								.attr("width", d => d.width)
								.attr("height", d => d.height)
						),
					update => update.call(
						update => update
							.transition(t)
							.attr("width", d => d.width)
							.attr("height", d => d.height)
						),
					exit => exit.call(exit => exit
						.transition(t)
						.remove()
						)
				)

			// If inners space is updated, re-define zoom also
			this._DefineZoom()
		
		} else if(type=="zoom"){

			this.attrVar.zoomedXScale = d3.event.transform.rescaleX(this.attrVar.xScale)
			this.attrVar.zoomedYScale = d3.event.transform.rescaleY(this.attrVar.yScale)

			this.xAxis.scale(this.attrVar.zoomedXScale)
			this.yAxis.scale(this.attrVar.zoomedYScale)
		}

		// Update line function after changes in inner space
		this._DefineLineData()
	}

	_DefineZoom(){

		this.zoom = d3.xyzoom(this)
			.extent([
				[this.attrVar.xScale.range()[0], this.attrVar.yScale.range()[0]],
				[this.attrVar.xScale.range()[1], this.attrVar.yScale.range()[1]]]
			)
			.scaleExtent([],[]) // scale extent [0, inf] for both
			.on('zoom', this._ZoomUpdate.bind(this))

		// When zoom ends, update scales
		this.zoom.on("end", d => {
			this.attrVar.xScale = this.attrVar.zoomedXScale
			this.attrVar.yScale = this.attrVar.zoomedYScale
			this.attrVar.xDomain = this.attrVar.xScale.domain()
			this.attrVar.yDomain = this.attrVar.yScale.domain()

			// Update baseArea such that new zoomed position is zoomIdentity
			this.aoG.select("#" + this.attrFix.id + "_baseArea")._groups[0][0].__zoom.kx = 1
			this.aoG.select("#" + this.attrFix.id + "_baseArea")._groups[0][0].__zoom.ky = 1
			this.aoG.select("#" + this.attrFix.id + "_baseArea")._groups[0][0].__zoom.x = 0
			this.aoG.select("#" + this.attrFix.id + "_baseArea")._groups[0][0].__zoom.y = 0
		})

		d3.select("#"+this.attrFix.id).select("#" + this.attrFix.id + "_baseArea")
			.call(this.zoom)
	}

	_ZoomUpdate(){
	
		// Update inner space if it exists. Given that we are zooming it should always exist!
		if (this.attrFix.hasInnerSpace === true){
			this._UpdateInnerSpace(0, "zoom")
			
			// If AnimObject has axes attached to it, scale those as well
			// Uses d3-rescale on definded scales xCale and yscale. That is, we 
			// pick up the on-going transform using d3.event.transform and use
			// its knowledge to rescale the axes scales
			if (typeof this.xAxisGroup !== 'undefined'){
				const zx = d3.event.transform.rescaleX(this.attrVar.xScale)
				this.xAxisGroup.call(this.xAxis.scale(zx))
				this._UpdateXAxisGroup()
			}
			if (typeof this.yAxisGroup !== 'undefined'){
				const zy = d3.event.transform.rescaleY(this.attrVar.yScale)
				this.yAxisGroup.call(this.yAxis.scale(zy))
				this._UpdateYAxisGroup()
			}
		}

		let that = this

		let zoomedLineFunction = d3.line()
			.x(function(d) {return that.attrVar.zoomedXScale(d[0])})
			.y(function(d) {return that.attrVar.zoomedYScale(d[1])})

		// Zooming behavior over all children AnimObjects of current AnimObject
		this.aoChildren.forEach((el) => {

			if (el.constructor.name === "Path"){
				el.aoG.selectAll("path").attr("d", zoomedLineFunction(el.attrVar.data))
			}
			// Needs rest of types here
		})

		// Zoom all scatter circles
		// THIS IS OLD CODE OPERATING SOLELY ON PLOT CLASS, TO BE CHANGED SO THAT INCLUDED IN ABOVE
		this.aoG
			.selectAll("circle")
			.attr("transform", function(d) {
				return " translate(" + (that.attrVar.zoomedXScale(d.x)) +","+ (that.attrVar.zoomedYScale(d.y)) +")"
		})
	}

	_DefineLineData(){
		// Line function for current AnimObject.
		let that = this
		let lineFunction = d3.line()
			.x(function(d) {return that.attrVar.xScale(d[0])})
			.y(function(d) {return that.attrVar.yScale(d[1])})
		this.lineFunction = lineFunction
	}

	_DefineXscale(){
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
	}

	_DefineYscale(){
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

}
