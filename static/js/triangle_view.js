// Box dimensions
var total_height = 1000.;
var total_width = 1000.;

var total_step_x = 32.;
var total_step_y = 32.;

var border_size = 10
// index to triangle 2d index
var triangle_pos = Array(0)
var triangle_size_x = (total_width - total_step_x*border_size)/total_step_x;
var triangle_size_y = (total_height - total_step_y*border_size)/total_step_y

var triangle_step_x = (total_width)/total_step_x;
var triangle_step_y = (total_height)/total_step_y


// var color_scale = chroma.scale(['black','red','blue','yellow']);
var color_scale = chroma.scale(['yellow', '008ae5']);


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

// where x and y are indexes
function make_triangle_position_polA(x, y){
  var start_x = triangle_size_x*x// + x*border_size;
  var end_x = start_x + triangle_size_x;

  var start_y = triangle_size_y*y// + y*border_size;
  var end_y = start_y + triangle_size_y;
  var set_string = " M "+ start_x +" "+ start_y +" L "+ start_x +" "+ end_x +" L "+ end_y +" "+ end_x +" L "+ start_x +" "+ start_y;
  // console.log(set_string)
  return set_string
}
function make_triangle_position_polB(x, y){
  var start_x = triangle_size_x*x// + x*border_size;
  var end_x = start_x + triangle_size_x;

  var start_y = triangle_size_y*y// + y*border_size;
  var end_y = start_y + triangle_size_y;
  var set_string = " M "+ start_x +" "+ start_y +" L "+ start_x +" "+ end_x +" L "+ end_y +" "+ end_x +" L "+ start_x +" "+ start_y;
  var set_string = " M "+ start_x +" "+ start_y +" L "+ end_x +" "+ start_x +" L "+ end_y +" "+ end_x +" L "+ start_x +" "+ start_y;
  // console.log(set_string)
  return set_string
}

function make_tanslate(x, y){
  var x_pos = (triangle_step_x*x)// + (x*border_size)
  var y_pos = (triangle_step_y*y)// + (y*border_size)
  var str =  "translate(" + x_pos + " "+ y_pos +")";
  return str
}
function make_triangleA(x,y){
  var polA = svgContainer.append("path")
        // .attr("d", " M 10 25 L 10 75 L 60 75 L 10 25")
        .attr("d", make_triangle_position_polA(0, 0))
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("fill", "black")
        .attr("transform", make_tanslate(x, y))
  polA.on("click", function(){

    svgContainer.selectAll("path")
      .attr("stroke", "white")
      .lower()
    polA.raise();
    // selected_tile = Array(0);
    // selected_tile.push(rect.attr("id"))
    return polA.attr("stroke", "grey");
  })
  return polA
}
function xy2n(x,y){
  return x + (total_step_y)*y;
}
function make_triangleB(x,y){
  var polB = svgContainer.append("path")
        // .attr("d", " M 10 25 L 10 75 L 60 75 L 10 25")
        .attr("d", make_triangle_position_polB(0, 0))
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("fill", "green")
        .attr("transform", make_tanslate(x, y))
  polB.on("click", function(){
    svgContainer.selectAll("path")
      .attr("stroke", "white")
      .lower()
    polB.raise();
    // selected_tile = Array(0);
    // selected_tile.push(rect.attr("id"))
    return polB.attr("stroke", "grey");
  })
  return polB
}

for(var y = 0; y<total_step_y; y++){
  for(var x = 0; x<total_step_x; x++){
    // console.log(x,y,xy2n(x,y))
    triangle_pos.push({'x':x,'y':y, 'polA':make_triangleA(x,y), 'polB':make_triangleB(x,y)})
  }
}
xxx = Array(0)
for(var y = 0; y<total_step_y; y++){
  for(var x = 0; x<total_step_x; x++){
    xxx.push(parseFloat(100+x*y)/(total_step_x*total_step_y))
  }
}

function update_colors(arr){
  arr.forEach((item_x, i) => {
    item_x.forEach((item_y, j) => {
      var colA = color_scale(item_y[0])
      var colB = color_scale(item_y[1])
      // console.log(item_y[1])
      var index = xy2n(i,j)
      triangle_pos[index]['polA'].attr("fill", colA);
      triangle_pos[index]['polB'].attr("fill", colB)
    });
  });

}
// update_colors(xxx)

docReady(function(){
  socket.emit('get_triangle', {})
})

socket.on( 'triangle_data', function( msg ) {
  console.log("Received plot configurations...")
  msg_json = JSON.parse(msg)
  update_colors(msg_json)
  // setTimeout(() => {  socket.emit('get_triangle', {}) }, 100);
  socket.emit('get_triangle', {})


});
