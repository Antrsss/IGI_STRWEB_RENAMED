"""
Task 1: Arcsin Series Calculation
Version: 1.0
Developer: Darya Zgirskaya
Date: 2025-03-16
"""

import math


def arcsin_series(x, eps=1e-6, max_iter=500):
    """
    Calculate the arcsin of x using a series expansion.

    :param x: The value to calculate arcsin for (must be between -1 and 1).
    :param eps: The precision of the calculation.
    :param max_iter: Maximum number of iterations.
    :return: A tuple containing the calculated value and the number of terms used.
    """
    result = 0.0
    n = 0
    while n < max_iter:
        temp = (math.factorial(2 * n) / (4**n * (math.factorial(n))**2 * (2*n + 1))) * x**(2*n + 1)
        result += temp
        if abs(temp) < eps:
            break
        n += 1
    return result, n