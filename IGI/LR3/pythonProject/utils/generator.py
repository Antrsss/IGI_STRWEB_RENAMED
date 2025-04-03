"""
Utility for sequence generation.
Version: 1.0
Developer: Darya Zgirskaya
Date: 2025-03-16
"""


def generate_sequence(n):
    """
    Generator. Returns sequence from 0 to n-1.

    :param n: Number of sequence elements.
    :yield: Another number in sequence.
    """
    for i in range(n):
        yield i