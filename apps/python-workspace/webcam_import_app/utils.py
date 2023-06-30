import base64
import random

import cv2
import numpy as np


def base64_image_to_opencv(data: str) -> np.ndarray:
    img_data = data.split(',')[1]
    img_ndarray = np.frombuffer(base64.b64decode(img_data), dtype=np.uint8)
    return cv2.imdecode(img_ndarray, cv2.IMREAD_COLOR)


def gen_random_card_data(img_width: int, img_height: int):
    return {
        'coords': {
            'x': random.randint(0, img_width),
            'y': random.randint(0, img_height),
            'w': random.randint(0, img_width // 2),
            'h': random.randint(0, img_height // 2),
        },
        'cardData': {
            'scryfall_id': 'a1b2c3d4',
            'name': random.choice(['Goku', 'Vegeta', 'Gohan', 'Piccolo', 'Krillin', 'Yamcha', 'Tien', 'Chiaotzu']),
        }
    }
