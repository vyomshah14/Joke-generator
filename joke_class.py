
from pathlib import Path
from datetime import datetime
import random
from typing import List, Tuple

class JokeManager:

    def __init__(self, jokes_file: str = "jokes.txt", log_file: str = "joke_log.txt"):
        self.jokes_file = Path(jokes_file)
        self.log_file = Path(log_file)
        self.jokes: List[str] = self._load_jokes()

    def _load_jokes(self) -> List[str]:
        if not self.jokes_file.exists():
            return []
        with self.jokes_file.open("r", encoding="utf-8") as f:
            lines = [line.strip() for line in f.readlines()]
        return [line for line in lines if line]

    def save_jokes(self) -> None:
        if self.jokes_file.parent and not self.jokes_file.parent.exists():
            self.jokes_file.parent.mkdir(parents=True, exist_ok=True)
        with self.jokes_file.open("w", encoding="utf-8") as f:
            for joke in self.jokes:
                f.write(joke.rstrip() + "\n")
    def get_random_joke(self) -> str:
        if not self.jokes:
            raise ValueError("No jokes available. Please add some jokes first.")
        return random.choice(self.jokes)

    def log_joke(self, joke_text: str) -> None:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        entry = f"{timestamp} - {joke_text}\n"
        if self.log_file.parent and not self.log_file.parent.exists():
            self.log_file.parent.mkdir(parents=True, exist_ok=True)
        with self.log_file.open("a", encoding="utf-8") as f:
            f.write(entry)
    def add_joke(self, joke_text: str) -> bool:
        if not isinstance(joke_text, str):
            return False
        clean = joke_text.strip()
        if not clean:
            return False
        if clean in self.jokes:
            return False  # duplicate
        self.jokes.append(clean)
        self.save_jokes()
        return True

    def remove_joke(self, index: int) -> str:
        if not isinstance(index, int):
            raise TypeError("Index must be an integer.")
        if index < 0 or index >= len(self.jokes):
            raise IndexError("Joke index out of range.")
        removed = self.jokes.pop(index)
        self.save_jokes()
        return removed

    def show_jokes(self) -> List[str]:
        return list(self.jokes)

    def read_log(self) -> List[str]:
        if not self.log_file.exists():
            return []
        with self.log_file.open("r", encoding="utf-8") as f:
            lines = [line.rstrip("\n") for line in f.readlines()]
        return [ln for ln in lines if ln]

    def parse_log_entries(self) -> List[Tuple[str, str]]:
        parsed = []
        for line in self.read_log():
            if " - " in line:
                ts, joke = line.split(" - ", 1)
                parsed.append((ts.strip(), joke.strip()))
            else:
                parsed.append(("", line.strip()))
        return parsed
