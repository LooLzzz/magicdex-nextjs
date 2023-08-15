import asyncio
from math import sqrt

from .bl.cache_layer import TTLCache
from .bl.cv2_layer import hamming_distance
from .bl.phash import CardPhashItem, PhashTreeABC, PhashTreeResultItem
from .models import Cv2Image, SubImage
from .types import SubImageMatchDict


async def _phash_tree_find_task(phash_tree: PhashTreeABC,
                                sub_image: SubImage,
                                ttl_cache: TTLCache[str, PhashTreeResultItem[CardPhashItem]] | None = None,
                                session_id: str | None = None) -> SubImageMatchDict | None:
    hash_size = int(sqrt(phash_tree.phash_bit_length))
    sub_image_phash = sub_image.calc_phash(hash_size=hash_size, as_int=True)
    prev_found = ttl_cache[session_id] if ttl_cache is not None else []
    found = []

    # check session cache
    if prev_found:
        for item in prev_found:
            item.distance = hamming_distance(item.value.phash, sub_image_phash)
        found = sorted([item
                        for item in prev_found
                        if item.distance <= phash_tree.default_tolerance],
                       key=lambda item: item.distance)

    # if not found in session cache, check phash_tree
    if not found:
        found = await phash_tree.afind(sub_image_phash)

    if found:
        # refresh session cache
        if ttl_cache is not None and session_id:
            ttl_cache.update({session_id: found})
        return {
            'coords': sub_image.coords,
            'cardData': found[0].value.dict(),
            'match': round(1 - (found[0].distance / phash_tree.phash_bit_length), 2),
        }

    return None


async def handle_websocket_endpoint(image: Cv2Image,
                                    phash_tree: PhashTreeABC,
                                    ttl_cache: TTLCache[str, PhashTreeResultItem[CardPhashItem]] | None = None,
                                    session_id: str | None = None):
    res: list[SubImageMatchDict] = await asyncio.gather(*[
        _phash_tree_find_task(phash_tree, sub_image=sub_image, ttl_cache=ttl_cache, session_id=session_id)
        for sub_image in image.extract_sub_images()
    ])

    # filter 'None' values
    return [item for item in res if item]
