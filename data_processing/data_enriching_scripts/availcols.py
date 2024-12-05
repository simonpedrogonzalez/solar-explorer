import requests

api_url = "https://api.le-systeme-solaire.net/rest/bodies/"

response = requests.get(api_url)

if response.status_code == 200:
    data = response.json()
    bodies = data.get("bodies", [])

    if bodies:
        print("Available columns (keys) for the first solar system object:")
        for key in bodies[0].keys():
            print(f"- {key}")
    else:
        print("No objects found in the response.")
else:
    print(f"Failed to fetch data. Status code: {response.status_code}")
