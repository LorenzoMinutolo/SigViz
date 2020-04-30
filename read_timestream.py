import matplotlib.pyplot as plt
import scipy.io as sio
import scipy as scipy
import numpy as np
import math
import sys, os
import os.path
import pylab as pl
import mce_data
import re
import numpy.ma as ma


class read_mcerun_ts(object):
    '''
    Read a signal from MCE run file
    '''

    def __init__(self):

        self.Nrows = 33
        self.Ncols = 32
        self.samplingrate=0.5*420.87# 2*210.0 #Hz this can be 210 or 420 ... you must know before hand
        self.dt = 1.0/self.samplingrate

    #returns full mce frame
    #timestreams = get_time_streams('pathtodata')
    def get_time_streams(self, timestreamfile):
        f = mce_data.MCEFile(timestreamfile)
        y = f.Read(row_col=True,unfilter='DC').data
        return y

    #return single timestream of an MCE frame given row,col
    def return_singlets(self, mce_tensor, row, col, Nsamples=len(mce_tensor[int(row), int(col)])):
        print('Read time-stream for row,col=', row, col)
        Nt = Nsamples*self.dt
        t = np.arange(0, Nt, self.dt)
        s = mce_tensor[int(row), int(col)]
        return t,s

    def return_triangletensor(self, inpath, Nsamples=50):
        act_cols=self.locate_active_cols(inpath)
        timestreams = self.get_time_streams(inpath)
        mce_tensor = timestreams[:,:,0:Nsamples]
        Nt = Nsamples*self.dt
        t=np.arange(0, Nt, self.dt)
        mask=np.full((self.Nrows, self.Ncols, Nsamples), 1)
        mask[:,act_cols,:]=0
        mce_tensor_masked = ma.masked_array(mce_tensor, mask=mask)

        #to return aux data
        # f = mce_data.MCEFile(inpath)
        # data = f.Read(row_col=True, unfilter='DC', all_headers=True)
        # aux_channel = [h['aux_channel'] for h in data.headers]

        return mce_tensor_masked



    def locate_active_cols(self, inpath):
        conf_file=inpath+'.run'
        file_variable = open(conf_file)
        all_lines_variable = file_variable.readlines()
        tesbias_line=all_lines_variable[591-1]
        tesbias_values_rd = np.array(tesbias_line[14:].split())
        tesbias_values=tesbias_values_rd.astype(np.float)
        active_cols=np.where(tesbias_values != 0.)
        return active_cols[0]
