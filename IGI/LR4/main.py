from Task_4 import Pentagon
from input.input_check import input_float
import matplotlib.pyplot as plt


def main():
    print("Pentagon Creator")
    print("----------------")

    side = input_float("Enter pentagon side length (> 0): ")
    color = input("Enter fill color (e.g. red, blue, #FF00FF): ")
    label = input("Enter label text for the pentagon: ")

    pentagon = Pentagon(side, color)
    pentagon.set_label(label)

    print("\nPentagon information:")
    print(pentagon.to_string())

    fig = pentagon.draw()

    filename = f"task_4_files/{label}.png"
    fig.savefig(filename)
    print(f"\nPentagon saved to {filename}")

    plt.show()


if __name__ == "__main__":
    main()