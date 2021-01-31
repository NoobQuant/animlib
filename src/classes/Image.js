export class Image{
/* 
Display images from .svg or .png/jpg files.

When displaying .svg, it is assumed that image content is placed
correctly on a same-sized document as the svg upon which image
is placed. Position and scaling operates on the placed svg.

.png and .jpg images cannot be rescaled currently.

// NEEDS TO EXTEND AnimObject BUT DOES NOT YET!

*/

    constructor(params){

        this.pos          = params.pos	
        this.path         = params.path
        this.id           = params.id
        this.relSize      = params.relSize
        this.relEntPoint  = params.relEntPoint
        this.moveInEase   = params.moveInEase || d3.easeLinear
        this.drawType     = params.drawType || "scalein"
        this.initSize     = (this.drawType == "scalein") ? (params.initSize || 1/4) : null
		this.parentId        = params.parentId || "bgsvg"

        this.g = d3.select('#'+this.parentId).append('g')
                    .attr('id', this.id)
                    .style('opacity', 0.0)

        let imgs = this.g.selectAll("image").data([0])

        if (this.path.endsWith('.svg')){
            imgs.enter()
                .append("svg:image")
                .attr("href", this.path)
                .attr("x", this.pos[0])
                .attr("y", this.pos[1])				
                .attr("width", +this.relSize[0]+"%")
                .attr("height", +this.relSize[1]+"%")		
        } else if (this.path.endsWith('.png') | this.path.endsWith('.jpg')){
            imgs.enter()
                .append("svg:image")
                .attr("href", this.path)
                .attr("x", this.pos[0])
                .attr("y", this.pos[1])			
        }
    }

    Draw({delay, duration}={}){
        if (this.drawType==="scalein"){
            this.g.attr("transform", "translate(" + this.pos[0] + "," + this.pos[1]  + ")" + "scale(" + this.initSize +")")
            this.g.transition()
                    .delay(delay)
                    .duration(duration)  
                    .style('opacity', 1.0)
                    .attr("transform", "  scale(" + 1 +")")
                    .ease(this.moveInEase)
        } else if (this.drawType==="fadein"){
            this.g.transition()
                    .delay(delay)
                    .duration(duration)  
                    .style('opacity', 1.0)
                    .ease(this.moveInEase)
        } else if (this.drawType == 'movein'){
            this.g.attr("transform", "translate(" + (this.relEntPoint[0]) + "," + (this.relEntPoint[1]) + ")")
            this.g.transition()
                    .delay(delay)
                    .duration(duration)
                    .style("opacity",1.0)
                    .attr("transform", "translate(" + 0 + "," + 0  + ")")
                    .ease(this.moveInEase)			
        }
    }

    Hide({delay, duration}={}){
        this.g.transition()
                .delay(delay)
                .duration(duration)        
                .style("opacity", 0.0)
    }
}