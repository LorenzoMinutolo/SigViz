
var max_number_point = 10000;

// just initially
var n_cols=0;
var n_rows=0;
//var layout = {
//  grid: {rows: n_rows, columns: n_cols, pattern: 'independent'},
//};

const distinct = (value, index, self)=>{
  return self.indexOf(value) === index ;
}

// Given x and y of a plot (not a detector) position returns the data index
function xy2n(col, row){
  return col*n_cols + row;
}

function configure_plots_signal(signal_traces, plot_modes){

  //n_cols = (plot_modes.filter(distinct)).lenght
  console.log(signal_traces)
  n_plots = signal_traces.length
  if(n_plots < 4){
    n_cols = 1;
    n_rows = n_plots;
  }else{
    n_rows = parseInt(Math.ceil(Math.sqrt(n_plots)))
    n_cols = n_rows;
  }

  console.log("dims: "+n_rows+" from plotn: "+n_plots)
  //var plot_counter = Array.from(Array(n_plots).keys());
  data = []
  var plot_counter = Array(0);
  var trace_counter = 0
  for (var i = 0; i < n_cols; i++) { // Loop over cols
    for (var j = 0; j < n_rows; j++) { // Loop over rows
      for (var k = 0; k< signals[xy2n(i,j)][0].length; k++){ // Loop over detectors
        plot_counter.push(trace_counter);
        data.push({
          x: [],
          y: [],
          xaxis: 'x'+(i+1), // The axis binding only depends on plot coords, not detector
          yaxis: 'y'+(j+1),
          type: 'scattergl',
          mode: 'lines', // Fixed for now
          name: 'trace# '+ trace_counter,
          hoverinfo:'skip'
        });
        trace_counter += 1;
      }
    }
  }
  layout = {
    // grid: {rows: n_rows, columns: n_cols, pattern: 'coupled', xaxes: {fixedrange: true}, yaxes: {fixedrange: true}}, showlegend: false // REMOVED FOR NOW
    grid: {rows: n_rows, columns: n_cols} 
  }
  // plot_counter = Array.from(Array(n_plots).keys());
  Plotly.purge('plotter_div');
  Plotly.newPlot('plotter_div', data, layout, {staticPlot: true});
  return plot_counter;
}


//for now select_signal gives just one mode
// var select_signal={
// 'target':[[[1,2,3],[1,2,3],[1,0,1]], [[4,5,6],[1,2,3],[1,0,1]]],//'target':[[detcol],[detrow],[detpol]]]
// //'trace':['lines'], //Describe what's the plotting mode of the traces
// 'mode':[['ts'],['ts']]  //ts=timestream; ps=powerspectrum --> leave as ts for now
// }
var select_signal={
'target':signals,//'target':[[detcol],[detrow],[detpol]]]
'mode':kinds  //ts=timestream; ps=powerspectrum --> leave as ts for now
}

// socket.on('config_plots', function( msg ) {
//   console.log("Received plot configurations...")
//   msg_json = JSON.parse(msg)
//   plot_counter = configure_plots_signal(msg_json['cols'], msg_json['rows'], msg_json['traces'])
//   socket.emit('get_signal', select_signal)
//
// });


socket.on('detectors_data', function( msg ) {
  console.log("Updating...")
  msg_json = JSON.parse(msg)
  //console.log(msg_json)
  console.log("signal=", msg_json)
  console.log("update_map: ",plot_counter)
  Plotly.extendTraces('plotter_div', {
    y: msg_json['data_y'],
    x: msg_json['data_x']
  }, plot_counter, max_number_point)

  //Plotly.restyle('main_plot', {'marker.color': (msg_json['colors'].map(color_scale)).map(x => x.hex())}, plot_counter)
  socket.emit('get_signal', select_signal)

});


docReady(function(){
  plot_counter = configure_plots_signal(signals, kinds);
  // socket.emit('request_config', {})
  socket.emit('get_signal', select_signal)
});
