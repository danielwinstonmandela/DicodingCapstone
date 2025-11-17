"""
Setup script for Dicoding Capstone Use Case 4
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="dicoding-capstone-usecase4",
    version="1.0.0",
    author="Daniel Winston Mandela",
    description="Machine Learning Application for Dicoding Capstone Use Case 4",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/danielwinstonmandela/DicodingCapstone",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Education",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "dicoding-capstone=main:main",
        ],
    },
)
