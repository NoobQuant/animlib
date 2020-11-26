export class ForceLayout{

	constructor(params){	
		
		this.parentId			   = params.parentId || "bgsvg"
		this.nodes        		   = params.nodes
		this.id					   = params.id
		this.forcemanybodystrength = params.forcemanybodystrength || -2
		this.alpha				   = params.alpha || 1
		this.alphamin			   = params.alphamin || 0.001
		this.steps				   = params.steps || 300
		this.velocitydecay		   = params.velocitydecay || 0.4
		this.forcexstrength		   = params.forcexstrength || 0.07
		this.forceystrength		   = params.forceystrength || 0.07
		
		this.simulation = d3.forceSimulation(this.nodes)
			.force("charge", d3.forceManyBody().strength(this.forcemanybodystrength))
			.alpha(this.alpha)
			.alphaMin(this.alphamin)
			.alphaDecay(1 - Math.pow(this.alphamin, 1 / this.steps))
			.velocityDecay(this.velocitydecay)
			.force('collision', d3.forceCollide()
				.radius(function(d){return d.radius})
			)    
			.force('x', d3.forceX()
				.x(function(d) {return d.xCenter})
				.strength(this.forcexstrength)
			)
			.force('y', d3.forceY()
				.y(function(d) {return d.yCenter})
				.strength(this.forceystrength)
			)
			.stop()
							
		this.node = d3.select('#'+this.parentId)
					 .append("g")
					 .attr("id",this.id)
					 .attr("stroke", 'black')
					 .attr("stroke-width", 1)
					 .selectAll(".node")

	}

    Draw({delay,tickInterval=20}={}){
	/* 
	Function to animate force lauout.
    
    It seems we need to help currentTime with delaying force ticks. Otherwise they
	will just run with no respect to faked browser time... For some reason 20 seems to 
	work pretty well for animationtickinterval. Prolly due to d3.timer precision...	
	*/   
        let that = this
        let animTimer = d3.timeout(function() {        
            d3.interval( function(elapsed){
                that.Tick()
            },tickInterval)
        }, delay)

		this.activeTimer = animTimer
	}

	Hide({delay, duration}={}){

	d3.select('#'+ this.id)
		.transition()
		.duration(duration)
		.delay(delay)
		.style("opacity",0.0)	    

	}

	// CONTINUE
	Update({delay, params}={}){
		// nodesUpdt need to match original nddes per ID
		let nodesUpdt = params.data
		let alphaTarget = params.alphaTarget
		let that = this

		d3.timeout(function() {
			
			// Stop currently active force timer
			that.activeTimer.stop()
			
			// Update this.nodes upon those attributes that nodesUpdt
			// Needs wrapper and all other possible updateable things!
			that.nodes.forEach(function(d){d.color = nodesUpdt[d.name].color})
			that.nodes.forEach(function(d){d.radius = nodesUpdt[d.name].radius})			
			
			// Activate updated nodes and reheat animation
			that.Activate({nodes:that.nodes})
			that.simulation.alphaTarget(alphaTarget).restart()
			that.simulation.stop()
			that.Draw({delay:0})		

		},delay)			
	}

    Tick(){
        // Tick simulation once
        this.simulation.tick()
        // Show once ticked simulation
        this._ShowTick()           
	}
	
	Activate({nodes}={}) {
		/*Function to activate force nodes. */
	
		// Join new data with old
		this.node = this.node.data(nodes, function(d) { return d.name})
		
		// Remove old elements
		this.node.exit()
					// For some reason we need this here...
					.style("fill", function(d){ return d.color })
					.remove()
	
		// Enter new elements
		// ... but for some reason attr-fill SHOULD NOT be in here!
		this.node = this.node.enter()
								.append("circle")
								.attr("r", function(d){return d.radius })
								.merge(this.node)
		
		// Append new data to simulation
		this.simulation.nodes(nodes)
	}

	
    _ShowTick(){
        this.node.attr("cx", function(d) { return d.x })
				 .attr("cy", function(d) { return d.y })
				 .attr("fill", function(d) { return d.color })
				 .attr("r", function(d) { return d.radius })				 
    }		
}