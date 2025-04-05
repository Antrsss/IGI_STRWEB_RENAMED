"""
Task 1: Product classes
Version: 1.0
Developer: Darya Zgirskaya
Date: 2025-04-05
"""

import re
import string
import zipfile
import os
from datetime import datetime
from collections import defaultdict


class FileManager:

    def __init__(self, read_filename: str, save_filename: str):
        self.__read_filename = read_filename
        self.__save_filename = save_filename

    def read_file(self):
        """Returns str of file text"""
        f = open(self.__read_filename, "r")
        text = f.read()
        f.close()
        return text

    def save_to_file(self, text):
        """Saves text to file"""
        f = open(self.__save_filename, 'w')
        f.write(text)
        f.close()

    def zip_file_with_info(self, zip_name):
        """
        Заархивировать файл и получить информацию о нем в архиве

        :param source_file: Путь к файлу для архивации
        :param zip_name: Имя создаваемого zip-архива
        :return: Информация о заархивированном файле
        """
        # Проверяем, существует ли исходный файл
        if not os.path.exists(self.__save_filename):
            raise FileNotFoundError(f"File {self.__save_filename} not found")

        file_info = {
            'filename': os.path.basename(self.__save_filename),
            'original_size': os.path.getsize(self.__save_filename),
            'compressed_size': None,
            'compression_ratio': None,
            'last_modified': datetime.fromtimestamp(os.path.getmtime(self.__save_filename)),
            'archive_name': zip_name
        }

        # Создаем zip-архив и добавляем файл
        with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.write(self.__save_filename, os.path.basename(self.__save_filename))

            # Получаем информацию о файле в архиве
            file_in_zip = zipf.getinfo(os.path.basename(self.__save_filename))
            file_info['compressed_size'] = file_in_zip.compress_size
            file_info['compression_ratio'] = round(
                (1 - file_in_zip.compress_size / file_info['original_size']) * 100, 2
            )

        return file_info

    @staticmethod
    def analyze_sentences(text: str):
        """Analyzes sentences in text and returns statistics"""
        sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s', text)
        total_sentences = len(sentences)

        sentence_types = defaultdict(int)
        avg_chars = 0
        word_count = 0

        for sentence in sentences:
            if sentence.endswith('.'):
                sentence_types['declarative'] += 1
            elif sentence.endswith('?'):
                sentence_types['interrogative'] += 1
            elif sentence.endswith('!'):
                sentence_types['imperative'] += 1

            clean_sentence = re.sub(r'[^\w\s]', '', sentence)
            avg_chars += len(clean_sentence)
            word_count += len(clean_sentence.split())

        avg_sentence_length = avg_chars / total_sentences if total_sentences > 0 else 0
        avg_word_length = avg_chars / word_count if word_count > 0 else 0

        return {
            'total_sentences': total_sentences,
            'sentence_types': dict(sentence_types),
            'avg_sentence_length': round(avg_sentence_length, 2),
            'avg_word_length': round(avg_word_length, 2)
        }

    @staticmethod
    def count_smileys(text: str):
        """Counts smileys in text according to given pattern"""
        pattern = r'(?<![\w:;])([:;]-*[\(\)\[\]]+)(?![\w:;])'
        smileys = re.findall(pattern, text)
        return len(smileys)

    @staticmethod
    def print_upper_digits_words(text: str):
        """Prints and returns (str) words with combinations of upper case letters and digits"""
        reg = r'\b\w*[A-Z]\d\w*\b|\b\w*\d[A-Z]\w*\b'
        matches = re.findall(reg, text)

        matches_str = "Upper digit words: "
        for m in matches:
            matches_str += m + " "

        print(matches_str)
        return matches_str

    @staticmethod
    def check_if_password_is_safe(password: str):
        """Returns 'Password is safe' if:
            1. Password has >= 8 chars
            2. Char can be an English letter, digit or _
            3. Contains at least 1 upper case letter, 1 lower case letter and 1 digit simultaneously
           else returns False
        """
        reg = r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d_]{8,}$'
        if (re.fullmatch(reg, password) is None):
            ans = "Password is not safe!"
            print(ans)
            return ans

        ans = "Password is safe"
        print(ans)
        return ans

    @staticmethod
    def count_upper_words(text: str):
        """Returns number of words, which consists of upper letters only"""
        reg = r'\b[A-Z]+\b'
        matches = re.findall(reg, text)
        matches_str = f"Number of upper words: {len(matches)}"

        print(matches_str)
        return matches_str

    @staticmethod
    def find_longest_l_word(text: str):
        """Returns the longest word, which starts with 'l' letter"""
        reg = r'\bl\w+\b'
        matches = re.findall(reg, text)
        longest = list(filter(lambda m: len(m), matches))
        longest_str = f"Longest word that starts with 'l' letter: "
        longest_str += longest[0]

        print(longest_str)
        return longest_str

    @staticmethod
    def print_duplicate_words(text: str):
        """Prints all words that occur 2 times or more"""
        words = text.split()
        cleaned_words = [word.strip(string.punctuation) for word in words]
        duplicate_words = set(filter(lambda word: cleaned_words.count(word) > 1, cleaned_words))

        duplicate_words_str = "Duplicate words: "
        for d in duplicate_words:
            duplicate_words_str += d + " "

        print(duplicate_words_str)
        return duplicate_words_str


if __name__ == '__main__':

    my_file_manager = FileManager('task_2_files/text.txt', 'task_2_files/new_text.txt')
    file_text = my_file_manager.read_file()

    new_file_text = FileManager.print_upper_digits_words(file_text) + '\n'

    print("Passwords' check:")
    new_file_text += FileManager.check_if_password_is_safe("C00l_Pass") + '\n'
    new_file_text += FileManager.check_if_password_is_safe("SupperPas1") + '\n'
    new_file_text += FileManager.check_if_password_is_safe("Cool_pass") + '\n'
    new_file_text += FileManager.check_if_password_is_safe("C00l") + '\n'

    new_file_text += FileManager.count_upper_words(file_text) + '\n'

    new_file_text += FileManager.find_longest_l_word(file_text) + '\n'

    new_file_text += FileManager.print_duplicate_words(file_text) + '\n'

    my_file_manager.save_to_file(new_file_text)

    file_info = my_file_manager.zip_file_with_info('task_2_files/archive.zip')
    print("Info about zip file:")
    for key, value in file_info.items():
        print(f"{key:>20}: {value}")

    print(FileManager.analyze_sentences(file_text))
    print(f"Number of smiles: {FileManager.count_smileys(file_text)}")
