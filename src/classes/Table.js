import {AnimObject} from './AnimObject.js'
export class Table extends AnimObject{
    constructor(params, aoParent){
        super(params, aoParent)
        this.path            = params.path
        this.width           = params.width || 700        
        this.tdFontSize      = params.tdFontSize || 26
        this.tdWidth         = params.tdWidth || 150
        this.tdPadding       = params.tdPadding || 6
        this.thPadding       = params.thPadding || 6
        this.thWidth         = params.thWidth || 150
        this.thFontSize      = params.thFontSize || 30
        
        let that = this
        
        var tableholder = this.aoG.append("foreignObject")					
                               .attr("width", this.width + 100)
                               .attr("height", 500)
                               .append("xhtml:body")

        // Inspired by
        //http://bl.ocks.org/AMDS/4a61497182b8fcb05906
        d3.json(this.path)
          .then(function(data){
                 
            let sortAscending = true
            let table = tableholder.append('table')
                                   .attr('width',that.width)
                                   .style("border-collapse", "collapse")
                                   .style("font", "14px/1.4 Helvetica")
            
            // headers                                                                    
            let titles = d3.keys(data[0])
            let headers = table.append('thead')
                               .append('tr')
                               .selectAll('th')
                               .data(titles).enter()
                               .append('th')
                               .text(function (d) {return d})
                               .on('click', function (d) {
                                   headers.attr('class', 'header')
                                   if (sortAscending) {
                                    rows.sort(function(a, b) { return b[d] < a[d] })
                                    sortAscending = false
                                    this.className = 'aes'
                                   } else {
                                    rows.sort(function(a, b) { return b[d] > a[d] })
                                    sortAscending = true
                                    this.className = 'des'
                                   }
                               })
                               .style("padding", that.thPadding +"px")
                               .style("text-align", "center")
                               .style("width", that.thWidth + "px")
                               .style("border", "1px solid #ccc")
                               .style("background","#333")
                               .style("color","white")
                               .style("font-weight","bold")
                               .style("font-size",that.thFontSize+"px")
                               .style("background-repeat","no-repeat")
                               .style("background-position","3% center")
           
            // rows
            let rows = table.append('tbody')
                            .selectAll('tr')
                            .data(data)
                            .enter()
                            .append('tr')
            rows.selectAll('td')
                .data(function (d) {
                    return titles.map(function (k) {
                        return { 'value': d[k], 'name': k}
                    })
                })
                .enter()
                .append('td')
                .style("font-size", that.tdFontSize + "px")
                
                .style("padding", that.tdPadding+"px")
                .style("text-align", "center")
                .style("width", that.tdWidth+"px")
                .attr('data-th', function (d) {
                    return d.name
                })
                .text(function (d) {
                    return d.value
                })
                
            // altering background colors for rows
            d3.selectAll("tr:nth-of-type(odd)").style("background","#FFFFFF")
            d3.selectAll("tr:nth-of-type(even)").style("background","#BED6FF")                   

        })     
    }

}