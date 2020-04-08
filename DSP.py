import numpy as np
import ba40_ModuleMapping as bamm
import matplotlib.pyplot as pl

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
        #print(self.signal)

    def get_triangle(self, f_low, f_high, lenght):
        '''
        Return NX x NY x 2 tensor in 0 - 1 interval
        '''
        self.gen_signal(lenght)
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
        self.gen_signal(samples)
        for i in range (len(detcol)):
            data_x.append(list(range(len(detcol))))
            data_y.append(self.signal[detcol[i], detrow[i], detpol[i], 0:samples])

        select_det_signal = {
          'data_x': data_x,
          'data_y': data_y
        }

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
