from flask import Flask, flash, redirect, render_template, request, session, abort
from SigViz import app

@app.route("/",  methods=['GET', 'POST'])
def index():
    return render_template('test.html', name = "SigViz")


def interptet_plotrequest(string):
    '''
    Convert string request plot into actual info.
    '''
    splitted = string.split("%")
    plot_num = splitted[0]
    kinds = []
    signals = []
    for i in range(1,len(splitted)):
        double_splitted = splitted[i].split("-")
        kind = double_splitted[0]
        cols = []
        rows = []
        pols = []
        for j in range(1,len(double_splitted)):
            if len(double_splitted[j].split("_")) == 3:
                cols.append( int(double_splitted[j].split("_")[0]) )
                rows.append( int(double_splitted[j].split("_")[1]) )
                pols.append( double_splitted[j].split("_")[2] )
        signals.append([cols, rows, pols])
        kinds.append(kind)

    return signals, kinds, plot_num

@app.route("/plotter",  methods=['GET', 'POST'])
@app.route("/plotter/<stringdef>",  methods=['GET', 'POST'])
def plotter(stringdef = None):
    # try:
    signals, kinds, plot_num = interptet_plotrequest(stringdef)
    print(signals)
    return render_template('plotter.html', name = "Plotter",
        plot_num = plot_num,
        kinds = kinds,
        signals = signals
    )
    # except:
    #     return render_template('error.html', name = "Error", msg = "Please use triangle view to define plot target")




@app.route("/triangle_view",  methods=['GET', 'POST'])
@app.route("/triangle_view/<num>",  methods=['GET', 'POST'])
def triangle_view(num=None):
    try:
        tile_number = int(num)
    except:
        msg = "Cannot read tile number"
        return render_template('error.html', name = "Error", msg = msg)

    return render_template('triangle_view.html', name = "Triangle view", tile_number = tile_number)
