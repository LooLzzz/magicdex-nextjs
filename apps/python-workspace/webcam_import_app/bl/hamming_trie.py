from dataclasses import dataclass
from typing import Any, NamedTuple


class TrieResultItem(NamedTuple):
    value: Any
    distance: int

    def __repr__(self):
        return f'({self.value}, distance={self.distance})'


@dataclass
class TrieItem:
    value: int

    def __repr__(self):
        return repr(bin(self.value))

    def bit_length(self):
        return self.value.bit_length()


class TrieNode:
    def __init__(self, parent: 'TrieNode' = None, value: Any = None):
        self._item_bit_length: int = 0
        self.parent = parent
        self.left: TrieNode = None
        self.right: TrieNode = None

        match value:
            case int():
                self.item = TrieItem(value=value) if value is not None else None
            case _:
                self.item = value

    @property
    def value(self):
        if self.item is None:
            return None
        return self.item.value

    @property
    def item_bit_length(self):
        if self.is_root:
            return self._item_bit_length
        return self.parent.item_bit_length

    @item_bit_length.setter
    def item_bit_length(self, value: int):
        if self.is_root:
            self._item_bit_length = value
        else:
            self.parent.item_bit_length = value

    @property
    def bin_value(self):
        if self.value is None:
            return None
        return bin(self.value)[2:].zfill(self.item_bit_length)

    def __repr__(self):
        if self.is_leaf:
            if self.bin_value is not None:
                return f'{self.__class__.__name__}(0b{self.bin_value})'
            return f'{self.__class__.__name__}()'
        return f'{self.__class__.__name__}(left={self.left!r}, right={self.right!r})'

    def __getitem__(self, key: int):
        return int(self.bin_value[key])

    @property
    def is_root(self):
        return not self.parent

    @property
    def is_leaf(self):
        return not (self.left or self.right)


class BinaryHammingTrie:
    def __init__(self, items: list[int] = None):
        self.node_count = 0
        self.root = TrieNode()
        if items:
            self.extend(items)

    @property
    def item_bit_length(self):
        return self.root.item_bit_length

    @item_bit_length.setter
    def item_bit_length(self, value: int):
        self.root.item_bit_length = value

    @property
    def left(self):
        return self.root.left

    @property
    def right(self):
        return self.root.right

    def extend(self, items: list[int]):
        for item in items:
            self.insert(item)

    def insert(self, item: int | TrieItem):
        value = item
        if not isinstance(value, int):
            value = item.value

        self.item_bit_length = max(self.item_bit_length, value.bit_length())

        bits = [int(b) for
                b in bin(value)[2:].zfill(self.item_bit_length)]
        node = self.root

        for split_pos, bit in enumerate(bits):
            if not node.is_root and node.is_leaf:
                if node[split_pos] == 0:
                    node.left = TrieNode(parent=node, value=item)
                else:
                    node.right = TrieNode(parent=node, value=item)
                self.node_count += 1
                node.item = None

            if bit == 0:
                if node.left:
                    node = node.left
                else:
                    node.left = TrieNode(parent=node, value=item)
                    self.node_count += 1
                    break

            else:  # bit == '1'
                if node.right:
                    node = node.right
                else:
                    node.right = TrieNode(parent=node, value=item)
                    self.node_count += 1
                    break

    def find(self, value: int, tolerance: int = 0):
        results: list[TrieResultItem] = []
        bits = bin(value)[2:].zfill(self.item_bit_length)

        def _find(node: TrieNode = self.root, cost: int = 0, split_pos: int = 0):
            if node.is_leaf and not node.is_root:
                for i in range(split_pos, len(bits)):
                    cost += bits[i] != node.bin_value[i]
                if cost <= tolerance:
                    results.append(TrieResultItem(node.item, cost))
                return

            if node.left:  # left -> 0
                d = bits[split_pos] != '0'
                _find(node.left, cost + d, split_pos + 1)
            if node.right:  # right -> 1
                d = bits[split_pos] != '1'
                _find(node.right, cost + d, split_pos + 1)

        _find()
        return sorted(results, key=lambda a: a.distance)  # sort by cost

    def walk(self):
        """Walks the tree in a DFS manner, yielding the values of the leaf nodes."""

        def _walk(node: TrieNode = self.root):
            if node.is_leaf and not node.is_root:
                yield node.item
                return

            if node.left:
                yield from _walk(node.left)
            if node.right:
                yield from _walk(node.right)

        yield from _walk()

    def __repr__(self):
        return f'{self.__class__.__name__}(nodes={self.node_count}, item_bit_length={self.item_bit_length})'

    def __len__(self):
        return self.node_count

    def __iter__(self):
        return self.walk()
