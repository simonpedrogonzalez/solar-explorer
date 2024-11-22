import json

with open("../project/files/bodies.json") as f:
    bodies = json.load(f)
with open("../project/files/missions.json") as f:
    missions = json.load(f)

bodies_dict = {body["name"]: body for body in bodies}

mission_count_dict = {body["name"]: 0 for body in bodies}
dest_count_dict = {body["name"]: 0 for body in bodies}

for mission in missions:
    events = mission["events"]
    mission_bodies = set()
    for event in events:
        mission_bodies.add(event["primary"])
    if len(events) > 0:
        body = events[-1]["primary"] if events[-1]["dest"] is None else events[-1]["dest"]
        if body in dest_count_dict:
            dest_count_dict[body] += 1
    for body in mission_bodies:
        if body in mission_count_dict:
            mission_count_dict[body] += 1

for body in bodies:
    body["mission_orbit_count"] = mission_count_dict[body["name"]]
    body["mission_dest_count"] = dest_count_dict[body["name"]]


with open("../project/files/bodies.json", "w") as f:
    json.dump(bodies, f, indent=4)
