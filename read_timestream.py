import matplotlib.pyplot as plt
import scipy.io as sio
import scipy as scipy
import numpy as np
import math
import sys, os
import os.path
import pylab as pl
import mce_data



#timestreams = get_time_streams('pathtodata')
def get_time_streams(timestreamfile):
        f = mce_data.MCEFile(timestreamfile)
        y = f.Read(row_col=True,unfilter='DC').data

        return y

#t1,s1=return_ts('/data/cryo/20190711/RF_test_7', row, col)
def return_ts(inpath, row, col):

        outpath = ''
        #if not os.path.isdir(outpath):
        #       os.makedirs(outpath)
        timestreams = get_time_streams(inpath)
        print('Read time-stream')
        samplingrate =0.5*420.87# 2*210.0 #Hz this can be 210 or 420 ... you must know before hand
        dt = 1.0/samplingrate
        Nt = len(timestreams[int(row), int(col)])*dt
        print('dt [s]','Total time [s]: ')
        #print(dt,Nt)
        t = np.arange(0, Nt, dt)
        s = timestreams[int(row), int(col)]
        f = mce_data.MCEFile(inpath)
        data = f.Read(row_col=True, unfilter='DC', all_headers=False)
        aux_channel = [h['aux_channel'] for h in data.headers]
        s=s-np.mean(s)

        return t,s
