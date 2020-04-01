// Box dimensions
var total_height = 1000;
var total_width = 1000;

var total_step_x = 4;
var total_step_y = 4;



var svgContainer = d3.select("div#triangle_viewer")
 .append("div")
 // Container class to make it responsive.
 .classed("svg-container", true)
 .append("svg")
 // Responsive SVG needs these 2 attributes and no width and height attr.
 .attr("preserveAspectRatio", "xMinYMin meet")
 .attr("viewBox", "0 0 "+ total_height +" " + total_width)
 // Class to make it responsive.
 .classed("svg-content-responsive", true)


function svgContainer.append("path")
      .attr("d", " M 10 25 L 10 75 L 60 75 L 10 25")
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("fill", "white")
