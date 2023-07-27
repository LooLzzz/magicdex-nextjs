import base64
from typing import NamedTuple

import cv2
import numpy as np
from pydantic import BaseModel, Field

from . import utils
from .bl import cv2_layer
from .types import NDArrayImage, NDArrayRect, RectDict


class SubImage(NamedTuple):
    coords: RectDict
    data: NDArrayImage

    @property
    def width(self):
        return self.data.shape[1]

    @property
    def height(self):
        return self.data.shape[0]

    def calc_phash(self, *, crop: bool = True, add_border: bool = False, as_int: bool = True, **phash_kwargs) -> int:
        image = self.data
        if crop:
            # image = cv2_layer.crop_image(image, width_p=0.02, height_p=0.02)
            image = cv2_layer.crop_scale_image(image, scale=0.98)
        if add_border:
            image = cv2_layer.add_border(image, size=int(self.width * 0.02))
        return cv2_layer.phash(image, **phash_kwargs, as_int=as_int)

    def show(self, winname: str = None):
        cv2.imshow(winname or str(self.coords), self.data)

    def __hash__(self):
        return self.calc_phash(as_int=True)


class Cv2Image(BaseModel):
    data: NDArrayImage

    def extract_sub_images(self):
        return [
            SubImage(coords=utils.rect_points_to_dict(rect),
                     data=self._four_point_transform(rect))
            for rect in self._find_rects()
        ]

    def show(self, winname: str = None):
        cv2.imshow(winname or str(id(self)), self.data)

    def _find_rects(self):
        return cv2_layer.find_rects(self.data)

    def _four_point_transform(self, rect: NDArrayRect, resize_to_ratio: float = 1.4):
        return cv2_layer.resize_to_ratio(
            cv2_layer.four_point_transform(self.data, rect),
            ratio=resize_to_ratio,
        )

    class Config:
        arbitrary_types_allowed = True


class Base64Image(BaseModel):
    base64_string: str = Field(alias='image')

    @property
    def image_data(self) -> str | None:
        res = self.base64_string.split(',', 1)
        return res[1] if len(res) == 2 else None

    def as_bytes(self) -> bytes:
        return base64.b64decode(self.image_data or '')

    def as_cv2(self, flags: int = None):
        if flags is None:
            flags = cv2.IMREAD_COLOR
        img_ndarray = np.frombuffer(self.as_bytes(), dtype=np.uint8)
        return Cv2Image(data=cv2.imdecode(img_ndarray, flags))

    class Config:
        allow_population_by_field_name = True
