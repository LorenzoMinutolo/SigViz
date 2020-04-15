
var max_number_point = 10000

//var layout = {
//  grid: {rows: n_rows, columns: n_cols, pattern: 'independent'},
//};

function configure_plots_signal(c, r, traces){
  n_cols = parseInt(c)
  n_rows = parseInt(r)
  n_plots = n_cols * n_rows
  //var plot_counter = Array.from(Array(n_plots).keys());
  console.log(n_plots,n_cols,n_rows)
  data = []



  for (var i = 0; i < n_cols; i++) {
    for (var j = 0; j < n_rows; j++) {
      // console.log("Adding plot with trace: "+traces[i*n_cols +j])
      data.push({
        x: [],
        y: [],
        xaxis: 'x'+(i+1),
        yaxis: 'y'+(j+1),
        type: 'scattergl', //pointcloud could be better
        mode: 'lines',//traces[i*n_cols +j],
        hoverinfo:'skip'
      });
    }
  }
  layout = {
  grid: {rows: n_rows, columns: n_cols, pattern: 'coupled', xaxes: {fixedrange: true}, yaxes: {fixedrange: true}},
  showlegend: false,
  }
  plot_counter = Array.from(Array(n_plots).keys());
  Plotly.purge('plotter_div');
  Plotly.newPlot('plotter_div', data, layout, {staticPlot: true});
  return plot_counter;
}


//for now select_signal gives just one mode
var select_signal={
'target':[[1,2,3,4,5,6,7,8,9,10],[1,2,3,4,5,6,7,8,9,10],[1,0,1,1,1,1,0,1,1,1]], //'target':[[detcol],[detrow],[detpol]]]
// 'trace':['markers','markers','markers','lines'], //Describe what's the plotting mode of the traces
'mode':['ts']  //ts=timestream; ps=powerspectrum --> leave as ts for now
}



socket.on( 'config_plots', function( msg ) {
  console.log("Received plot configurations...")
  msg_json = JSON.parse(msg)
  plot_counter = configure_plots_signal(msg_json['cols'], msg_json['rows'], msg_json['traces'])
  socket.emit('get_signal', select_signal)

});


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


docReady(
  socket.emit('request_config', {})
);
