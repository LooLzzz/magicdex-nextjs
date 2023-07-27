import json
import pickle
from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path
from typing import Generic, Literal, TypeVar

import numpy as np
import pandas as pd
from pydantic import BaseModel, Field, validator
from tqdm import tqdm

from .. import utils
from . import hamming_distance
from .hamming_trie import BinaryHammingTrie

T = TypeVar('T')


class PhashTreeABC(ABC):
    phash_bit_length: int

    def __repr__(self):
        return f'<{self.__class__.__name__}(phash_bit_length={self.phash_bit_length})>'

    @abstractmethod
    def find(self,
             item: 'int | CardPhashItem',
             tolerance: int = None,
             *, timeit: bool = False) -> 'None | PhashTreeResultItem[CardPhashItem]':
        ...

    async def afind(self,
                    item: 'int | CardPhashItem',
                    tolerance: int = None,
                    *, timeit: bool = False) -> 'None | PhashTreeResultItem[CardPhashItem]':
        """Async version of `find()`"""
        return self.find(item, tolerance, timeit=timeit)


class CardPhashItem(BaseModel):
    scryfall_id: str
    name: str
    set: str
    phash: int = Field(exclude=True, alias='value')

    @property
    def value(self):
        return self.phash

    @validator('phash', pre=True)
    def validate_phash(cls, value):
        if isinstance(value, np.ndarray):
            return int(''.join(value.astype('int').astype('str')), 2)
        return value

    def bit_length(self):
        return self.phash.bit_length()

    def __xor__(self, other):
        match other:
            case int():
                return hash(self) ^ other
            case _:
                return hash(self) ^ hash(other)

    def __hash__(self):
        return self.phash

    def __str__(self):
        return repr(self)

    class Config:
        allow_population_by_field_name = True


@dataclass
class PhashTreeResultItem(Generic[T]):
    distance: int
    value: T

    def __repr__(self):
        return f'(distance={self.distance}, value={self.value})'

    def __getitem__(self, index):
        return (self.distance, self.value)[index]


class PhashBitsDataFrame(PhashTreeABC, metaclass=utils.SingletonABCMeta):
    def __init__(self, *, phash_bit_length: Literal[64, 256, 1024] = 256):
        # filepath = Path(__file__).parent.parent / f'data/phash_bits_png_{phash_bit_length}bit.json'
        filepath = Path(__file__).parent.parent / f'data/phash_normal_{phash_bit_length}bit.csv'

        self.phash_bit_length = phash_bit_length
        self.df = pd.read_csv(filepath, index_col='scryfall_id')

    def find(self, value: int, tolerance: int = None, *, timeit: bool = False):
        tolerance = tolerance or int(self.phash_bit_length * 0.375)

        df = self.df.copy()
        df['distance'] = df['phash'].apply(lambda x: hamming_distance(int(x), value))
        row = df.iloc[df['distance'].argmin()]

        if row['distance'] > tolerance:
            return None
        return PhashTreeResultItem(distance=row['distance'],
                                   value=CardPhashItem(scryfall_id=row.name, **row.to_dict()))


class PhashHammingTrie(PhashTreeABC, metaclass=utils.SingletonABCMeta):
    def __init__(self, *, phash_bit_length: Literal[64, 256, 1024] = 256):
        filepath = Path(__file__).parent.parent / f'data/phash_normal_{phash_bit_length}bit.csv'
        df = pd.read_csv(filepath, index_col='scryfall_id')

        self.phash_bit_length = phash_bit_length
        self.trie = BinaryHammingTrie(
            items=tqdm(iterable=(CardPhashItem(scryfall_id=row.name, **row.to_dict())
                                 for _, row in df.iterrows()),
                       total=len(df))
        )
        # self.trie = BinaryHammingTrie(items=(CardPhashItem(scryfall_id=row.name, **row.to_dict())
        #                                      for _, row in df.iloc[:1000].iterrows()))

    def find(self, value: int, tolerance: int = None, *, timeit: bool = False):
        tolerance = tolerance or int(self.phash_bit_length * 0.375)
        result = self.trie.find(value, tolerance=tolerance)

        if result:
            return PhashTreeResultItem(distance=result[0].distance, value=result[0].value)
        return None
