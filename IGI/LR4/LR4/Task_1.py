import csv
import pickle


class Product:
    def __init__(self, name: str, old_price: float, new_price: float):
        self.name = name
        self.old_price = old_price
        self.new_price = new_price

    def if_price_will_increase(self):
        """Returns True if new price > old price"""
        return self.old_price < self.new_price

    def calculate_percent(self):
        """Returns percent of price change (2 digits after dot)"""
        return round(100 * self.new_price / self.old_price - 100, 2)


class ProductManager:
    __user_product: Product

    def __init__(self, products: dict):
        """Creates product dictionary to do operations with"""
        self.products = products

    def input_product(self):
        """Requests product's name, old price & new price by console input. Creates such product"""
        input_name = input("Write product name: ")
        input_old_price = float(input("Write start price: "))
        input_new_price = float(input("Write current price: "))
        self.__user_product = Product(input_name, input_old_price, input_new_price)

    def get_user_product(self):
        """Returns product that user has written in console"""
        return self.__user_product

    def add_product(self, product: Product):
        """Adds new product to products dictionary"""
        self.products[product.name] = product

    def search_products_with_increased_price(self):
        """Returns dict of products with increased prices (new_price > old_price)"""
        that_products = dict()

        for product in self.products.values():
            if product.if_price_will_increase():
                that_products[product.name] = product

        return that_products

    def sort_products_by_percent(self):
        """Sorts products by percent of price change (increased)"""
        sorted_products = sorted(self.products, key=lambda p: p.calculate_percent())
        return sorted_products

    def save_to_csv(self, filename: str):
        """Serializes products to pickle-file"""
        with open(filename, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['name', 'old_price', 'new_price'])
            for p in self.products.values():
                writer.writerow([p.name, p.old_price, p.new_price])

    def save_to_pickle(self, filename: str):
        """Serializes products to pickle-file"""
        with open(filename, 'wb') as f:
            for p in self.products.values():
                pickle.dump(p, f)


if __name__ == "__main__" :
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

    increased_prices = product_manager.search_products_with_increased_price()
    for p in increased_prices.values():
        print(f"{p.name}: price increased by {p.calculate_percent()}%")

    product_manager.save_to_csv("task_1_files/products.csv")
    product_manager.save_to_pickle("task_1_files/products.pkl")

    product_manager.input_product()
    user_product = product_manager.get_user_product()

    print(f"\nInfo about written product:")
    print(f"Name: {user_product.name}")
    print(f"Price changed: {'Yes' if user_product.if_price_will_increase() else 'No'}")

    if user_product.if_price_will_increase():
        print(f"Percent of change: {user_product.calculate_percent()}%")