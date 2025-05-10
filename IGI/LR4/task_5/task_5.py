"""
Task 4: NumPy and random int matrix
Version: 1.1
Developer: Darya Zgirskaya
Date: 2025-04-09
"""

import numpy as np
from input.input_check import input_int


class MatrixOperations:
    random_matrix: [[int]]

    @classmethod
    def create_random_matrix(cls, n: int, m: int, min_val=0, max_val=100):
        """
        Creates matrix with n rows and m columns
        filled with random int numbers
        :param n: rows count
        :param m: columns count
        :param min_val: min element that can be
        :param max_val: max element that can be
        :return:
        """
        cls.random_matrix = np.random.randint(min_val, max_val + 1, size=(n, m))
        return cls.random_matrix

    @classmethod
    def sort_matrix_by_last_column(cls):
        """
        Sorts matrix by elements of the last column (descending)
        :return: None
        """
        sorted_indices = np.argsort(cls.random_matrix[:, -1])[::-1]
        cls.random_matrix = cls.random_matrix[sorted_indices]

    @classmethod
    def calculate_average_of_last_column_std(cls):
        """
        Calculates arithmetic average of the last column elements with NumPy
        :return: float rounded to 2 digits after comma
        """
        return round(np.mean(cls.random_matrix[:, -1]), 2)

    @classmethod
    def calculate_average_of_last_column(cls):
        """
        Calculates arithmetic average of the last column elements manually
        :return: float rounded to 2 digits after comma
        """
        last_column = cls.random_matrix[:, -1]
        return round(sum(last_column) / len(last_column), 2)


if __name__ == "__main__":
    n = input_int("Input rows number: ")
    m = input_int("Input columns number: ")
    MatrixOperations.create_random_matrix(n, m, 10)

    print("Matrix:")
    for row in MatrixOperations.random_matrix:
        print(row)

    print("Sorted by last column matrix (std):")
    MatrixOperations.sort_matrix_by_last_column()
    for row in MatrixOperations.random_matrix:
        print(row)

    MatrixOperations.create_random_matrix(n, m, 10)
    print("\nMatrix:")
    for row in MatrixOperations.random_matrix:
        print(row)
    print("Sorted by last column matrix (manually):")
    MatrixOperations.sort_matrix_by_last_column()
    for row in MatrixOperations.random_matrix:
        print(row)