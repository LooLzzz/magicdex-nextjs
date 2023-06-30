from fastapi import WebSocket

from . import app


@app.get('/')
async def root():
    return {'message': 'Hey, It is me Goku'}


@app.websocket('/')
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        print(f'Message received from client: {data}')
        await websocket.send_text(data.upper())
