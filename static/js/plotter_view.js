var window_UUID = makeid(50);

// $(document).ready(function(){
    var usocket = io.connect('http://' + document.domain + ':' + location.port + "/" + window_UUID);
    usocket.on('my response', function(msg) {
        $('#log').append('<p>Received: ' + msg.data + '</p>');
    });
    $('form#emit').submit(function(event) {
        usocket.emit('my event', {data: $('#emit_data').val()});
        return false;
    });
    $('form#broadcast').submit(function(event) {
        usocket.emit('my broadcast event', {data: $('#broadcast_data').val()});
        return false;
    });
// });

// orrible, orrible js...
Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

var max_number_point = 1000;

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
  var subplot_title = Array(0);
  for (var i = 0; i < n_cols; i++) { // Loop over cols
    for (var j = 0; j < n_rows; j++) { // Loop over rows
      console.log(xy2n(i,j));
      console.log(plot_modes[xy2n(i,j)]);
      subplot_title.push(plot_modes[xy2n(i,j)])
      if(xy2n(i,j)<signals.length){
          for (var k = 0; k< signals[xy2n(i,j)][0].length; k++){ // Loop over detectors

          plot_counter.push(trace_counter);
          data.push({
            x: [],
            y: [],
            xaxis: 'x'+(i+1), // The axis binding only depends on plot coords, not detector
            yaxis: 'y'+(j+1),
            type: 'scattergl',
            mode: 'lines', // Fixed for now
            name: 'col '+ signals[xy2n(i,j)][0][k] + " row "+signals[xy2n(i,j)][1][k]+" pol " + signals[xy2n(i,j)][2][k],
            hoverinfo:'skip'
          });
          trace_counter += 1;
        }
      }
    }
  }
  layout = {
    // grid: {rows: n_rows, columns: n_cols, pattern: 'coupled', xaxes: {fixedrange: true}, yaxes: {fixedrange: true}}, showlegend: false // REMOVED FOR NOW
    grid: {rows: n_rows, columns: n_cols, pattern: 'indepenent'}

  };

  // plot_counter = Array.from(Array(n_plots).keys());
  Plotly.purge('plotter_div');
  Plotly.newPlot('plotter_div', data, layout, {staticPlot: true});

  for (var i = 0; i < n_cols; i++) { // Loop over cols
    for (var j = 0; j < n_rows; j++) { // Loop over rows
      if(i==0){col='';}else{col=String(i+1);}
      if(j==0){row='';}else{row=String(j+1);}

      // if (plot_modes[xy2n(i,j)]=='ts'){
        var titlex='sample#';
        var titley='Amplitude'
      // }
      console.log("col: "+col+ " row: "+row)
      Plotly.relayout('plotter_div',
        {
          ['xaxis'+col]: {
            title: titlex
          },
          ['yaxis'+row]: {
            title: titley
          }
      }
      );

    }
  }
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
'mode':kinds,  //ts=timestream; ps=powerspectrum --> leave as ts for now
'window_UUID':window_UUID, //for multiple plotting windows
'last_time':0 // Correct multiwindowed update
}

// socket.on('config_plots', function( msg ) {
//   console.log("Received plot configurations...")
//   msg_json = JSON.parse(msg)
//   plot_counter = configure_plots_signal(msg_json['cols'], msg_json['rows'], msg_json['traces'])
//   socket.emit('get_signal', select_signal)
//
// });


usocket.on('detectors_data', function( msg ) {
  console.log("Updating...")
  msg_json = JSON.parse(msg)
  // console.log(msg_json)
  // console.log("signal=", msg_json)
  // console.log("update_map: ",plot_counter)
  Plotly.extendTraces('plotter_div', {
    y: msg_json['data_y'],
    x: msg_json['data_x']
  }, plot_counter, max_number_point)
  console.log(msg_json['data_x'][0])
  select_signal['last_time'] = msg_json['data_x'][0].max()
  //Plotly.restyle('main_plot', {'marker.color': (msg_json['colors'].map(color_scale)).map(x => x.hex())}, plot_counter)
  socket.emit('get_signal', select_signal)

});


docReady(function(){
  plot_counter = configure_plots_signal(signals, kinds);
  // socket.emit('request_config', {})
  socket.emit('get_signal', select_signal)
});
