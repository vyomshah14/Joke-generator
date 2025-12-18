
from joke_class import JokeManager
from joke_utils import fetching_decorator, format_joke, is_valid_joke, count_jokes_from_log, top_n_from_counts
import sys
import matplotlib.pyplot as plt


jm = JokeManager()

@fetching_decorator
def display_random_and_log():
    try:
        joke_text = jm.get_random_joke()
    except ValueError:
        print("No jokes available. Please add some jokes first.")
        return
    print(joke_text + "\n")
    jm.log_joke(format_joke(joke_text))

def view_all_jokes():
    jokes = jm.show_jokes()
    if not jokes:
        print("No jokes found.")
        return
    print("\n--- All Jokes ---")
    for i, joke in enumerate(jokes):
        print(f"{i}. {joke}")

def add_new_joke():
    new_joke = input("Enter a new joke: ").strip()
    if not is_valid_joke(new_joke):
        print("Invalid joke. Please try again.")
        return
    added = jm.add_joke(format_joke(new_joke))
    if added:
        print("Joke added successfully!")
    else:
        print("Joke already exists.")

def delete_joke():
    jokes = jm.show_jokes()
    if not jokes:
        print("No jokes to delete.")
        return
    view_all_jokes()
    try:
        idx = int(input("Enter index of joke to delete: ").strip())
        removed = jm.remove_joke(idx)
        print(f"Removed: {removed}")
    except ValueError:
        print("Please enter a valid integer index.")
    except Exception as e:
        print("Error:", e)

def show_log():
    log_lines = jm.read_log()
    if not log_lines:
        print("Log is empty.")
        return
    print("\n--- Last 20 Log Entries ---")
    for ln in log_lines[-20:]:
        print(ln)
def show_joke_statistics():
    log_lines = jm.read_log()
    if not log_lines:
        print("No jokes logged yet.")
        return

    counts = count_jokes_from_log(log_lines)
    top = top_n_from_counts(counts, n=5)

    print("\n Joke Statistics (Top Displayed Jokes) ")
    for joke, count in top:
        print(f"{count} times → {joke}")

def plot_joke_frequency():
    log_lines = jm.read_log()
    if not log_lines:
        print("No jokes logged yet.")
        return

    counts = count_jokes_from_log(log_lines)
    if not counts:
        print("No data to plot.")
        return

    jokes = list(counts.keys())
    values = list(counts.values())

    plt.figure()
    plt.barh(jokes, values)
    plt.xlabel("Times Displayed")
    plt.title("Joke Frequency")
    plt.tight_layout()
    plt.show()



def menu():
    while True:
        print("\n--- Random Joke Generator ---")
        print("1. Display random joke")
        print("2. View all jokes")
        print("3. Add a joke")
        print("4. Delete a joke")
        print("5. Show log")
        print("6. Show joke statistics") 
        print("7. Show joke frequency chart")  
        print("0. Exit")


        choice = input("Choose an option: ").strip()

        if choice == "1":
            display_random_and_log()
        elif choice == "2":
            view_all_jokes()
        elif choice == "3":
            add_new_joke()
        elif choice == "4":
            delete_joke()
        elif choice == "5":
            show_log()
        elif choice == "6":
            show_joke_statistics()
        elif choice == "7":
            plot_joke_frequency()
        elif choice == "0":
            print("Goodbye!")
            sys.exit()
        else:
            print("Invalid choice. Try again.")

if __name__ == "__main__":
    menu()
