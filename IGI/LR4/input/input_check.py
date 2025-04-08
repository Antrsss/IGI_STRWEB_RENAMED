

def input_float(prompt: str, min_val: float = 0.0) -> float:
    """Validate float input"""
    while True:
        try:
            value = float(input(prompt))
            if value <= min_val:
                print(f"Value must be greater than {min_val}")
                continue
            return value
        except ValueError:
            print("Please enter a valid number")