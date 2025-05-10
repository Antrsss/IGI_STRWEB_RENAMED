"""
Task 3: Arcsin Series Calculation (classes)
Version: 1.0
Developer: Darya Zgirskaya
Date: 2025-04-07
"""

import math
import matplotlib.pyplot as plt
from collections import Counter
from input.input_check import input_x, input_x_list, input_int


class SeriesOperations:
    series: list[float]

    @classmethod
    def arcsin_series(cls, x: float, eps=1e-6, max_iter=500):
        """
        Calculate the arcsin of x using a series expansion.

        :param x: The value to calculate arcsin for (must be between -1 and 1).
        :param eps: The precision of the calculation.
        :param max_iter: Maximum number of iterations.
        :return: A tuple containing the calculated value and the number of terms used.
        """
        cls.series = []
        result = 0.0
        n = 0
        while n < max_iter:
            temp = (math.factorial(2 * n) / (4 ** n * (math.factorial(n)) ** 2 * (2 * n + 1))) * x ** (2 * n + 1)
            cls.series.append(temp)
            result += temp
            if abs(temp) < eps:
                break
            n += 1
        return result, n

    @classmethod
    def arithmetic_average(cls):
        """Returns arithmetic average of series"""
        if not cls.series:
            return 0.0
        return sum(cls.series) / len(cls.series)

    @classmethod
    def series_median(cls):
        """Returns the median of series"""
        if not cls.series:
            return 0.0

        sorted_series = sorted(cls.series)
        n = len(sorted_series)
        if n % 2 == 1:
            return sorted_series[n // 2]
        else:
            return (sorted_series[n // 2] + sorted_series[n // 2 + 1]) / 2

    @classmethod
    def series_mod(cls):
        """Returns the mode of series"""
        if not cls.series:
            return 0.0

        counts = Counter(cls.series)
        max_count = max(counts.values())
        modes = [k for k, v in counts.items() if v == max_count]

        if max_count == 1 and len(modes) == len(cls.series):
            return "Mode does not exists^ all elements are unique"
        return modes[0]

    @classmethod
    def series_dispersion(cls):
        """Returns series dispersion"""
        if not cls.series:
            return 0.0

        mean = cls.arithmetic_average()
        return sum((x - mean) ** 2 for x in cls.series) / len(cls.series)


if __name__ == "__main__":

    my_x = input_x("Enter x: ")
    SeriesOperations.arcsin_series(my_x)
    print(f"\nSeries for x = {my_x}:")
    print(f"Arithmetic average: {SeriesOperations.arithmetic_average()}")
    print(f"Median: {SeriesOperations.series_median()}")
    print(f"Mode: {SeriesOperations.series_mod()}")
    print(f"Dispersion: {SeriesOperations.series_dispersion()}")

    size = input_int("\nEnter x number: ")
    x_values = input_x_list("Enter x list: ", size)

    result_list = []
    terms_list = []
    for input_x in x_values:
        x_result, n_terms = SeriesOperations.arcsin_series(input_x)
        result_list.append(x_result)
        terms_list.append(n_terms)

    print("\nResults' table:")
    print("| x     | n  | F(x) (series)      | F(x) (math)     | eps    |")
    print("|-------|----|-----------------|-----------------|--------|")

    i = 0
    for input_x in x_values:
        F_math = math.asin(input_x)
        print(f"| {input_x:.1f}   | {terms_list[i]:2} | {result_list[i]:.8f} | {F_math:.8f} | 1e-6   |")
        i += 1



    series_results = [SeriesOperations.arcsin_series(x)[0] for x in x_values]
    math_results = [math.asin(x) for x in x_values]

    plt.plot(x_values, series_results, 'bo-', label="Taylor series")
    plt.plot(x_values, math_results, 'r--', label="math.asin")
    plt.xlabel("x")
    plt.ylabel("arcsin(x)")
    plt.legend()
    plt.title("Calculating methods comparison arcsin(x)")
    plt.grid()
    plt.show()
    plt.savefig('task_3_files/arcsin_comparison.png')