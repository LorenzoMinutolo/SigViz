var socket = io.connect('http://' + document.domain + ':' + location.port);

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

var n_cols = 2
var n_rows = 2
var n_plots = n_cols * n_rows

var update_len = 20
var max_number_point = 50

var color_scale = chroma.scale(['black', 'red']);
var tmp_counter = 0
var data = []

var grid_signal = 1

var layout = {
  grid: {rows: n_rows, columns: n_cols, pattern: 'independent'},
};
var plot_counter = Array.from(Array(n_plots).keys());


function counter(y){
  return Array.from(Array(update_len).keys()).map(function(x) { return (x + y)/200.; });
}


function configure_plots_signal(c, r, grid){
  n_cols = parseInt(c)
  n_rows = parseInt(r)
  n_plots = n_cols * n_rows
  console.log(n_plots,n_cols,n_rows)
  data = []

  if(grid){
    for (var i = 0; i < n_cols; i++) {
      for (var j = 0; j < n_rows; j++) {
        data.push({
          x: [],
          y: [],
          xaxis: 'x'+(j+1),
          yaxis: 'y'+(i+1),
          type: 'scattergl', //pointcloud could be better
          hoverinfo:'skip'
        });
      }
    }
    layout = {
      grid: {rows: n_rows, columns: n_cols, pattern: 'coupled', xaxes: {fixedrange: true}, yaxes: {fixedrange: true}},
      showlegend: false,

    };
 }else{
   for (var i = 0; i < n_cols; i++) {
     for (var j = 0; j < n_rows; j++) {
       data.push({
         x: [],
         y: [],
         type: 'scattergl',
         hoverinfo:'skip'
       });
     }
   }
   layout = {};
 }
  plot_counter = Array.from(Array(n_plots).keys());
  Plotly.purge('main_plot');
  Plotly.newPlot('main_plot', data, layout, {staticPlot: true});
}


socket.on( 'test', function( msg ) {
  console.log("Received test...")

});

socket.on( 'config_plots', function( msg ) {
  console.log("Received plot configurations...")
  msg_json = JSON.parse(msg)
  configure_plots_signal(msg_json['cols'], msg_json['rows'], grid_signal)
  socket.emit('start_streaming', {})

});

socket.on( 'update_data', function( msg ) {
  console.log("Updating...")
  var t0 = performance.now();
  msg_json = JSON.parse(msg)
  //console.log(msg_json)
  Plotly.extendTraces('main_plot', {
    y: msg_json['data_y'],
    x: msg_json['data_x']
  }, plot_counter, max_number_point)
  //Plotly.restyle('main_plot', {'marker.color': (msg_json['colors'].map(color_scale)).map(x => x.hex())}, plot_counter)

  var t1 = performance.now();
  console.log("Call to update_data took " + (t1 - t0) + " milliseconds.");

});

docReady(
  socket.emit('request_config', {})
);
