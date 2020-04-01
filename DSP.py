import numpy as np


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
        #print(self.signal)

    def get_triangle(self, f_low, f_high, lenght):
        '''
        Return NX x NY x 2 tensor in 0 - 1 interval
        '''
        self.gen_signal(lenght)
        signal_FT = np.fft.rfft(self.signal, axis = 3)
        power_spect=np.sum((np.abs(signal_FT)**2)[f_low:f_high], axis=3)
        #print(np.shape(power_spect))
        return power_spect

    def gen_signal(self, length):
        '''
        Generate signal for length time interval.
        '''
        signal=np.random.normal(10, 1, size=(self.Nx, self.Ny, 2, length))
        self.signal = np.roll(self.signal, shift=length, axis = 3)
        self.signal[:,:,:,0:length] = signal
        #print(self.signal[:,:,:,0:length])
        #print(self.signal[:,:,:,length:2*length])
