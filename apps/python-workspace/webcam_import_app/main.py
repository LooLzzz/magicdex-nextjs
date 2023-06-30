from fastapi import WebSocket
import random

from . import app
from .utils import base64_image_to_opencv, gen_random_card_data


@app.get('/')
async def root():
    return {'message': 'Hey, It is me Goku'}


@app.websocket('/')
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        print(f'Message received from client: {websocket.client.host}')
        image = base64_image_to_opencv(data)
        img_height, img_width = image.shape[:2]

        await websocket.send_json([
            gen_random_card_data(img_height, img_width)
            for _ in range(random.randint(0, 3))
        ])
