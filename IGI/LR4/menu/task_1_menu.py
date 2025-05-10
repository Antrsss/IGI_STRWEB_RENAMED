from task_1.task_1 import Product, ProductManager

def task1_menu():
    while True:
        print("\nProduct manager menu:")
        print("1. Create std products:")
        print("2. Add new product")
        print("3. Show products with increased price")
        print("4. Save to CSV")
        print("5. Save to pickle")
        print("0. Back")

        choice = input("Choose action: ")

        if choice == "1":
            product_1 = Product("Ball", 20, 25)
            product_2 = Product("Doll", 10, 10)
            product_3 = Product("Umbrella", 30, 32)
            product_4 = Product("Fork", 3, 2.5)
            product_5 = Product("Spoon", 3, 3)

            product_dict = {
                product_1.name: product_1,
                product_2.name: product_2,
                product_3.name: product_3,
                product_4.name: product_4,
                product_5.name: product_5
            }

            product_manager = ProductManager(product_dict)
            print("Std products created!")

        elif choice == "2":
            try:
                product_manager.input_product()
                user_product = product_manager.get_user_product()
                print(f"\nAdded product info:")
                print(f"Name: {user_product.name}")
                print(f"Price changed: {'Yes' if user_product.if_price_will_increase() else 'No'}")
                if user_product.if_price_will_increase():
                    print(f"Change percent: {user_product.calculate_percent()}%")
            except Exception as e:
                print(f"Error: {e}")

        elif choice == "3":
            increased_prices = product_manager.search_products_with_increased_price()
            for p in increased_prices.values():
                print(f"{p.name}: price increased by {p.calculate_percent()}%")

        elif choice == "4":
            product_manager.save_to_csv("task_1_files/products.csv")
            print("Products saved в CSV!")

        elif choice == "5":
            product_manager.save_to_pickle("task_1_files/products.pkl")
            print("Products saved to pickle!")

        elif choice == "0":
            break

        else:
            print("Invalid input, please try again")