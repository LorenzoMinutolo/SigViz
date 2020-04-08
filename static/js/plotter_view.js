
var n_cols = 2
var n_rows = 2
var n_plots = n_cols * n_rows
var max_number_point = 50
var plot_counter = Array.from(Array(n_plots).keys());


//var data_trial = [trace1, trace2, trace3, trace4];

var layout = {
  grid: {rows: n_rows, columns: n_cols, pattern: 'independent'},
};

//var test_data = {
//  'data_x':[[1,2,3,4],[1,2,3,4],[1,2,3,4],[1,2,3,4]],
//  'data_y':[[1,2,3,4],[1,2,3,4],[1,2,3,4],[1,2,3,4]]
//}


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


//var sig = main_signal.get_signal([10,11,12,13],[11,12,13,14],[0,1,1,0])
//Plotly.newPlot('plotter_div', data_trial, layout);
//for now select_signal gives just one mode
var select_signal={
'target':[[1,2,3],[0,1,2],[1,0,1]]] //'target':[[detcol],[detrow],[detpol]]]
'mode':['ts']  //ts=timestream
}


configure_plots_signal(n_cols, n_rows, 1);

docReady(
  socket.emit('get_signal', select_signal)
);

socket.on('detectors_data', function( msg ) {
  console.log("Updating...")
  msg_json = JSON.parse(msg)
  //console.log(msg_json)
  Plotly.extendTraces('plotter_div', {
    y: msg_json['data_y'],
    x: msg_json['data_x']
  }, plot_counter, max_number_point)
  //Plotly.restyle('main_plot', {'marker.color': (msg_json['colors'].map(color_scale)).map(x => x.hex())}, plot_counter)
  socket.emit('get_signal', select_signal)
});
