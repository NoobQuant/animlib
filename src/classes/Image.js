import {AnimObject} from './AnimObject.js'
export class Image extends AnimObject{

	constructor(params, aoParent){

        // Inherited from AnimObject
        super(params, aoParent)

        // Parameters required by Image but not updated along AnimObject
        // parameters
        let relSize = params.relSize
        let path = params.path

        // Initialize the image
        let imgs = this.aoG.selectAll("image").data([0])
        if (path.endsWith('.svg')){
            imgs.enter()
                .append("svg:image")
                .attr("href", path)
                .attr("width", + relSize+"%")
                .attr("height", + relSize+"%")
        } else if (path.endsWith('.png') | path.endsWith('.jpg')){
            imgs.enter()
                .append("svg:image")
                .attr("href", path)
        }
	}
}