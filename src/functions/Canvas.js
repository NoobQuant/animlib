export function Canvas(params){
	/* Function for background canvas */

	let id           = "bgsvg"
	let dim			 = params.dim || [1930, 1090]
	let color        = params.bolor || "#080019"
	let opacity      = params.opacity || 1                 
	let strokeColor  = params.strokeColor || "black"
	let strokeWidth  = params.strokeWidth || 0

	let width = dim[0]
	let height = dim[1]
	const surface = d3.select("body")

    let svg = surface
				.append("svg")
				.attr('id',id)
				.attr("width", width)
				.attr("height", height)

	// rectangle for svg for filling 	
	svg.append("rect")
	    .style("fill", color)
	    .style("fill-opacity", opacity)
        .attr("width", width)
		.attr("height", height)
		.style("stroke", strokeColor)
	    .style("stroke-width", strokeWidth)		
	
	// Make sure svg is on top
	svg.raise()

	// Return svg
	return svg
}