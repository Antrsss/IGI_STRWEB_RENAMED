"""
LAB_3: Python basics
Version: 1.0
Developer: Darya Zgirskaya
Date: 2025-03-16
"""

from modules.task_1 import arcsin_series
from modules.task_2 import count_second_numbers
from modules.task_3 import count_digits
from modules.task_4 import count_three_char_words, count_equal_vowels_and_consonants_words, print_decrease_len_words
from modules.task_5 import count_positive_even_numbers,sum_after_last_zero
from utils.input_utils import get_user_choice, get_float_input, input_float_list
from utils.generator import generate_sequence


def main():
    while True:
        print("1. Task 1: Arcsin series calculation")
        print("2. Task 2: Sum of every second number")
        print("3. Task 3: Count digits in a string")
        print("4. Task 4: Text analysis")
        print("5. Task 5: List operations")
        print("6. Exit")

        choice = get_user_choice(1, 6)

        if choice == 1:
            x = get_float_input("Write x value (between -1 and 1): ", -1, 1)
            eps = get_float_input("Write epsilon value (e.g., 1e-6): ", 0, 1)
            series_value, n_terms = arcsin_series(x, eps)
            print(f"Arcsin series value: {series_value}")
            print(f"Number of terms: {n_terms}")

        elif choice == 2:
            result = count_second_numbers()
            print(f"Sum of every second number: {result}")

        elif choice == 3:
            result = count_digits()
            print(f"Number of digits in the string: {result}")

        elif choice == 4:
            text = ("So she was considering in her own mind, "
                    "as well as she could, "
                    "for the hot day made her feel very sleepy and stupid, "
                    "whether the pleasure of making a daisy-chain would be "
                    "worth the trouble of getting up and picking the daisies, "
                    "when suddenly a White Rabbit with pink eyes ran close by her.")
            print(f"Three-character words: {count_three_char_words(text)}")
            count_equal_vowels_and_consonants_words(text)
            print_decrease_len_words(text)

        elif choice == 5:
            print("Input 1 to generate sequence of numbers, or 2 to input it by yourself:\n")
            user_choice = get_user_choice(1, 2)

            if user_choice == 1:
                print("Input number of sequence elements:")
                n = get_user_choice(1, 100)
                numbers = list(generate_sequence(n))
            else:
                numbers = input_float_list()

            print(f"Your list:\n{numbers}")
            positive_even_count = count_positive_even_numbers(numbers)
            print("Count of positive even elements: ", positive_even_count)
            sum_after_zero = sum_after_last_zero(numbers)
            print("Elements' sum after the last zero: ", sum_after_zero)

        elif choice == 6:
            print("Exited.")
            break

if __name__ == "__main__":
    main()