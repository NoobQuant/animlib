import {AnimObject} from './AnimObject.js'
export class Bar extends AnimObject{


    constructor(params, aoParent){
    
        super(params, aoParent)

        // Bar class specisig parameters
        this.attrVar.barBins 	 	= params.barBins 	  	|| this.attrVar.barBins 	|| 10
        this.attrVar.barDataType 	= params.barDataType 	|| this.attrVar.barDataType || "histogram"
    }

	Draw({delay, duration, params={}}={}){

		d3.timeout(() => {
            this._CalculatrHistVar()

            // Draw aoG
            //super.Draw({delay:0, duration:0, params:params})

            // Skip AnimObject draw, as Bar is quite a special case

			// Update draw attributes
            this._UpdateDrawParams(params)
            
            // Make sure aoG is visible
            d3.select("#"+this.attrFix.id)
                .style("opacity", this.attrVar.opacity)

        }, delay=delay)

		d3.timeout(() => {

            // PROBLEM: This kicks in before draw parameters get update in above Draw.
            this._Draw(duration)

		}, delay=delay+25)

    }

	Update({delay, duration, params={}}={}){
        
        d3.timeout(() => {

            // Bar class specisig parameters update
            this.attrVar.barBins 	 	= params.barBins 	  	|| this.attrVar.barBins 	|| 10
            this.attrVar.barDataType 	= params.barDataType 	|| this.attrVar.barDataType || "histogram"

            // AnimObject Update
			super.Update({delay:0, duration:0, params:params})
        }, delay)
        
        d3.timeout(() => {

            // Update Bar specific
            this._CalculatrHistVar()
            this._Draw(duration)

		}, delay+25)
    }

    _Draw(duration){

        let xScale = this.aoParent.attrVar.xScale
        let yScale = this.aoParent.attrVar.yScale
        let barHeightVar = this.aoParent.attrVar.yRange[1] - this.aoParent.attrVar.yRange[0]
        let that = this
        // Group under aoG for data binding. Unlike in Path and Scatter, it is not defined in constructor.
        // This is an attempt to merge Draw and Update

        function BarWidth(d) {
            if(['histogram', 'histogram_precalc'].includes(that.attrVar.barDataType)){
                return that.aoParent.attrVar.xScale(d.x1) - that.aoParent.attrVar.xScale(d.x0)
            } else if(that.attrVar.barDataType==="bar"){
                return that.aoParent.attrVar.xScale.bandwidth()
            }
        }

        function BarHeight(d) {
            return barHeightVar - that.aoParent.attrVar.yScale(d.y)
        }

        if (d3.select("#"+this.attrFix.id + "_barGroup").empty()){
            // Append group if drawn for first time
            this.aoG.append("g")
                .attr("id", this.attrFix.id + "_barGroup")
        }
        // Select bar group
        let bar = this.aoG.select("#"+this.attrFix.id + "_barGroup")
            .selectAll(".bar")
            .data(this.attrVar.histVar)

        // EXIT section
        bar.exit().remove()

        // UPDATE section
        bar.transition()
            .duration(duration)
            .ease(this.attrDraw.drawEase)
            .attr("transform", (d, i) => 'translate( '+ xScale(d.x0) +','+ yScale(d.y) +')')

        bar.select("rect")
            .transition()
            .duration(duration)
            .ease(this.attrDraw.drawEase)
            .attr('fill',this.attrVar.fill)
            .attr("height", BarHeight)

        // handle new elements ENTER
        let barEnter = bar
            .enter()
            .append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + xScale(d.x0) + "," + barHeightVar + ")" })
        
            barEnter.transition()
                .duration(duration)
                .ease(this.attrDraw.drawEase)
                .attr("transform", (d, i) => `translate(${xScale(d.x0)}, ${yScale(d.y)})`)
            
        let rect = barEnter.append("rect") 
            .attr('fill',this.attrVar.fill)
            .attr("width", BarWidth)
            .attr("height", 0)

        // handle updated elements
        // not sure why both this and bar.select("rect").transition() are needed
        rect.transition()
            .duration(duration)
            .attr("height", BarHeight)
            .ease(this.attrDraw.drawEase)
    }

    _CalculatrHistVar(){
        // If histogram, create array with elements representing each bin from passed in data.
        // Each element is an object with
        //	- y   : bar value
        //	- x0  : bar start position on x-axis
        //	- x1  : bar end position on x-axis
        //	- cum : cumualtive bar y values
        let histVar
        if (this.attrVar.barDataType == 'histogram'){
            histVar = d3.histogram()
                .domain(this.aoParent.attrVar.xScale.domain())
                .thresholds(this.attrVar.barBins)(this.attrVar.data)
            //Calculative cdf
            // https://stackoverflow.com/questions/34972419/d3-histogram-with-cumulative-frequency-distribution-line-in-the-same-chart-graph
            let noOfObservations = this.attrVar.data.length
            let last = 0
            for(let i=0; i < histVar.length; i++){
                // Current bin y value: number of observations in the bin divided by total number of observations 
                histVar[i]['y'] = histVar[i].length/noOfObservations
                histVar[i]['cum'] = last + histVar[i]['y']
                last = histVar[i]['cum']
            }

        } else if (this.attrVar.barDataType == 'histogram_precalc' || this.attrVar.barDataType == 'bar'){
            histVar = this.attrVar.data
            //Calculative cdf
            let last = 0
            for(let i=0; i < histVar.length; i++){
                histVar[i]['cum'] = last + histVar[i].y
                last = histVar[i]['cum'];
            }
        }
        // Update histVar in this
        this.attrVar.histVar = histVar
    }

}