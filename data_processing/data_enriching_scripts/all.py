import requests
import json

api_url = "https://api.le-systeme-solaire.net/rest/bodies/"

response = requests.get(api_url)

if response.status_code == 200:
    data = response.json()
    bodies = data.get("bodies", [])
    
    output_file = "solar_system_objects.json"
    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(bodies, file, ensure_ascii=False, indent=4)
    
    print(f"Data for all solar system objects has been saved to '{output_file}'.")
else:
    print(f"Failed to fetch data. Status code: {response.status_code}")
