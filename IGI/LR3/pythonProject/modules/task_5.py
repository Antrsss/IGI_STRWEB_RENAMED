"""
Task 5: List Operations
Version: 1.0
Developer: Darya Zgirskaya
Date: 2025-03-16
"""


def count_positive_even_numbers(numbers):
    """
    Count the number of positive even numbers in the list.

    :param numbers: The list of numbers.
    :return: The count of positive even numbers.
    """
    count = 0
    for num in numbers:
        if num > 0 and num % 2 == 0:
            count += 1
    return count


def sum_after_last_zero(numbers):
    """
    Calculate the sum of elements after the last zero in the list.

    :param numbers: The list of numbers.
    :return: The sum of elements after the last zero.
    """
    try:
        last_zero_index = (len(numbers)-1) - numbers[::-1].index(0)
        total_sum = sum(numbers[last_zero_index + 1:])
        return total_sum
    except ValueError:
        return 0