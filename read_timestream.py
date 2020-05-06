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
import ba150_ModuleMapping_fake as ba2map


class read_mcerun_ts(object):
    '''
    Read a signal from MCE run file
    '''

    def __init__(self):

        self.Nrows = 33
        self.Ncols = 32
        self.samplingrate=0.5*420.87# 2*210.0 #Hz this can be 210 or 420 ... you must know before hand
        self.dt = 1.0/self.samplingrate
        self.counter=0


    #returns full mce frame
    #timestreams = get_time_streams('pathtodata')
    def get_time_streams(self, timestreamfile):
        f = mce_data.MCEFile(timestreamfile)
        y = f.Read(row_col=True,unfilter='DC').data
        return y

    def convert_pol(self, pol):
        if pol=='A':
            return 0
        elif pol=='B':
            return 1
        else:
            raise ValueError('Polarization not defined.')

    #return single timestream of an MCE frame given row,col
    def return_singlets(self, mce_tensor, row, col, Nsamples=0):
        if Nsamples==0:
            Nsamples=len(mce_tensor[int(row), int(col)])
        print('Read time-stream for row,col=', row, col)
        Nt = Nsamples*self.dt
        t = np.arange(0, Nt, self.dt)
        s = mce_tensor[int(row), int(col)]
        return t,s

    def return_triangletensor(self, inpath, Nsamples=50):
        act_cols=self.locate_active_cols(inpath)
        timestreams = self.get_time_streams(inpath)
        mce_tensor = timestreams[:,:,self.counter*Nsamples:(self.counter+1)*Nsamples]
        Nt = Nsamples*self.dt
        t=np.arange(0, Nt, self.dt)
        mask=np.full((self.Nrows, self.Ncols, Nsamples), 1)
        mask[:,act_cols,:]=0
        mce_tensor_masked = ma.masked_array(mce_tensor, mask=mask)

        #to return aux data
        # f = mce_data.MCEFile(inpath)
        # data = f.Read(row_col=True, unfilter='DC', all_headers=True)
        # aux_channel = [h['aux_channel'] for h in data.headers]

        det_tensor=np.zeros((18, 18, 2, Nsamples))

        for i in range (self.Nrows):
            for j in range (self.Ncols):
                im,detcol,detrow,detpol=ba2map.mce2det(j,i)
                #print(detcol,detrow,detpol)
                det_tensor[detrow, detcol, self.convert_pol(detpol), :]= mce_tensor_masked[i,j,:]
        self.counter=self.counter+1

        #mce_tensor_masked is returned temporarily just for testing purposes
        #det_tensor is the one that is going to be passed to DSP
        return mce_tensor_masked, det_tensor


    def locate_active_cols(self, inpath):
        conf_file=inpath+'.run'
        file_variable = open(conf_file)
        all_lines_variable = file_variable.readlines()
        tesbias_line=all_lines_variable[591-1]
        tesbias_values_rd = np.array(tesbias_line[14:].split())
        tesbias_values=tesbias_values_rd.astype(np.float)
        active_cols=np.where(tesbias_values != 0.)
        return active_cols[0]
