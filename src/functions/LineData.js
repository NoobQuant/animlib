export function LineData(d,curve){
    if (typeof(d) == "object"){
        return d3.line()
                 .curve(curve)(d)
    } else if (typeof(d) == "string"){
        return d
    }
}