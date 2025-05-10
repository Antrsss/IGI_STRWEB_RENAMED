def input_float(user_input: str, min_value: float = 0.0):
    """Validate float input (float > 0.0)"""
    while True:
        try:
            value = float(input(user_input))
            if value <= min_value:
                print(f"Value must be greater than {min_value}")
                continue
            return value
        except ValueError:
            print("Please enter a valid float number")


def input_x_list(user_input: str, list_size: int) -> list[float]:
    """Validate float input list"""
    x_list = []
    while len(x_list) < list_size:
        try:
            value = float(input(user_input))
            x_list.append(value)
        except ValueError:
            print("Please enter a valid float number")
    return x_list

def input_x(user_input: str):
    """Validate float input"""
    while True:
        try:
            value = float(input(user_input))
            if value > 1 or value < -1:
                raise ValueError("x must be >= -1 and <= 1")
            return value
        except ValueError:
            print("Please enter a valid float number (-1 <= x <= 1)")


def input_int(user_input: str, min_value: int = 0):
    """Validate int input (int > 0)"""
    while True:
        try:
            value = int(input(user_input))
            if value <= min_value:
                print(f"Value must be greater than {min_value}")
                continue
            return value
        except ValueError:
            print("Please enter a valid int number")


import re


def input_color(user_input: str):
    """
    Checks if string is a color by:
    - Color name ('red', 'blue', etc.)
    - HEX ('#FF00FF', '#abc', etc.)

    Returns color if it's valid
    """
    color_names = {
        'red', 'green', 'blue', 'yellow', 'black', 'white',
        'orange', 'purple', 'pink', 'gray', 'grey', 'cyan',
        'magenta', 'brown', 'lime', 'maroon', 'navy', 'olive',
        'silver', 'teal', 'aqua', 'fuchsia', 'coral', 'indigo',
        'violet', 'beige', 'gold', 'khaki', 'lavender', 'salmon'
    }

    while True:
        try:
            color = input(user_input)
            if color.lower() in color_names:
                return color
            if re.fullmatch(r'^#([A-Fa-f0-9]{3})$', color):
                return color
            raise ValueError(
                "Invalid color format. Please enter a valid color name or HEX code (e.g., 'red', '#FF00FF', '#abc')")
        except ValueError:
            print("Please enter a valid color (name or HEX)")