from collections import defaultdict
from dataclasses import dataclass, field
from time import time
from typing import Generic, TypeVar

from ..utils import SingletonMeta

K = TypeVar('K')
V = TypeVar('V')


@dataclass(unsafe_hash=True)
class CacheEntry(Generic[V]):
    value: V = field(hash=True, compare=True)
    timestamp: float = field(hash=False, compare=False)


class TTLCache(Generic[K, V]):
    def __init__(self, ttl_sec: float = 5):
        self._ttl = ttl_sec
        self._cache: dict[K, set[CacheEntry[V]]] = defaultdict(set)

    def _validate_all_items(self):
        for key, entries in list(self._cache.items()):
            for entry in entries.copy():
                if time() - entry.timestamp > self._ttl:
                    entries.remove(entry)

            if not entries:
                del self[key]

    def pop(self, key: K):
        return [entry.value
                for entry in self._cache.pop(key, [])]

    def update(self, d: dict[K, list[V]], /):
        for key, new_values in d.items():
            for value in new_values:
                new_entry = CacheEntry(value, time())
                if new_entry in self._cache[key]:
                    self._cache[key].remove(new_entry)
                self._cache[key].add(new_entry)

    def clear(self):
        self._cache.clear()

    def __getitem__(self, key: K):
        entries = self._cache[key]
        for entry in entries.copy():
            if time() - entry.timestamp > self._ttl:
                self._cache[key].remove(entry)
        return [entry.value for entry in self._cache[key]]

    def __setitem__(self, key: K, value: V):
        self._cache[key] = {CacheEntry(value, time())}

    def __contains__(self, key: K):
        _ = self[key]  # trigger ttl validation
        return key in self._cache

    def __delitem__(self, key: K):
        try:
            del self._cache[key]
        except KeyError:
            pass

    def __repr__(self):
        self._validate_all_items()
        return repr({k: [v.value for v in s]
                    for k, s in self._cache.items()})

    def __len__(self):
        self._validate_all_items()
        return len(self._cache)
