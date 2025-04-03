"""
Task 3: Count Digits in a String
Version: 1.0
Developer: Darya Zgirskaya
Date: 2025-03-16
"""


def count_digits():
    """
    Count the number of digits in a string entered by the user.

    :return: The count of digits in the string.
    """
    digits_count = 0
    digits_list = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    string = input("Input a string:\n")
    for char in string:
        if char in digits_list:
            digits_count += 1
    return digits_count