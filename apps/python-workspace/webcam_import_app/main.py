from logging import getLogger

from fastapi import Depends, WebSocket
from starlette.websockets import WebSocketDisconnect

from . import app, deps, handlers
from .bl.cache_layer import TTLCache
from .bl.phash import PhashTreeABC
from .models import Base64Image

logger = getLogger('uvicorn')


@app.on_event('startup')
async def app_startup():
    logger.info('Initializing PhashTree instance...')
    res = await deps.phash_tree_dep()
    logger.info(f'PhashTree: {res!r}')


@app.get('/')
async def root():
    return {'message': "This is not the endpoint you're looking for"}


@app.get('/phash-tree')
async def get_bktree(phash_tree: PhashTreeABC = Depends(deps.phash_tree_dep)):
    return {'message': repr(phash_tree)}


# @app.get('/display')
# async def detect(image: Base64Image, phash_tree: PhashTreeABC = Depends(deps.phash_tree_dep)):
#     import cv2

#     hash_size = int(phash_tree.phash_bit_length ** 0.5)
#     cv2_image = image.as_cv2()

#     res = {}
#     if sub_images := cv2_image.extract_sub_images():
#         sub_image = sub_images[0]
#         phash_value = sub_image.calc_phash(hash_size=hash_size, as_int=True)
#         res = {'phash_value': phash_value}
#         sub_image.show()

#     print(res)
#     cv2_image.show()
#     cv2.waitKey(0)
#     cv2.destroyAllWindows()
#     return res


@app.get('/detect')
async def detect(image: Base64Image, phash_tree: PhashTreeABC = Depends(deps.phash_tree_dep)):
    return await handlers.handle_websocket_endpoint(
        image=image.as_cv2(),
        phash_tree=phash_tree,
    )


@app.websocket('/')
async def websocket_endpoint(websocket: WebSocket,
                             phash_tree: PhashTreeABC = Depends(deps.phash_tree_dep),
                             ttl_cache: TTLCache = Depends(deps.cache_layer_dep)):
    try:
        await websocket.accept()
        session_id = websocket.headers.get('sec-websocket-key')

        while True:
            data: str = await websocket.receive_text()
            image = Base64Image(base64_string=data)

            resp = await handlers.handle_websocket_endpoint(
                image=image.as_cv2(),
                phash_tree=phash_tree,
                session_id=session_id,
                ttl_cache=ttl_cache,
            )

            await websocket.send_json(resp)

    except WebSocketDisconnect as e:
        logger.error(f'Websocket disconnected, code: {e.code}')
        del ttl_cache[session_id]
