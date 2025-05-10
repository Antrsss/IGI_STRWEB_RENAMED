from menu import task1_menu, task2_menu, task3_menu, task4_menu, task5_menu


def display_menu():
    print("\nMain menu:")
    print("1. Product manager")
    print("2. File manager")
    print("3. arcsin")
    print("4. Pentagon")
    print("5. Random matrix")
    print("0. Exit")


def main():
    while True:
        display_menu()
        choice = input("Choose task (0-5): ")

        if choice == "1":
            task1_menu()
        elif choice == "2":
            task2_menu()
        elif choice == "3":
            task3_menu()
        elif choice == "4":
            task4_menu()
        elif choice == "5":
            task5_menu()
        elif choice == "0":
            print("Exiting program...")
            break
        else:
            print("Invalid input, please try again")


if __name__ == "__main__":
    main()