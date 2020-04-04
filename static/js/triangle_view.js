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

var selected_triangle = Array(0);

// var color_scale = chroma.scale(['black','red','blue','yellow']);
var color_scale = chroma.scale(['yellow', '008ae5']);

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};


// var menu = contextMenu().items('Add signals...', 'Select row', 'Select col', 'Reset selection');

function set_viridis_colorscale(){
  color_scale = chroma.scale(['yellow', '008ae5']);
}

function set_jet_colorscale(){
  color_scale = chroma.scale(['black', 'red', 'yellow']);
}

function set_bw_colorscale(){
  color_scale = chroma.scale(['black', 'white']);
}

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

function triangle_xy2string(x, y, pol){
  return x+'_'+y+'_'+pol
}
function triangle_string2xy(str){
  var xx =  str.split("_")
  return {'x':xx[0],'y':xx[1],'pol':xx[2]}
}

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
function xy2n(x,y){
  return x + (total_step_y)*y;
}
function format_tooltip(x,y,pol){
  return "<b>row::</b> " + y + "<br><b>col:</b> " + x + "<br> <b>pol:</b> : "+pol
}
function make_triangleA(x,y){
  var t_name = triangle_xy2string(x,y,"A");
  var menu = [
  	{
  		title: 'Add signal...',
  		action: function() {
  		}
  	},
  	{
  		title: 'Select row '+y,
  		action: function() {
  		}
  	},
    {
  		title: 'Select col '+x,
  		action: function() {
  		}
  	},
    {
  		title: 'Reset selection',
  		action: function() {
  		}
  	}
  ]
  var polA = svgContainer.append("path")
        // .attr("d", " M 10 25 L 10 75 L 60 75 L 10 25")
        .attr("d", make_triangle_position_polA(0, 0))
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("fill", "black")
        .attr("transform", make_tanslate(x, y))
        polA.on("mouseover", function(){
          tooltip.html(format_tooltip(x,y,"A"));
          polA.raise();
          polA.attr("stroke", "red");
          return tooltip.style("visibility", "visible");
        })
        polA.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX-200)+"px");})
        polA.on("mouseout", function(){
          if(selected_triangle.includes(t_name)){
            polA.raise();
            polA.attr("stroke", "black");
          }else{
            polA.lower();
            polA.attr("stroke", "white");
          }
          return tooltip.style("visibility", "hidden");
        })

  polA.on("click", function(){
    // console.log(selected_triangle);
    if(selected_triangle.includes(t_name)){
      polA.lower();
      selected_triangle.remove(t_name);
      return polA.attr("stroke", "white");

    }else{
      polA.raise();
      selected_triangle.push(t_name);
      return polA.attr("stroke", "black");
    }
    // svgContainer.selectAll("path")
    //   .attr("stroke", "white")
    //   .lower()


    // selected_tile = Array(0);
    // selected_tile.push(rect.attr("id"))

  })
  polA.on('contextmenu', d3.contextMenu(menu,{
    onOpen: function (data, index) {
          polA.raise();
          selected_triangle.push(t_name);
          polA.attr("stroke", "black");
				}
  }));
  return polA
}
function make_triangleB(x,y){
  var menu = [
    {
      title: 'Add signal...',
      action: function() {
      }
    },
    {
      title: 'Select row '+y,
      action: function() {
      }
    },
    {
      title: 'Select col '+x,
      action: function() {
      }
    },
    {
      title: 'Reset selection',
      action: function() {
      }
    }
  ]
  var t_name = triangle_xy2string(x,y,"B");
  var polB = svgContainer.append("path")
        // .attr("d", " M 10 25 L 10 75 L 60 75 L 10 25")
        .attr("d", make_triangle_position_polB(0, 0))
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("fill", "green")
        .attr("transform", make_tanslate(x, y))

  polB.on("mouseover", function(){
    polB.raise();
    polB.attr("stroke", "red");
    tooltip.html(format_tooltip(x,y,"B"));
    return tooltip.style("visibility", "visible");
  })
  polB.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX-200)+"px");})
  polB.on("mouseout", function(){
    if(selected_triangle.includes(t_name)){
      polB.raise();
      polB.attr("stroke", "black");
    }else{
      polB.lower();
      polB.attr("stroke", "white");
    }
    return tooltip.style("visibility", "hidden");
  })

  polB.on("click", function(){
    // console.log(selected_triangle);
    if(selected_triangle.includes(t_name)){
      polB.lower();
      selected_triangle.remove(t_name);
      return polB.attr("stroke", "white");
    }else{
      polB.raise();
      selected_triangle.push(t_name);
      return polB.attr("stroke", "black");
    }
  })
  polB.on('contextmenu', d3.contextMenu(menu,{
    onOpen: function (data, index) {
          polB.raise();
          selected_triangle.push(t_name);
          polB.attr("stroke", "black");
				}
  }));
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

var tooltip = d3.select("div#triangle_viewer")
	.append("div")
	.style("position", "absolute")
	.style("z-index", "10")
  .style("border-style", "solid")
  .style("background-color", "white")
  .style("padding", "10px")
  .style("opacity", "0.8")
	.style("visibility", "hidden")
