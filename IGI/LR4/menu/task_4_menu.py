from input import input_float, input_color
from task_4 import Pentagon
import matplotlib.pyplot as plt


def task4_menu():
    while True:
        print("\nPentagon menu:")
        print("1. Create pentagon")
        print("0. Back")

        choice = input("Choose action: ")

        if choice == "1":
            try:
                side = input_float("Enter side size (> 0): ")

                color = input_color("Enter color (blue, #FF00FF): ")
                label = input("Enter pentagon label: ")

                pentagon = Pentagon(side, color)
                pentagon.set_label(label)

                print("\nPentagon info:")
                print(pentagon.to_string())

                fig = pentagon.draw()
                filename = f"task_4/task_4_files/{label}.png"
                fig.savefig(filename)
                print(f"\nPentagon saved to {filename}")
                plt.show()
            except Exception as e:
                print(f"Error: {e}")

        elif choice == "0":
            break

        else:
            print("Invalid input, please try again")