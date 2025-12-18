
from functools import wraps
from typing import List, Dict, Tuple

def fetching_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print("\nFetching a Random Joke…\n")
        return func(*args, **kwargs)
    return wrapper
format_joke = lambda j: " ".join(str(j).strip().split()) if j is not None else ""

def is_valid_joke(joke_text: str) -> bool:
    if not isinstance(joke_text, str):
        return False
    return bool(joke_text.strip())

def count_jokes_from_log(log_lines: List[str]) -> Dict[str, int]:
    counts: Dict[str, int] = {}
    for ln in log_lines:
        if " - " in ln:
            _, joke = ln.split(" - ", 1)
            key = joke.strip()
        else:
            key = ln.strip()
        if not key:
            continue
        counts[key] = counts.get(key, 0) + 1
    return counts

def top_n_from_counts(counts: Dict[str, int], n: int = 10) -> List[Tuple[str, int]]:
    items = sorted(counts.items(), key=lambda item: item[1], reverse=True)
    return items[:n]
