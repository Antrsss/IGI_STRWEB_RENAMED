"""
Task 4: Text Analysis
Version: 1.0
Developer: Darya Zgirskaya
Date: 2025-03-16
"""

import string


def count_three_char_words(text):
    """
    Count and return words with exactly three characters.

    :param text: The input text.
    :return: A list of three-character words.
    """
    words = text.split()
    cleaned_words = [word.strip(string.punctuation) for word in words]
    three_char_words = list(filter(lambda word: len(word) == 3, cleaned_words))
    return three_char_words


def count_equal_vowels_and_consonants_words(text):
    """
    Count words with equal number of vowels and consonants.

    :param text: The input text.
    """
    words = text.split()
    cleaned_words = [word.strip(string.punctuation) for word in words]
    vowels = ['a', 'A', 'e', 'E', 'i', 'I', 'o', 'O', 'u', 'U', 'y', 'Y']

    appropriate_words = list(
        filter(lambda word: len(word) == 2 * len(list(filter(lambda char: char in vowels, word))), cleaned_words))
    print(f"Words with equal vowels and consonants:\n{appropriate_words}")

    indexes = [i for i, word in enumerate(cleaned_words) if word in appropriate_words]
    print(f"Indexes:\n{indexes}")


def print_decrease_len_words(text):
    """
    Print words sorted by decreasing length.

    :param text: The input text.
    """
    words = text.split()
    cleaned_words = [word.strip(string.punctuation) for word in words]
    decrease_len_words = sorted(cleaned_words, key=lambda elem: len(elem), reverse=True)
    print(f"Words by length decrease:\n{decrease_len_words}")