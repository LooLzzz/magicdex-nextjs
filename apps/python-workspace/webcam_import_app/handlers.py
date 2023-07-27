import asyncio

from .bl.phash import PhashTreeABC
from .models import Cv2Image, SubImage


async def _phash_tree_find_task(phash_tree: PhashTreeABC, sub_image: SubImage):
    # t_s = asyncio.get_running_loop().time()
    hash_size = int(phash_tree.phash_bit_length ** 0.5)
    sub_image_phash = sub_image.calc_phash(hash_size=hash_size, as_int=True)

    res = {}
    if found := await phash_tree.afind(sub_image_phash):
        res = {
            'coords': sub_image.coords,
            'cardData': found.value.dict(),
            'match': round(1 - (found.distance / phash_tree.phash_bit_length), 2),
        }

    # t_e = asyncio.get_running_loop().time()
    # print(f'phash_bktree: {t_e - t_s:.3f} sec')

    return res


async def handle_websocket_endpoint(image: Cv2Image, phash_tree: PhashTreeABC):
    # t_s = asyncio.get_running_loop().time()

    res: list[dict[str]] = await asyncio.gather(*[
        _phash_tree_find_task(phash_tree, sub_image)
        for sub_image in image.extract_sub_images()
    ])

    # t_e = asyncio.get_running_loop().time()
    # print(f'handle_websocket: {t_e - t_s:.3f} sec')

    # filter 'None' values
    return [item for item in res if item]
