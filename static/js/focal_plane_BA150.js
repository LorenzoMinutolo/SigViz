function selector(e){
  return this.indexOf(e) < 0;
}

// Box dimensions
var total_height = 1000;
var total_width = 1000;

var total_step_x = 4;
var total_step_y = 4;

// this is a json file conraining which tile is present/working and possibly other info
// for now it's just a random configuration
var focal_plane_config = {
  'active':[1,2,6,8,14],
  'present':[1,2,4,5,6,7,8,9,10,11,13,14],
  'warning':[5,13,9],
  'names':[],
  'info':[]
}
var selected_tile = Array(0);

// given x and y returns the number of the tile in the array
function xy2n(x, y){
  return x*total_step_x + y
}

//x and y are steps, return the position of the rectangle
function gridpos_x(x_step){
  return x_step * total_width/total_step_x
}
function gridpos_y(y_step){
  return y_step * total_height/total_step_y
}

// Array containig the rectangles. Will be filled when the document is ready
var tiles = Array(0);

function select_active(index){
  return focal_plane_config['active'].includes(index);
}

function select_present(index){
  return focal_plane_config['present'].includes(index);
}

function select_warning(index){
  return focal_plane_config['warning'].includes(index);
}

function format_tooltip(index){
  return "<b>Name:</b> " + focal_plane_config['names'][index] + "<hr><b>Info:</b> " + focal_plane_config['info'][index]
}

function make_active(rect, index){
  rect.attr("fill", "rgb(15, 103, 255)")
  focal_plane_config['info'][index] = "This tile is active and streaming data"
  rect.on("mouseover", function(){
    tooltip.html(format_tooltip(index));
    return tooltip.style("visibility", "visible");
  })
  rect.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX-200)+"px");})
  rect.on("mouseout", function(){return tooltip.style("visibility", "hidden");})
}
function make_present(rect, index){
  rect.attr("fill", "rgb(215, 219, 216)");
  focal_plane_config['names'][index] = "MD-"+index
  focal_plane_config['info'][index] = "This tile is present but there is no associated data stream"
  rect.on("mouseover", function(){
    tooltip.html(format_tooltip(index));
    return tooltip.style("visibility", "visible");
  })
  rect.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX-200)+"px");})

  rect.on("mouseout", function(){return tooltip.style("visibility", "hidden");})

  // Click options
  rect.on("click", function(){

    svgContainer.selectAll("rect")
      .attr("stroke", "white")
      .lower()
    rect.raise();
    selected_tile = Array(0);
    selected_tile.push(rect.attr("id"))
    return rect.attr("stroke", "black");
  })
  rect.on("dblclick", function(){
    window.open(triangle_view + "/" + rect.attr("id"))
  })

}
function make_warning(rect, index){
  rect.attr("fill", "rgb(250, 137, 0)");

  focal_plane_config['info'][index] = "This tile has a warning, something went wrong on the streamer side"
  rect.on("mouseover", function(){
    tooltip.html(format_tooltip(index));
    return tooltip.style("visibility", "visible");
  })
  rect.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX-200)+"px");})
  rect.on("mouseout", function(){return tooltip.style("visibility", "hidden");})

}
// apply the configuration
function apply_focal_plane_config(){
  for(var i = 0; i<tiles.length; i++){
    if(select_present(i)){
      make_present(tiles[i],i);
    }
    if(select_active(i)){
      make_active(tiles[i],i);
    }
    if(select_warning(i)){
      make_warning(tiles[i],i);
    }

  }
}

// Fill the array when document is loaded. All other fuction should be included in this scope
docReady(function(){
  var x_size = total_width/total_step_x;
  var y_size = total_height/total_step_y;
  var square_size = Math.min(x_size,y_size)
  for(var i = 0; i<total_step_x; i++){
    for(var j = 0; j<total_step_y; j++){
    focal_plane_config['names'].push("")
    focal_plane_config['info'].push("")
    tiles.push(
      svgContainer.append("rect")
       .classed("rect", true)
       .attr("width", square_size)
       .attr("height", square_size)
       .attr("fill", "white")
       .attr("stroke-width", 5)
       .attr("stroke", "white")
       .attr("transform", "translate(" + gridpos_x(i)+ " "+ gridpos_y(j)+")")
       .attr("id",i*total_step_x + j)
       .on("click", function(){
         selected_tile = Array(0);
         svgContainer.selectAll("rect")
           .attr("stroke", "white")
           .lower()
       })
     )
    }
  }
  apply_focal_plane_config()
});

var svgContainer = d3.select("div#focal_plane_view")
 .append("div")
 // Container class to make it responsive.
 .classed("svg-container", true)
 .append("svg")
 // Responsive SVG needs these 2 attributes and no width and height attr.
 .attr("preserveAspectRatio", "xMinYMin meet")
 .attr("viewBox", "0 0 "+ total_height +" " + total_width)
 // Class to make it responsive.
 .classed("svg-content-responsive", true)

var tooltip = d3.select("div#focal_plane_view")
	.append("div")
	.style("position", "absolute")
	.style("z-index", "10")
  .style("border-style", "solid")
  .style("background-color", "white")
  .style("padding", "10px")
  .style("opacity", "0.8")
	.style("visibility", "hidden")
	// .text("tooltip utility fot the tiles");
