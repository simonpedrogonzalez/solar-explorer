import json

def find_unique_objects(file1, file2):
    with open(file1, 'r') as f1:
        bodies1 = json.load(f1)
    with open(file2, 'r') as f2:
        bodies2 = json.load(f2)

    names1 = {obj['name'] for obj in bodies1}
    names2 = {obj['englishName'] for obj in bodies2}
    
    def transform_name(name):
        import re
        pattern = r"S/(\d{4})\s([A-Z])\s(\d+)"
        match = re.match(pattern, name)
        if match:
            return f"S{match.group(1)}_{match.group(2)}{match.group(3)}"
        return name  

    names2Original = [name for name in names2]
    names2 = {transform_name(name) for name in names2}

    only_in_bodies1 = names1 - names2
    only_in_bodies2 = names2 - names1

    unique_to_bodies1 = [obj for obj in bodies1 if obj['name'] in only_in_bodies1]
    unique_to_bodies2 = [obj for obj in bodies2 if obj['englishName'] in only_in_bodies2]
    unique_to_bodies2Original = [objOrig for (objOrig, obj) in zip(names2Original, bodies2) if objOrig in only_in_bodies2]

    return unique_to_bodies1, unique_to_bodies2

file1_path = 'test/bodies.json'
file2_path = 'test/bodies2.json'

unique_to_bodies1, unique_to_bodies2 = find_unique_objects(file1_path, file2_path)

print("Objects only in bodies.json:")
for obj in unique_to_bodies1:
    print(obj.get('name'))

print("\nObjects only in bodies2.json:")
for obj in unique_to_bodies2:
    print(obj.get('englishName') + ' ' + obj.get('bodyType'))

print("\nNumber of objects only in bodies.json:", len(unique_to_bodies1))
print("Number of objects only in bodies2.json:", len(unique_to_bodies2))