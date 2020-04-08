from flask import Flask, flash, redirect, render_template, request, session, abort
from SigViz import app

@app.route("/",  methods=['GET', 'POST'])
def index():
    return render_template('test.html', name = "SigViz")


@app.route("/plotter",  methods=['GET', 'POST'])
def plotter():
    plot_x=3
    plot_y=3
    return render_template('plotter.html', name = "Plotter", plot_x=plot_x, plot_y=plot_y)

@app.route("/triangle_view",  methods=['GET', 'POST'])
@app.route("/triangle_view/<num>",  methods=['GET', 'POST'])
def triangle_view(num=None):
    try:
        tile_number = int(num)
    except:
        msg = "Cannot read tile number"
        return render_template('error.html', name = "Error", msg = msg)

    return render_template('triangle_view.html', name = "Triangle view", tile_number = tile_number)
