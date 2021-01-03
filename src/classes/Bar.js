import {AnimObject} from './AnimObject.js'
export class Bar extends AnimObject{


    constructor(params, aoParent){
    
        super(params, aoParent)
        this._CalculatrHistVar()
    }

	Draw({delay, duration, params={}}={}){

		d3.timeout(() => {

            // Common AnimObject draw that displays aoG
            // Pass extra draw parameter to circumvent position translating,
            // as path object is already positioned
            params["disable_translation_pos"] = true
            super.Draw({delay:0, duration:0, params:params})

            // PRBLEM: This kicks in before draw parameters get update in above Draw.
            this._Draw(duration)

		}, delay=delay)
    }

	Update({delay, duration, params={}}={}){
		d3.timeout(() => {
            // Update common AnimObject
            params["disable_translation_pos"] = true
			super.Update({delay:0, duration:duration, params:params})
            // Update Bar specific
            this._Draw(duration)
		}, delay)
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
            } else if(that.barDataType==="bar"){
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
            .attr("transform", (d, i) => 'translate( '+ xScale(d.x0) +','+ yScale(d.y) +')')

        bar.select("rect")
            .transition()
            .duration(duration)
            .attr('fill',this.attrVar.fill)
            //.attr("height", this._BarHeight)
            .attr("height", BarHeight)

        // handle new elements ENTER
        let barEnter = bar
            .enter()
            .append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + xScale(d.x0) + "," + barHeightVar + ")" })
        
            barEnter.transition()
                .duration(duration)
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
            // This wont work because draw parametes dont get updated yet in correct order...
            //.ease(this.attrDraw.drawEase)
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
                .domain(this.attrVar.xScale.domain())
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