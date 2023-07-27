from typing import Literal

import cv2
import numpy as np
from numpy import typing as npt
from scipy.fftpack import dct

from .. import utils
from ..types import NDArrayHash, NDArrayImage, NDArrayRect


def find_rects(image: NDArrayImage, size_thresh: int = 10000):
    gray: NDArrayImage = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred: NDArrayImage = cv2.medianBlur(gray, 5)
    edged = cv2.adaptiveThreshold(blurred, 0xFF, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 5, 5)
    kernel = np.ones((3, 3), np.uint8)
    dilated = cv2.dilate(edged, kernel, iterations=1)
    eroded = cv2.erode(dilated, kernel, iterations=1)

    contours: list[NDArrayImage]
    contours, hier = cv2.findContours(eroded, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    # for contour in contours:
    #     perimeter: float = cv2.arcLength(contour, True)
    #     approx: NDArrayRect = cv2.approxPolyDP(contour, 0.02 * perimeter, True)
    #     if len(approx) == 4:
    #         rects.append(approx)

    rects: list[NDArrayRect] = []
    if hier is not None:
        stack = [(0, hier[0][0])]
        while len(stack) > 0:
            i_cnt, h = stack.pop()
            i_next, i_prev, i_child, i_parent = h
            if i_next != -1:
                stack.append((i_next, hier[0][i_next]))
            cnt = contours[i_cnt]
            size = cv2.contourArea(cnt)
            peri = cv2.arcLength(cnt, True)
            approx = cv2.approxPolyDP(cnt, 0.04 * peri, True)
            if size >= size_thresh and len(approx) == 4:
                rects.append(approx)
            else:
                if i_child != -1:
                    stack.append((i_child, hier[0][i_child]))

    return [
        order_points(rect.reshape(4, 2))
        for rect in rects
    ]


def order_points(pts: NDArrayRect):
    """
    initialzie a list of coordinates that will be ordered such that the first entry in the list is the top-left,
    the second entry is the top-right, the third is the bottom-right, and the fourth is the bottom-left
    :param pts: array containing 4 points
    :return: ordered list of 4 points
    """

    rect: NDArrayRect = np.zeros((4, 2), dtype=np.int32)

    _sum = pts.sum(axis=1)
    _diff = np.diff(pts, axis=1)

    rect[0] = pts[np.argmin(_sum)]  # top-left
    rect[1] = pts[np.argmin(_diff)]  # top-right
    rect[2] = pts[np.argmax(_sum)]  # bottom-right
    rect[3] = pts[np.argmax(_diff)]  # bottom-left
    return rect


def four_point_transform(image: NDArrayImage, rect: NDArrayRect):
    """
    Transform a quadrilateral section of an image into a rectangular area
    From: www.pyimagesearch.com/2014/08/25/4-point-opencv-getperspective-transform-example/
    :param image: source image
    :param pts: 4 corners of the quadrilateral
    :return: rectangular image of the specified area
    """

    (tl, tr, br, bl) = rect

    width_a: float = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
    width_b: float = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
    max_width: int = max(int(width_a), int(width_b))

    height_a: float = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
    height_b: float = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
    max_height: int = max(int(height_a), int(height_b))

    warped: NDArrayImage = cv2.warpPerspective(
        src=image,
        dsize=(max_width, max_height),
        M=cv2.getPerspectiveTransform(
            src=rect.astype(np.float32),
            dst=np.array([[0, 0],
                          [max_width - 1, 0],
                          [max_width - 1, max_height - 1],
                          [0, max_height - 1]],
                         dtype=np.float32),
        ),
    )

    if max_width > max_height:
        warped = cv2.warpAffine(
            src=warped,
            dsize=(max_height, max_width),
            M=cv2.getRotationMatrix2D(
                center=(max_height / 2, max_height / 2),
                angle=270,
                scale=1.0,
            ),
        )

    return warped


def crop_image(image: NDArrayImage, width_p: float, height_p: float):
    return image[
        int(image.shape[0] * height_p):int(image.shape[0] * (1 - height_p)),
        int(image.shape[1] * width_p):int(image.shape[1] * (1 - width_p))
    ]


def crop_scale_image(image: NDArrayImage, scale: float):
    center_x, center_y = image.shape[1] / 2, image.shape[0] / 2
    new_w, new_h = image.shape[1] * scale, image.shape[0] * scale
    lx, rx = center_x - new_w / 2, center_x + new_w / 2
    ty, by = center_y - new_h / 2, center_y + new_h / 2
    return image[int(ty):int(by), int(lx):int(rx)]


def add_border(image: NDArrayImage, size: int, color: tuple[int, int, int] = (0, 0, 0)):
    return cv2.copyMakeBorder(
        src=image,
        top=size,
        bottom=size,
        left=size,
        right=size,
        borderType=cv2.BORDER_CONSTANT,
        value=color,
    )


def resize_to_ratio(image: NDArrayImage, ratio: float):
    height, width = image.shape[:2]
    current_ratio = height / width

    if current_ratio > ratio:
        new_height = int(width * ratio)
        return cv2.resize(image, (width, new_height))
    else:
        new_width = int(height / ratio)
        return cv2.resize(image, (new_width, height))


def to_grayscale_image(image: NDArrayImage, origin_color_space: Literal['BGR', 'RGB'] = 'BGR'):
    match image.shape:
        case (h, w, 4):
            cvt_color_code = cv2.COLOR_BGRA2GRAY if origin_color_space == 'BGR' else cv2.COLOR_RGBA2GRAY

        case (h, w, 3):
            cvt_color_code = cv2.COLOR_BGR2GRAY if origin_color_space == 'BGR' else cv2.COLOR_RGB2GRAY

        case (h, w, 2):
            return image

        case _:
            raise ValueError(f'Unsupported image shape: {image.shape}')

    return cv2.cvtColor(image, cvt_color_code)


def phash(image: NDArrayImage,
          origin_color_space: Literal['BGR', 'RGB'] = 'BGR',
          hash_size: int = 8,
          highfreq_factor: int = 4,
          as_int: bool = False,
          timeit: bool = False) -> int | npt.NDArray:
    def _phash(image: NDArrayImage,
               origin_color_space: Literal['BGR', 'RGB'],
               hash_size: int,
               highfreq_factor: int,
               as_int: bool):
        image_size = hash_size * highfreq_factor
        image = cv2.resize(
            src=to_grayscale_image(image, origin_color_space),
            dsize=(image_size, image_size),
            interpolation=cv2.INTER_AREA,
        )
        dct_value = dct(dct(image, axis=0), axis=1)
        dct_lowfreq = dct_value[:hash_size, :hash_size]
        hash_array = dct_lowfreq > np.median(dct_lowfreq)
        hash_array = hash_array.flatten().astype('uint8')

        if as_int:
            return int(''.join(hash_array.astype('str')), 2)
        return hash_array

    if hash_size < 2:
        raise ValueError('Hash size must be greater than or equal to 2')

    if timeit:
        return utils.timeit_decorator(_phash)(image, origin_color_space, hash_size, highfreq_factor, as_int)
    return _phash(image, origin_color_space, hash_size, highfreq_factor, as_int)


def hamming_distance(a: NDArrayHash | int, b: NDArrayHash | int):
    match (a, b):
        case (int(), int()):
            return bin(a ^ b).count('1')

        case (np.ndarray(), np.ndarray()):
            return np.count_nonzero(a != b)

        case (np.ndarray(), int()):
            b_arr = np.array(list(bin(b)[2:].zfill(a.size)))
            return np.count_nonzero(a != b_arr)

        case (int(), np.ndarray()):
            a_arr = np.array(list(bin(a)[2:].zfill(b.size)))
            return np.count_nonzero(a != a_arr)

        case _:
            raise ValueError(f'Unsupported types: {type(a)}, {type(b)}')
