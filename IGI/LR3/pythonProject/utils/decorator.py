"""
Utility decorators for error handling and retries.
Version: 1.0
Developer: Darya Zgirskaya
Date: 2025-03-16
"""


def retry_on_error(max_retries=3):
    """
    Decorator to retry a function on error.

    :param max_retries: Maximum number of retries.
    :return: The decorated function.
    """

    def decorator(func):
        def wrapper(*args, **kwargs):
            retries = 0
            while retries < max_retries:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    print(f"Error: {e}. Retrying... ({retries + 1}/{max_retries})")
                    retries += 1
            print("Max retries reached. Exiting.")

        return wrapper

    return decorator