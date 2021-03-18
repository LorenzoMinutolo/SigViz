from flask import Flask, flash, redirect, render_template, request, session, abort
from flask_socketio import SocketIO, emit
from DSP import DSP
import logging
import sys

SECRET_KEY = 'A9Zr348j/3dX R~XHH!1mN]LWX/,?RT'

app = Flask(__name__)
app.secret_key =SECRET_KEY

# Disable websocket server logs
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)



socketio = SocketIO(app, async_mode='threading', logger = False)
class plot_configuration(object):
    def __init__(self, rows, cols, update_len, refresh_rate):
        self.rows = rows
        self.cols = cols
        self.update_len = update_len
        self.refresh_rate = refresh_rate
        self.traces = ['markers' for i in range(self.rows*self.cols)]

        # just for example
        self.traces[0] = 'lines'

        #set square size
    def configtosize():
        config=sys.argv[1]
        if config=='30':
            s=4
        elif config=='40':
            s=5
        elif config=='150':
            s=18
        else:
            print('Insert config.\nAvailable configs:\n30\n40\n150')
        return s




size=plot_configuration.configtosize()

main_signal=DSP(size, size, 10000)
plot_config = plot_configuration(3, 2, 10, 0.1)


from routes import *

from handlers import *

if __name__ == "__main__":
    print("Starting SigViz...")

    socketio.run(app, host= '0.0.0.0', port = "5000")
    # app.run(host='0.0.0.0', port=53000)
