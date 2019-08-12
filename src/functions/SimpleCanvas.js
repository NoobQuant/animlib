export function SimpleCanvas(canvasWidth, canvasHeight, box = false, bgcolor = "#080019"){
	/*
	    #09203f dark blue
	    #242424 dark grey
	    #272822 monokai	
	    #000000 black
	    #FFFFFF white
	*/
    var svg = d3.select("body")
		.append("svg")
		.attr('id','bgsvg')
	    .attr("width", canvasWidth)
	    .attr("height", canvasHeight)

	svg.append("rect")
	    .style("fill", bgcolor) // monokai		        
	    .style("fill-opacity", 1.0)
        .attr("width", canvasWidth)
        .attr("height", canvasHeight)

    if (box == true){svg.style("stroke", "black")}

	return svg
}