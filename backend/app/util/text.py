import re


def camel_to_snake_case(string: str) -> str:
    """Convert string from CamelCase to snake_case"""
    return re.sub(r"(?<=[a-z])([A-Z])", r"_\1", string).lower()
