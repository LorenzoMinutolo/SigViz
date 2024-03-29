import numpy as np
import ba40_ModuleMapping as bamm
import matplotlib.pyplot as pl
import random
import read_timestream as rt
import time
from multiprocessing import Lock
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
        self.bias=np.zeros((self.Nx, self.Ny, 2))
        #self.time_ax=np.zeros(inner_length)
        #Glitch simulator
        self.deleteme_counter = 0
        self.deleteme_flag = True
        self.deleteme_glitch_pos = np.random.randint(0,32, size=4)
        self.signal_lock = Lock()
        self.dummy_triangle_counter = 0
        self.dummy_signal_counter = 0
        self.dummycounter = 0
        #print(self.signal)

    def get_triangle(self, f_low, f_high, lenght, mode = "data", starting_tick = 0, rand=True):
        '''
        Return NX x NY x 2 tensor in 0 - 1 interval
        '''
        print("Returning triangle data. mode: %s" % mode)
        if mode == "bias":
            return (self.bias-self.bias.min())/(self.bias-self.bias.min()).max()
        else:
            datapath = '/Users/sofi/Desktop/SigViz/BA1_data/20191015/Conf_1_Biascan_lightdark_Sine_Vpp_1.0_Voffset_0.0_V_Freq_0.5_Hz_trial_2_bias1'

            # Here you are updating the data. This should go in gen_signal, not here.
            # Generally I would keep the "get_" function indipendent from data generation. - LM
            if rand:
                #self.signal_lock.acquire()
                if starting_tick!=self.dummy_triangle_counter:
                    diff = np.abs(self.dummy_triangle_counter - starting_tick)
                    lenght+=diff
                    time_ax=np.linspace(starting_tick, starting_tick+lenght, lenght, endpoint=False).tolist()
                else:
                    time_ax= self.gen_signal(200, noupdate = True)
                    pass
                #self.signal_lock.release()
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
            #time.sleep(0.3)
            return power_spect

    def convert_pol(self, pol):
        if pol=='A':
            return 0
        elif pol=='B':
            return 1
        else:
            raise ValueError('Polarization not defined.')

    def get_signal(self, target, mode, samples, starting_tick):
        #print("starting from ",starting_tick)
        starting_tick = int(starting_tick)
        #self.signal_lock.acquire()
        if int(starting_tick)+1<int(self.dummy_signal_counter):
            print('got %d instead of %d' % (starting_tick, self.dummy_signal_counter))
            diff = np.abs(self.dummy_signal_counter - starting_tick)

            if diff>500:
                starting_tick = self.dummy_signal_counter - samples # just to avoid long plotting time
            else:
                samples+=diff

            time_ax=np.linspace(starting_tick, starting_tick+samples, samples, endpoint=False).tolist()
        else:
            time_ax=self.gen_signal(samples)
            self.dummy_signal_counter+=samples

        #self.signal_lock.release()

        select_det_signal = {'data_x':[],'data_y':[]}
        for i in range (len(target)):
            one_target=target[i]
            detcol = one_target[0]
            detrow = one_target[1]
            detpol = one_target[2]
            for j in range (len(detcol)):
                select_det_signal['data_x'].append(time_ax)
                if mode[i]=='ps':
                    data_y_FT = np.fft.rfft(self.signal[int(detcol[j]), int(detrow[j]), self.convert_pol(detpol[j]), 0:int(samples)])
                    power_spect=(np.abs(data_y_FT)**2).tolist()
                    select_det_signal['data_y'].append(self.signal[int(detcol[j]), int(detrow[j]),self.convert_pol(detpol[j]), 0:samples].tolist())
                elif mode[i]=='ts':
                    data_y=self.signal[int(detcol[j])][int(detrow[j])][self.convert_pol(detpol[j])][0:samples].tolist()
                    #data_y=self.signal[int(detcol[j])][int(detrow[j])][self.convert_pol(detpol[j])][self.dummycounter:self.dummycounter+int(samples)].tolist()
                    select_det_signal['data_y'].append(data_y)

        # time.sleep(0.125)
        # print(target)
        # print(select_det_signal)
        return select_det_signal


    def gen_signal(self, length, noupdate = False):
        '''
        Generate signal for length time interval.
        '''

        signal=np.random.normal(10, 1, size=(self.Nx, self.Ny, 2, length))
        glitch_freq=random.uniform(0.005,1)
        time_ax = np.linspace(self.dummycounter, self.dummycounter+length, length, endpoint=False).tolist()
        glitch=np.sin(glitch_freq*np.asarray(time_ax))
        signal_wglitch=signal#+glitch

        self.signal = np.roll(self.signal, shift=length, axis = 3)
        self.signal[:,:,:,0:length] = signal_wglitch

        self.bias=np.random.randint(200, 250, size=(self.Nx, self.Ny, 2)) #then will be read from .run file
        if(not noupdate): self.dummycounter+=length

        return time_ax
        #print(self.signal[:,:,:,0:length])
        #print(self.signal[:,:,:,length:2*length])

    def read_mce_signal(self, length, datapath):
        '''
        Reading signal from mce data file for all the (detrow,detcol) set for length time interval, and populates the full tensor.
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
