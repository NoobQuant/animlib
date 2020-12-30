export class AnimObject{
	/*
	AnimObject is a general class for animatable objects. Object of class AnimObject has
	a property <aoG> that points to <g> element associated with AnimObject. This <g> element
	stores all SVG element belonging to AnimObject. It attaches to parent AnimObject selection,
	so that in DOM the AnimObject <g> node (element in HTML) is childNode of parent AnimObject node.
	
	Property <aoParent> points to another object of class AnimObject or class Canvas, which is considered
	as parent of current AnimObject. Further property <aoChildren> gives all childrent AnimObjects of current
	AnimObject.
	--> TO BE CHEKED: IS IT INDEED A POINTER OR A COPY OF THE OBJECT! IF A COPY; CHANGES TO
		PARENT NOT VISIBLE IN STORED PARENT OBJECT WITHIN ANIMOBJECT!

	AnimObject object also has properties <attrFix> and <attrVar> which store attributes/
	parameters assumes to be fixed and varying, respectively:
	- attrFix
	 - id (string): ID of <g> element corresponding to this.aoG
	 - hasInnerSpace (boolean): Whether AnimObject is assumed to have notion of inner space.
	- attrVar (varying attributes)
	 - pos (float array): $[x, y]$ position relative to parent which is assumed to have inner space.
	 - opacity (float): Opacity of this.aoG <g> element.
	 - scale (float): Scale (i.e. size) of this.aoG <g> element.
	 - data (varying object): object storing data for AnimObject. E.g. for child Path contains data for path line.

	Other properites
	 - lineFunction: TBF
	*/
	constructor(params, aoParent){

		// Fixed attributes
		this.attrFix 	= {}
		this.attrFix.id = params.id

		// Varying attributes
		this.attrVar = {}
		this._UpdateParams(params)

		// Group for AnimObject svg elements.
		this.aoG = d3.select('#'+ aoParent.attrFix.id)
			.append("g")
			.attr("id", this.attrFix.id)
			.style("opacity", 0)

		// Store parent AnimObject at JS object level.
		this.aoParent 	= aoParent

		// Append current AnimObject as property of parent AnimObject.
		aoParent.aoChildren.push(this)
		
		// Prepare property for future children
		this.aoChildren = []

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

	Draw({delay, duration, params={}}={}){
		/* Draw AnimObject*/
		d3.timeout(() => {

			// Update draw attributes
			this.attrDraw = {}
			this._UpdateDrawParams(params)

			// Set positions
			let xPos = this.attrVar.pos[0]
			let yPos = this.attrVar.pos[1]
			let xEntPos
			let yEntPos
			if (this.attrDraw.type === "movein"){
				xEntPos = this.attrDraw.entPoint[0]
				yEntPos = this.attrDraw.entPoint[1]
			}

			// Draw AnimObject
			if ("disable_translation_pos" in params & params["disable_translation_pos"]===true){
			// Check if we should skip translation positioning and just display the object. This is for
			// objects that have their position already determined via data preparation.
				d3.select("#"+this.attrFix.id)
				.transition()
				.duration(duration)
				.style("opacity",this.attrVar.opacity)
			} else if (this.attrDraw.type === "show"){
				d3.select("#"+this.attrFix.id)
					.attr("transform",
							"translate(" + this.aoParent.attrVar.xScale(xPos) + "," +
								(this.aoParent.attrVar.yRange[1] - this.aoParent.attrVar.yScale(yPos)) + ")")
					.transition()
					.duration(duration)
					.style("opacity",this.attrVar.opacity)
			} else if (this.attrDraw.type === "movein"){
				d3.select("#"+this.attrFix.id)
					.attr("transform",
						"translate(" + this.aoParent.attrVar.xScale(xEntPos) + "," +
							this.aoParent.attrVar.yScale(this.aoParent.attrVar.yScale(yPos) - yEntPos) + ")")
					.transition()
					.duration(duration)
					.style("opacity",this.attrVar.opacity)
					.attr("transform",
						"translate(" + this.aoParent.attrVar.xScale(xPos) + "," +
							(this.aoParent.attrVar.yRange[1] - this.aoParent.attrVar.yScale(yPos)) + ")")
					.ease(this.attrDraw.moveInEase)
			} else if (this.attrDraw.type === "scalein"){
				d3.select("#"+ this.attrFix.id)
					.attr("transform",
						"translate(" + this.aoParent.attrVar.xScale(xPos) + "," +
							this.aoParent.attrVar.yScale(yPos) +") scale("+ this.attrDraw.moveInScale +")")
					.transition()
					.duration(duration)
					.attr("transform",
						"translate(" + this.aoParent.attrVar.xScale(xPos) + "," +
							(this.aoParent.attrVar.yRange[1] - this.aoParent.attrVar.yScale(yPos)) +
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
			let ease = params.ease || d3.easeLinear

			// Update varying AnimObject parameters
			this._UpdateParams(params)

			// Update inner space if it exists
			if (this.attrFix.hasInnerSpace === true){
				this._UpdateInnerSpace(duration, "update")
			}

			// Update position and scale
			d3.select("#"+this.attrFix.id)
			.transition()
			.duration(duration)
			.attr("transform",
				"translate(" + this.aoParent.attrVar.xScale(this.attrVar.pos[0]) + "," +
					(this.aoParent.attrVar.yRange[1] - this.aoParent.attrVar.yScale(this.attrVar.pos[1])) +
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

		// Define line function after inner space is known
		this._DefineLineData(this.attrVar.xScale, this.attrVar.yScale)
	}

	_UpdateParams(params){
		this.attrVar.pos 	 = params.pos 	  || this.attrVar.pos     || [0,0]
		this.attrVar.scale	 = params.scale   || this.attrVar.scale   || 1
		this.attrVar.opacity = params.opacity || this.attrVar.opacity || 1
		this.attrVar.data    = params.data	  || this.attrVar.data	  || undefined
		this.attrVar.strokeColor = params.strokeColor || this.attrVar.strokeColor || "steelblue"
		this.attrVar.strokeWidth = params.strokeWidth || this.attrVar.strokeWidth || 1

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
		this.attrDraw.type		  = params.type 		|| this.attrDraw.type 	 		|| "show"
		this.attrDraw.entPoint    = params.entPoint 	|| this.attrDraw.entPoint 		|| [0,0]
		this.attrDraw.moveInScale = params.moveInScale  || this.attrDraw.moveInScale 	|| 1/5
		this.attrDraw.moveInEase  = params.moveInEase 	|| this.attrDraw.moveInEase  	|| d3.easeBack
		this.attrDraw.drawEase    = params.drawEase 	|| this.attrDraw.drawEase  		|| d3.easeCubic
	}

	_UpdateInnerSpace(duration, type){

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
				.domain(this.attrVar.yDomain)

			// Re-define base area and clip
			let mydata = [{
				"width":this.aoParent.attrVar.xScale(this.attrVar.xRange[1]),
				"height":this.aoParent.attrVar.yScale(this.aoParent.attrVar.yScale(this.aoParent.attrVar.pos[1]) - this.attrVar.yRange[1]),
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

}
