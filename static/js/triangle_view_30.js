// Box dimensions
var total_height = 1000.;
var total_width = 1000.;

var total_step_x = 4.;
var total_step_y = 4.;

var border_size = 10
// index to triangle 2d index
var triangle_pos = Array(0)
var triangle_size_x = (total_width - total_step_x*border_size)/total_step_x;
var triangle_size_y = (total_height - total_step_y*border_size)/total_step_y

var triangle_step_x = (total_width)/total_step_x;
var triangle_step_y = (total_height)/total_step_y

var selected_triangle = Array(0);
var selected_signal = Array(0);

var triangle_sig_mode = "data" //mode=0 for Bias; mode=else for signal

var plot_mode = "ts" // To get the radio button mode plot select modal

// docReady(
  $('#plotter-btn').prop("onclick", null).off("click");
  $('#plotter-btn').click(function() {
       // $("#modal_plot_select")
       $("#modal_plot_launch").modal('show')
  });
// );

// in the form of {
//   "entity": timestream fft average std and so on,
//   "target": [{'x':n,'y'n}]
// }

// Function to change the plotting modes of triangles.
// For now only bias and other are contemplated: there is distinction between the various data fcns
function switch_triangle_mode_data(){
  console.log("Switching to triangle mode: DATA")
  triangle_sig_mode = "data"
}
function switch_triangle_mode_bias(){
  console.log("Switching to triangle mode: BIAS")
  triangle_sig_mode = "bias"
}

function update_sig_table(){
  tmp_string = ""
  for(var i = 0; i < selected_signal.length; i++){
    tmp_string+= "<tr><td>"+i+"</td><td>"+selected_signal[i]["kind"]+"</td><td>"+selected_signal[i]["detectors"]+"</td></tr>"
  }
  $('#signal_selector_confirm_body').html(tmp_string);
}

function add_signal(){
  var kind = $('input[name=mode_sel]:checked').val()
  var signals = ""
  for(var i = 0; i < selected_triangle.length; i++){
    signals+= selected_triangle[i] + " ";
  }
  selected_signal.push(
    {
      'kind':kind,
      'detectors':signals
    }
  )
  update_sig_table()
  reset_selection()
  $("#plotter-btn").html("Plotter ("+selected_signal.length+")")
}

function reset_all_signals(){
  selected_signal = Array(0);
  $("#plotter-btn").html("Plotter (0)");
  $('#signal_selector_confirm_body').html("");
}

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

function select_row(x,y,pol){
  for(var i = 0; i<total_step_x; i++){
      var det = triangle_pos[xy2n(i,y)][pol]
      selected_triangle.push(triangle_xy2string(i,y,pol));
      det.raise();
      det.attr("stroke", "black");
    }
}

function select_col(x,y,pol){
  for(var i = 0; i<total_step_y; i++){
      var det = triangle_pos[xy2n(x,i)][pol]
      selected_triangle.push(triangle_xy2string(x,i,pol));
      det.raise();
      det.attr("stroke", "black");
  }
}

function reset_selection(){
    for(var i = 0; i<total_step_x; i++){
      for(var j = 0; j<total_step_x; j++){
        var det = triangle_pos[xy2n(i,j)]["A"]
        det.lower();
        det.attr("stroke", "white");
        var det = triangle_pos[xy2n(i,j)]["B"]
        det.lower();
        det.attr("stroke", "white");
      }
    }
    selected_triangle = Array(0);
}

function make_triangleA(x,y){
  var t_name = triangle_xy2string(x,y,"A");
  var menu = [
  	{
  		title: 'Add signal...',
  		action: function(d, i) {$("#modal_plot_select").modal('show')}
  	},
  	{
  		title: 'Select row '+y+' pol A',
  		action: function(d, i) {select_row(x,y,"A")}
  	},
    {
  		title: 'Select col '+x+' pol A',
  		action: function(d, i) {select_col(x,y,"A")}
  	},
    {
  		title: 'Reset selection',
  		action: function(d, i) {reset_selection()}
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
          if(!selected_triangle.includes(t_name)){
            selected_triangle.push(t_name);
          }
          polA.attr("stroke", "black");
				}
  }));
  return polA
}
function make_triangleB(x,y){
  var menu = [
    {
      title: 'Add signal...',
      action: function(d, i) {$("#modal_plot_select").modal('show')}
    },
    {
      title: 'Select row '+y+' pol B',
      action: function(d, i) {select_row(x,y,"B")}
    },
    {
      title: 'Select col '+x+' pol B',
      action: function(d, i) {select_col(x,y,"B")}
    },
    {
      title: 'Reset selection',
      action: function(d, i) {reset_selection()}
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
          if(!selected_triangle.includes(t_name)){
            selected_triangle.push(t_name);
          }
          polB.attr("stroke", "black");
				}
  }));
  return polB
}


