from typing import TypedDict

import numpy as np
import numpy.typing as npt

NDArrayImage = npt.NDArray[np.uint8]
NDArrayRect = npt.NDArray[np.uint32]
NDArrayHash = npt.NDArray[np.bool_]


class Point(TypedDict):
    x: int
    y: int


class RectDict(TypedDict):
    tl: Point
    tr: Point
    br: Point
    bl: Point
