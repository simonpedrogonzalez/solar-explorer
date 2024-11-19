import json

# Load data from JSON files
def load_json(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

# Save data to a JSON file
def save_json(data, file_path):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)

