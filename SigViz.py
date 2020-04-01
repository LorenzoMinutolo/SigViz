from flask import Flask, flash, redirect, render_template, request, session, abort
from flask_socketio import SocketIO, emit
from DSP import DSP

SECRET_KEY = 'A9Zr348j/3dX R~XHH!1mN]LWX/,?RT'

app = Flask(__name__)
app.secret_key =SECRET_KEY

socketio = SocketIO(app, async_mode='threading')

class plot_configuration(object):
    def __init__(self, rows, cols, update_len, refresh_rate):
        self.rows = rows
        self.cols = cols
        self.update_len = update_len
        self.refresh_rate = refresh_rate

main_signal=DSP(32,32,1000)
plot_config = plot_configuration(5, 5, 10, 0.1)

from routes import *

from handlers import *

if __name__ == "__main__":
    print("Starting SigViz...")

    socketio.run(app, host= '0.0.0.0', port = "5000")
    # app.run(host='0.0.0.0', port=53000)
