import requests

api_url = "https://api.le-systeme-solaire.net/rest/bodies/"

response = requests.get(api_url)

if response.status_code == 200:
    data = response.json()
    bodies = data.get("bodies", [])
    
    print("Available Solar System Objects:")
    for body in bodies:
        print(body.get("name"))
else:
    print(f"Failed to fetch data. Status code: {response.status_code}")