socket.on( 'triangle_config', function( msg ) {
  msg_json = JSON.parse(msg)
  total_step_x = parseInt(msg_json.ncols);
  total_step_y = parseInt(msg_json.nrows);
  triangle_size_x = (total_width - total_step_x*border_size)/total_step_x;
  triangle_size_y = (total_height - total_step_y*border_size)/total_step_y;
  triangle_step_x = (total_width)/total_step_x;
  triangle_step_y = (total_height)/total_step_y;
  for(var y = 0; y<total_step_y; y++){
    for(var x = 0; x<total_step_x; x++){
      // console.log(x,y,xy2n(x,y))
      triangle_pos.push({'x':x,'y':y, 'A':make_triangleA(x,y), 'B':make_triangleB(x,y)})
    }
  }
  console.log("triangle config")
  socket.emit('get_triangle', {'triangle_sig_mode': triangle_sig_mode})
});

function update_colors(arr){
  arr.forEach((item_x, i) => {
    item_x.forEach((item_y, j) => {
      var colA = color_scale(item_y[0])
      var colB = color_scale(item_y[1])
      // console.log(item_y[1])
      var index = xy2n(i,j)
      triangle_pos[index]['A'].attr("fill", colA);
      triangle_pos[index]['B'].attr("fill", colB)
    });
  });

}

docReady(function(){
  socket.emit('get_triangle_config', {})
  // socket.emit('get_triangle', {'triangle_sig_mode': triangle_sig_mode})
})
var start_cycle = true;
socket.on( 'triangle_data_respone', function( msg ) {
  console.log("Received plot configurations...")
  msg_json = JSON.parse(msg)
  update_colors(msg_json)
  // setTimeout(() => {  socket.emit('get_triangle', {}) }, 100);
  // setTimeout(function() { your_func(); }, 5000);
  // socket.emit('get_triangle', {'triangle_sig_mode': triangle_sig_mode})
  if(start_cycle){
    start_cycle = false;
    console.log("starting cycle...")
    window.setInterval(function(){
      socket.emit('get_triangle', {'triangle_sig_mode': triangle_sig_mode})
    }, 200);
  }

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


function set_plotting_mode_ts(){
  $("#mode_descriptor").html("<b>Plotting mode description: </b> Each selected detector timestream will be dispayed as a trace in the plot.")
  plot_mode = "ts"
}

function set_plotting_mode_ats(){
  $("#mode_descriptor").html("<b>Plotting mode description: </b> All selected detercor's timestream will be averaged in a single trace in the plot")
  plot_mode = "ats"
}

function set_plotting_mode_ps(){
  $("#mode_descriptor").html("<b>Plotting mode description: </b> Each detector timestream power spectra will be dispayed as a trace in the plot.")
  plot_mode = "ps"
}

function set_plotting_mode_aps(){
  $("#mode_descriptor").html("<b>Plotting mode description: </b> All selected detercor's timestream power spectra will be averaged in a single trace in the plot.")
  plot_mode = "aps"
}

function set_plotting_mode_pd(){
  $("#mode_descriptor").html("<b>Plotting mode description: </b> Each trace in the plot will be the difference of two polarization timestrams per each selected detector pair.")
  plot_mode = "pd"
}

function set_plotting_mode_apd(){
  $("#mode_descriptor").html("<b>Plotting mode description: </b> All selected detercor's pair difference timestream will be averaged in a single trace in the plot")
  plot_mode = "apd"
}

function set_plotting_mode_pds(){
  $("#mode_descriptor").html("<b>Plotting mode description: </b> Each trace in the plot will be the power spectrum of the difference of two polarization timestrams per each selected detector pair.")
  plot_mode = "pds"
}
