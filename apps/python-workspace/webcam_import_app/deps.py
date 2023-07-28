from .bl.cache_layer import TTLCache
from .bl.phash import PhashBitsDataFrame, PhashHammingTrie, PhashTreeABC

_ttl_cache = None


async def phash_tree_dep() -> PhashTreeABC:
    return PhashBitsDataFrame(phash_bit_length=256)
    # return PhashHammingTrie(phash_bit_length=256)


async def cache_layer_dep():
    global _ttl_cache
    if _ttl_cache is None:
        _ttl_cache = TTLCache(ttl_sec=0.75)
    return _ttl_cache
