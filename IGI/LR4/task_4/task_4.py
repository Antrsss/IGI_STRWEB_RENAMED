"""
Task 4: Figure abstract class with visualization
Version: 1.1
Developer: Darya Zgirskaya
Date: 2025-04-08
"""

import math
import matplotlib.pyplot as plt
from abc import ABC, abstractmethod


class GeometricFigure(ABC):
    @abstractmethod
    def calculate_area(self):
        print("Calculating area...")
        pass

    @abstractmethod
    def draw(self):
        print("Drawing figure...")
        pass


class FigureColor:
    def __init__(self, color: str):
        self._color = color

    @property
    def color(self):
        """Color property"""
        return self._color

    @color.setter
    def color(self, color: str):
        """Color setter"""
        self._color = color


class FigureInfoMixin:
    """Mixin providing basic figure information functionality"""

    @property
    def figure_type(self) -> str:
        """Returns the type of the figure"""
        return self.__class__.__name__

    def get_description(self) -> str:
        """Returns basic description of the figure"""
        return f"This is a {self.figure_type} geometric figure"


class Pentagon(GeometricFigure, FigureInfoMixin):
    __name = "Pentagon"
    __label = "Pentagon"

    def __init__(self, a: float, color: str):
        self.__pentagon_color = FigureColor(color)
        self.__a = a

    def calculate_area(self):
        """Calculates pentagon area"""
        super().calculate_area()
        return 5 * self.__a ** 2 / (4 * math.tan(math.pi / 5))

    def to_string(self):
        """Returns a string with pentagon parameters: side, color, area"""
        area = self.calculate_area()
        return "Pentagon side: {side}\nPentagon color: {color}\nPentagon area: {area:.2f}".format(
            side=self.__a,
            color=self.__pentagon_color.color,
            area=area
        )

    @classmethod
    def get_name(cls):
        """Returns class name"""
        return cls.__name

    def set_label(self, text: str):
        """Sets label text for the figure"""
        self.__label = text

    def draw(self):
        """Draws pentagon with matplotlib"""
        super().draw()
        vertices = []
        for i in range(5):
            angle = 2 * math.pi * i / 5
            x = self.__a * math.cos(angle)
            y = self.__a * math.sin(angle)
            vertices.append((x, y))

        vertices.append(vertices[0])

        x, y = zip(*vertices)

        fig, ax = plt.subplots(figsize=(8, 8))
        ax.set_aspect('equal')

        ax.fill(x, y, color=self.__pentagon_color.color, alpha=0.5)
        ax.plot(x, y, 'k-', linewidth=2)

        ax.text(0, -self.__a * 1.2, self.__label,
                ha='center', va='center', fontsize=12)

        plt.title(f"{self.__name}\nArea: {self.calculate_area():.2f}")

        return fig