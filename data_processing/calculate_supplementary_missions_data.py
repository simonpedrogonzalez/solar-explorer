import json
from datetime import datetime

### Example data from missions.json
# {
#         "name": "JWST",
#         "primary_id": "S50463",
#         "primary_type": "P   D",
#         "launch_date": "2021-12-25T00:00:00.000",
#         "pieces": [
#             {
#                 "name": "Ariane 5 L5114 EPC",
#                 "id": "A09926",
#                 "type": "R1--S--",
#                 "mass": "14500",
#                 "dry_mass": "14500",
#                 "total_mass": "14500",
#                 "length": "30.5",
#                 "diameter": "5.5",
#                 "span": "30.5",
#                 "shape": "Cyl",
#                 "dest": "2W 1S?",
#                 "events": [
#                     {
#                         "id": "A09926",
#                         "parent": null,
#                         "primary": "Earth",
#                         "sdate": "2021-12-25T12:28:48.000",
#                         "sdate_prec": "second",
#                         "ddate": "2021-12-25T11:59:00.000",
#                         "ddate_prec": "minutes_approx",
#                         "status": "S",
#                         "dest": "2W 1S?",
#                         "odate": "2021-12-25T00:00:00.000",
#                         "odate_prec": "day",
#                         "perigee": "-500?",
#                         "apogee": "230?",
#                         "inc": "4.00?",
#                         "oporbit": "SO"
#                     }
#                 ]
#             },
#             {
#                 "name": "Ariane 5 L5114 ESC-D",
#                 "id": "S50464",
#                 "type": "R2  D",
#                 "mass": "5000    ?",
#                 "dry_mass": "5000    ?",
#                 "total_mass": "5000    ?",
#                 "length": "7.0",
#                 "diameter": "5.5",
#                 "span": "7.0",
#                 "shape": "Cyl",
#                 "dest": "D01092",
#                 "events": [
#                     {
#                         "id": "S50464",
#                         "parent": "A09926",
#                         "primary": "Earth",
#                         "sdate": "2021-12-25T12:44:58.000",
#                         "sdate_prec": "second",
#                         "ddate": "2021-12-26T02:23:00.000",
#                         "ddate_prec": "minute",
#                         "status": "DSO",
#                         "dest": "D01092",
#                         "odate": "2021-12-25T00:00:00.000",
#                         "odate_prec": "day",
#                         "perigee": "173",
#                         "apogee": "2280262",
#                         "inc": "4.76",
#                         "oporbit": "CLO"
#                     },
#                     {
#                         "id": "D01092",
#                         "parent": null,
#                         "primary": "Earth",
#                         "sdate": "2021-12-26T02:23:00.000",
#                         "sdate_prec": "minute",
#                         "ddate": "2022-01-12T14:59:00.000",
#                         "ddate_prec": "minutes_approx",
#                         "status": "EO",
#                         "dest": "HCO",
#                         "odate": "2021-12-25T00:00:00.000",
#                         "odate_prec": "day",
#                         "perigee": "173",
#                         "apogee": "2280262",
#                         "inc": "4.76",
#                         "oporbit": "CLO"
#                     },
#                     {
#                         "id": "D01092",
#                         "parent": "Earth",
#                         "primary": "Sun",
#                         "sdate": "2022-01-12T14:59:00.000",
#                         "sdate_prec": "minutes_approx",
#                         "ddate": null,
#                         "ddate_prec": null,
#                         "status": "O",
#                         "dest": null,
#                         "odate": "2023-01-01T00:00:00.000",
#                         "odate_prec": "day",
#                         "perigee": "1.000",
#                         "apogee": "1.053",
#                         "inc": "0.29",
#                         "oporbit": "HCO"
#                     }
#                 ]
#             },
#             {
#                 "name": "JWST",
#                 "id": "S50463",
#                 "type": "P   D",
#                 "mass": "6161",
#                 "dry_mass": "5861",
#                 "total_mass": "6161",
#                 "length": "8.0",
#                 "diameter": "4.5",
#                 "span": "21.2",
#                 "shape": "Box+dish+panels",
#                 "dest": "D01093",
#                 "events": [
#                     {
#                         "id": "S50463",
#                         "parent": "S50464",
#                         "primary": "Earth",
#                         "sdate": "2021-12-25T12:47:14.000",
#                         "sdate_prec": "second",
#                         "ddate": "2021-12-26T02:23:00.000",
#                         "ddate_prec": "minute",
#                         "status": "DSO",
#                         "dest": "D01093",
#                         "odate": "2021-12-25T00:00:00.000",
#                         "odate_prec": "day",
#                         "perigee": "315",
#                         "apogee": "1048000",
#                         "inc": "4.17",
#                         "oporbit": "CLO"
#                     },
#                     {
#                         "id": "D01093",
#                         "parent": null,
#                         "primary": "Earth",
#                         "sdate": "2021-12-26T02:23:00.000",
#                         "sdate_prec": "minute",
#                         "ddate": "2022-01-24T19:00:00.000",
#                         "ddate_prec": "minute",
#                         "status": "EO",
#                         "dest": "SEL2",
#                         "odate": "2021-12-25T00:00:00.000",
#                         "odate_prec": "day",
#                         "perigee": "364",
#                         "apogee": "1060000",
#                         "inc": "4.20",
#                         "oporbit": "CLO"
#                     },
#                     {
#                         "id": "D01093",
#                         "parent": "Earth",
#                         "primary": "SEL2",
#                         "sdate": "2022-01-24T19:00:00.000",
#                         "sdate_prec": "minute",
#                         "ddate": null,
#                         "ddate_prec": null,
#                         "status": "O",
#                         "dest": null,
#                         "odate": "2022-01-25T00:00:00.000",
#                         "odate_prec": "day",
#                         "perigee": "0",
#                         "apogee": "0",
#                         "inc": "0.00",
#                         "oporbit": "PCO"
#                     }
#                 ]
#             }
#         ],
#         "events": [
#             {
#                 "id": "S50463",
#                 "parent": "S50464",
#                 "primary": "Earth",
#                 "sdate": "2021-12-25T12:47:14.000",
#                 "sdate_prec": "second",
#                 "ddate": "2021-12-26T02:23:00.000",
#                 "ddate_prec": "minute",
#                 "status": "DSO",
#                 "dest": "D01093",
#                 "odate": "2021-12-25T00:00:00.000",
#                 "odate_prec": "day",
#                 "perigee": "315",
#                 "apogee": "1048000",
#                 "inc": "4.17",
#                 "oporbit": "CLO"
#             },
#             {
#                 "id": "D01093",
#                 "parent": null,
#                 "primary": "Earth",
#                 "sdate": "2021-12-26T02:23:00.000",
#                 "sdate_prec": "minute",
#                 "ddate": "2022-01-24T19:00:00.000",
#                 "ddate_prec": "minute",
#                 "status": "EO",
#                 "dest": "SEL2",
#                 "odate": "2021-12-25T00:00:00.000",
#                 "odate_prec": "day",
#                 "perigee": "364",
#                 "apogee": "1060000",
#                 "inc": "4.20",
#                 "oporbit": "CLO"
#             },
#             {
#                 "id": "D01093",
#                 "parent": "Earth",
#                 "primary": "SEL2",
#                 "sdate": "2022-01-24T19:00:00.000",
#                 "sdate_prec": "minute",
#                 "ddate": null,
#                 "ddate_prec": null,
#                 "status": "O",
#                 "dest": null,
#                 "odate": "2022-01-25T00:00:00.000",
#                 "odate_prec": "day",
#                 "perigee": "0",
#                 "apogee": "0",
#                 "inc": "0.00",
#                 "oporbit": "PCO"
#             }
#         ],
#         "dests": [
#             "2W 1S?",
#             "D01092",
#             "D01093"
#         ]
#     },



with open("../project/files/bodies.json") as f:
    bodies = json.load(f)
with open("../project/files/missions.json") as f:
    missions = json.load(f)

bodies_dict = {body["name"]: body for body in bodies}

for mission in missions:
    mission["num_pieces"] = len(mission["pieces"])
    mission["total_mass"] = sum(float(str.strip(str.replace(piece["total_mass"], "?", ""))) for piece in mission["pieces"])
    mission["destination"] = (mission["events"][-1]["dest"] if mission["events"][-1]["dest"] is not None else mission["events"][-1]["primary"]) \
        if len(mission["events"]) > 0 else None
    mission["launch_location"] = mission["events"][0]["primary"] if len(mission["events"]) > 0 else None
    # Calculate distance travelled by the payload
    mission["distance_travelled"] = 0
    # TODO

    # Calculate total mission duration
    mission["duration"] = 0
    # TODO

with open("../project/files/missions.json", "w") as f:
    json.dump(missions, f, indent=4)

