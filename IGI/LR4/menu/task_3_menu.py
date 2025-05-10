import math
import matplotlib.pyplot as plt
from input import input_int, input_x, input_x_list
from task_3.task_3 import SeriesOperations


def task3_menu():
    while True:
        print("\nArcsin calculating menu:")
        print("1. Calculate for x")
        print("2. Calculate for list of x")
        print("3. Plot from list of x")
        print("0. Back")

        choice = input("Choose action: ")

        if choice == "1":
            try:
                my_x = input_x("Enter x: ")

                SeriesOperations.arcsin_series(my_x)
                print(f"\nSeries for x = {my_x}:")
                print(f"Arithmetic average: {SeriesOperations.arithmetic_average()}")
                print(f"Median: {SeriesOperations.series_median()}")
                print(f"Mode: {SeriesOperations.series_mod()}")
                print(f"Dispersion: {SeriesOperations.series_dispersion()}")
            except Exception as e:
                print(f"Error: {e}")

        elif choice == "2":
            try:
                size = input_int("\nEnter x number: ")
                x_values = input_x_list("Enter x list: ", size)

                result_list = []
                terms_list = []
                for x in x_values:
                    x_result, n_terms = SeriesOperations.arcsin_series(x)
                    result_list.append(x_result)
                    terms_list.append(n_terms)

                print("\nResults' table:")
                print("| x     | n  | F(x) (series)      | F(x) (math)     | eps    |")
                print("|-------|----|-----------------|-----------------|--------|")

            except Exception as e:
                print(f"Error: {e}")

        elif choice == "3":
            try:
                size = input_int("\nEnter x number: ")
                x_values = input_x_list("Enter x list: ", size)

                result_list = []
                terms_list = []
                for x in x_values:
                    x_result, n_terms = SeriesOperations.arcsin_series(x)
                    result_list.append(x_result)
                    terms_list.append(n_terms)

                i = 0
                for x in x_values:
                    F_math = math.asin(x)
                    print(f"| {x:.1f}   | {terms_list[i]:2} | {result_list[i]:.8f} | {F_math:.8f} | 1e-6   |")
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
            except Exception as e:
                print(f"Ошибка: {e}")

        elif choice == "0":
            break

        else:
            print("Некорректный ввод, попробуйте снова")