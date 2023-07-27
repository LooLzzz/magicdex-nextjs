from abc import ABCMeta
from functools import wraps
from time import time

import numpy as np
from numpy import typing as npt

from .types import RectDict


class Singleton(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(type, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class SingletonABCMeta(ABCMeta):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(SingletonABCMeta, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


def timeit_decorator(f):
    @wraps(f)
    def wrap(*args, **kw):
        ts = time()
        result = f(*args, **kw)
        te = time()
        print(f'{f.__name__}() took: {(te-ts)*1000:2.4f} ms')
        return result
    return wrap


def rect_points_to_dict(rect: npt.NDArray[np.uint32]) -> RectDict:
    return {
        'tl': {'x': int(rect[0][0]), 'y': int(rect[0][1])},
        'tr': {'x': int(rect[1][0]), 'y': int(rect[1][1])},
        'br': {'x': int(rect[2][0]), 'y': int(rect[2][1])},
        'bl': {'x': int(rect[3][0]), 'y': int(rect[3][1])},
    }
