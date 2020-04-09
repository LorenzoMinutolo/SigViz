import numpy as np
import ba40_ModuleMapping as bamm
import matplotlib.pyplot as pl
import random
import read_timestream as rt
import time

class DSP(object):
    '''
    DO DPS operation and eventually simulate signal
    '''

    def __init__(self, NX, NY, inner_length):
        '''
        Initialization.

        Parameters:
            - NX: Number of detectors along the X axe
            - NY: Number of detectors along the X axe
        '''
        self.Nx = NX
        self.Ny = NY
        self.signal = np.zeros((self.Nx, self.Ny, 2, inner_length))

        #Glitch simulator
        self.deleteme_counter = 0
        self.deleteme_flag = True
        self.deleteme_glitch_pos = np.random.randint(0,32, size=4)

        self.dummycounter=0
        #print(self.signal)

    def get_triangle(self, f_low, f_high, lenght, rand=True):
        '''
        Return NX x NY x 2 tensor in 0 - 1 interval
        '''
        datapath = '/Users/sofi/Desktop/SigViz/BA1_data/20191015/Conf_1_Biascan_lightdark_Sine_Vpp_1.0_Voffset_0.0_V_Freq_0.5_Hz_trial_2_bias1'
        if rand:
            self.gen_signal(lenght)
        else:
            self.read_mce_signal(lenght, datapath)

        signal_FT = np.fft.rfft(self.signal, axis = 3)
        # [pl.plot(signal_FT[i,0,0]) for i in range(5)]
        # pl.show()
        power_spect=np.sum((np.abs(signal_FT)[:,:,:,f_low:f_high]**2), axis=3)

        #Normalize?
        power_spect /= np.max(power_spect)

        #shake up some rows
        power_spect[:,17:21,:] += .4


        self.deleteme_counter+=1

        if self.deleteme_counter%100 < 92:
            if self.deleteme_flag:
                self.deleteme_glitch_pos = np.random.randint(0,32, size=4)
                self.deleteme_flag = False
            # print("Glitch at %d, %d - %d, %d" % (self.deleteme_glitch_pos[0],self.deleteme_glitch_pos[1],self.deleteme_glitch_pos[2],self.deleteme_glitch_pos[3]))
            power_spect[self.deleteme_glitch_pos[0]:self.deleteme_glitch_pos[0]+6,self.deleteme_glitch_pos[2]:self.deleteme_glitch_pos[2]+3,:] += 0.45

        else:
            self.deleteme_flag = True


        #break a bunch of cols
        power_spect[7:9,:]*=0
        power_spect[12:13,:]*=0

        # print(np.shape(power_spect))
        return power_spect

    def get_signal(self, one_target, samples):
        data_x=[]
        data_y=[]
        detcol = one_target[0]
        detrow = one_target[1]
        detpol = one_target[2]
        self.gen_signal(samples)
        time_ax=np.linspace(self.dummycounter, self.dummycounter+samples, samples, endpoint=False).tolist()

        for i in range (len(detcol)):
            data_x.append(time_ax)
            data_y.append(self.signal[detcol[i], detrow[i], detpol[i], 0:samples].tolist())

        self.dummycounter+=samples

        select_det_signal = {
          'data_x': data_x,
          'data_y': data_y
        }
        #print(select_det_signal)
        time.sleep(0.25)
        return select_det_signal

    def gen_signal(self, length):
        '''
        Generate signal for length time interval.
        '''
        signal=np.random.normal(10, 1, size=(self.Nx, self.Ny, 2, length))

        self.signal = np.roll(self.signal, shift=length, axis = 3)
        self.signal[:,:,:,0:length] = signal
        #print(self.signal[:,:,:,0:length])
        #print(self.signal[:,:,:,length:2*length])

    def read_mce_signal(self, length, datapath):
        '''
        Reading signal from mce data file for a giver (row,col) set for length time interval.
        '''
        #randomly generating row and col for now
        for i in range (self.Nx):
            for j in range (self.Ny):
                for p in range(2):
                    row = random.randint(0,32)
                    col = random.randint(0,32)
                    t1,s1=rt.return_ts(datapath, row, col)
                    signal[i,j,p,:]=s1[0:length]

        self.signal = np.roll(self.signal, shift=length, axis = 3)
        self.signal[:,:,:,0:length] = signal
        #print(self.signal[:,:,:,0:length])
        #print(self.signal[:,:,:,length:2*length])
