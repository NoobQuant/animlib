// http://bl.ocks.org/larsenmtl/86077bddc91c3de8d3db6a53216b2f47
export function AddMathJax(svg){

	setTimeout(() => {
	  
	  MathJax.Hub.Config({
	    tex2jax: {
	      inlineMath: [ ['$','$'], ["\\(","\\)"] ],
	      processEscapes: true

	    }
	  })
	  
	  MathJax.Hub.Register.StartupHook("End", function() {
	    setTimeout(() => {
	          svg.selectAll('.mathjax').each(function(){
	          var self = d3.select(this),
	              g = self.select('text>span>svg');
	          g.remove();
	          self.append(function(){
	            return g.node();
	          });
	        });
	      }, 1);
	    });
	  
	  MathJax.Hub.Queue(["Typeset", MathJax.Hub, svg.node()])
	  
	}, 1) 
}