import numpy as np


class DSP(ogbject):
    '''
    DO DPS operation and eventually simulate signal
    '''
    def trivial_op(a,b):
        return a * b

    def __init__(self, NX, NY, inner_length):
        '''
        Initialization.

        Parameters:
            - NX: Number of detectors along the X axe
            - NY: Number of detectors along the X axe
        '''
        self.Nx = NX
        self.Ny = NY
        self.signal = np.zeros(self.Nx, self.Ny, 2, inner_length)

    def get_triangle(self, f_low, f_high, norm_low, norm_high):
        '''

        Return NX x NY x 2 tensor in 0 - 1 interval
        '''

        fft = np.fft.rfft(self.signal, axis = 3)
        fft = np.sum()
        return fft

    def gen_signal(self, length):
        '''
        Generate signal for length time interval.
        '''
        signal = np.array(self.Nx, self.Ny, 2, length)
        self.signal = np.roll(length, axis = 3)
        self.signal[:,:,:,0:length] = signal
