"""
Utility functions for user input handling.
Version: 1.0
Developer: Darya Zgirskaya
Date: 2025-03-16
"""

from utils.decorator import retry_on_error


@retry_on_error()
def get_user_choice(min_val, max_val):
    """
    Get a valid user choice within a specified range.

    :param min_val: Minimum valid choice.
    :param max_val: Maximum valid choice.
    :return: The user's choice.
    """
    while True:
        choice = int(input(f"Enter your choice ({min_val}-{max_val}): "))
        if min_val <= choice <= max_val:
            return choice
        else:
            print(f"Please enter a number between {min_val} and {max_val}.")


def get_float_input(prompt, min_val=None, max_val=None):
    """
    Get a valid float input from the user within a specified range.

    :param prompt: The prompt message.
    :param min_val: Minimum valid value.
    :param max_val: Maximum valid value.
    :return: The user's input as a float.
    """
    while True:
        try:
            value = float(input(prompt))
            if (min_val is None or value >= min_val) and (max_val is None or value <= max_val):
                return value
            else:
                print(f"Please enter a value between {min_val} and {max_val}.")
        except ValueError:
            print("Invalid input. Please enter a number.")


def input_float_list():
    """
    Prompt the user to input a list of float numbers.

    :return: A list of float numbers.
    """
    while True:
        try:
            user_input = input("Write list elements by space: ")
            numbers = list(map(float, user_input.split()))
            return numbers
        except ValueError:
            print("Error: incorrect data. Please write list of float numbers!")