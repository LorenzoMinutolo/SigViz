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

var stuff=svgContainer.append("polyline")
  .classed("polyline", true)
  .attr("points","0 0, 900 900, 500 500")
  .attr("fill", "green")
  .attr("stroke-width", 5)
  .attr("stroke", "white")
  .attr("transform", "translate(" + 0+ " "+ 0+")")
