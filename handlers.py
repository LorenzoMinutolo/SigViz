import json
import os
import time
import numpy as np
from flask_socketio import emit
from SigViz import socketio, plot_config
from threading import Thread


# shared_var_manager = Manager()
# INFO = shared_var_manager.dict()
# INFO['running'] = True

def web_data_streamer(target_socketio, configurations):
    '''
    Thread that streams data to the plotting interface
    '''
    global INFO
    counter = 0
    update_len = configurations.update_len
    N_col = configurations.cols
    N_row = configurations.rows
    while True:#INFO['running']:
        print('generating..')
        data_x = [list(np.linspace(counter,counter+update_len-1,update_len)) for i in range(N_col*N_row)]
        data_y = [list(np.sin(np.pi * 0.017 * i * np.linspace(counter,counter+update_len-1,update_len))) for i in range(N_col*N_row)]
        colors = [i/float(N_col*N_row) for i in range(N_col*N_row)]
        print("sending..")
        target_socketio.emit('update_data',json.dumps({'data_x':data_x,'data_y':data_y,'colors':colors}))
        counter += update_len
        time.sleep(configurations.refresh_rate)


@socketio.on('start_streaming')
def tester(msg, methods=['GET', 'POST']):
    print("\t\t\treceived")
    socketio.emit('test')
    measures_handler = Thread(target = web_data_streamer, args = [socketio,plot_config])
    measures_handler.deamon = True
    measures_handler.start()
    measures_handler.join()

@socketio.on('request_config')
def request_config(msg):
    socketio.emit('config_plots',json.dumps({'cols':plot_config.rows,'rows':plot_config.cols}))
