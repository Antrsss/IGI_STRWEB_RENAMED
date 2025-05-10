from input import input_int
from task_5 import MatrixOperations


def task5_menu():
    while True:
        print("\nMatrix operations menu:")
        print("1. Create and sort matrix")
        print("0. Back")

        choice = input("Choose action: ")

        if choice == "1":
            try:
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
            except Exception as e:
                print(f"Error: {e}")

        elif choice == "0":
            break

        else:
            print("Invalid input, please try again")