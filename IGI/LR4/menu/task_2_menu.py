from task_2.task_2 import FileManager


def task2_menu():
    while True:
        print("\nFile manager menu:")
        print("1. Process file")
        print("2. Check passwords")
        print("0. Back")

        choice = input("Choose action: ")

        if choice == "1":
            try:
                my_file_manager = FileManager('task_2_files/text.txt', 'task_2_files/new_text.txt')
                file_text = my_file_manager.read_file()

                new_file_text = FileManager.print_upper_digits_words(file_text) + '\n'
                new_file_text += FileManager.count_upper_words(file_text) + '\n'
                new_file_text += FileManager.find_longest_l_word(file_text) + '\n'
                new_file_text += FileManager.print_duplicate_words(file_text) + '\n'

                my_file_manager.save_to_file(new_file_text)
                file_info = my_file_manager.zip_file_with_info('task_2_files/archive.zip')

                print("zip info:")
                for key, value in file_info.items():
                    print(f"{key:>20}: {value}")

                print(FileManager.analyze_sentences(file_text))
                print(f"Smiles' number: {FileManager.count_smileys(file_text)}")
            except Exception as e:
                print(f"Error: {e}")

        elif choice == "2":
            passwords = ["C00l_Pass", "SupperPas1", "Cool_pass", "C00l"]
            for pwd in passwords:
                print(f"{pwd}: {FileManager.check_if_password_is_safe(pwd)}")

        elif choice == "0":
            break

        else:
            print("Invalid input, please try again")