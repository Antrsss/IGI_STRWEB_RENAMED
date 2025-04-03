"""
Task 2: Sum of Every Second Number
Version: 1.0
Developer: Darya Zgirskaya
Date: 2025-03-16
"""


def count_second_numbers():
    """
    Sum every second number entered by the user until 0 is entered.

    :return: The sum of every second number.
    """
    result = 0.0
    numbers_count = 0
    x = 1
    try:
        while x != 0:
            x = int(input("Input a number:\n"))
            numbers_count += 1
            if numbers_count % 2 == 0:
                result += x
                return result
    except ValueError:
        print("Error: incorrect data. Please write int numbers!")