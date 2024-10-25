import pandas as pd
import numpy as np
from io import StringIO
from astroquery.jplhorizons import Horizons
import json
from tqdm import tqdm
import requests as req
import tarfile
from datetime import datetime, timedelta
import re


def fit_lstsq(x, y):
    x = np.array([x, np.ones(len(x))]).T
    y = np.array(y)
    m_b = np.linalg.lstsq(x, y, rcond=None)[0]
    return m_b



def fetch_planet_data(new_worlds_df):
    print("Fetching Horizons Ephimerides...", end=" ")
    planet_data = pd.DataFrame()
    planets = ["010", "001", "002", "003", "004", "005", "006", "007", "008"]
    epochs = {"start": "1950-01-01", "stop": "2050-01-01", "step": "10d"}
    for planet in planets:
        new_worlds_idx = new_worlds_df["id"] == planet

        reference_point = "@010" if planet != "010" else "@ssb"
        obj = Horizons(id=planet, location=reference_point, epochs=epochs)
        obj_df: pd.DataFrame = obj.elements().to_pandas()
        obj_j2000 = Horizons(id=planet, location=reference_point, epochs={"start": "2000-01-01 12:00", "stop": "2000-01-01 12:01", "step": "1d"})
        obj_j2000_df: pd.DataFrame = obj_j2000.elements().to_pandas()

        t = (obj_df["datetime_jd"] - 2451545) / 36525
        fit_data = obj_df[["a", "e", "incl", "Tp_jd", "w", "Omega", "P", "n", "M"]].agg(axis="rows", func=lambda y: fit_lstsq(t, np.unwrap(y, period=np.max(y))))

        try:
            new_data = {
                "id": planet,
                "name": obj_df.iloc[0, 0].split(" ")[0] if planet != "003" else "Earth",  # Hardcoded value for Earth
                "radius": new_worlds_df.loc[new_worlds_idx, "radius"].values[0],
                "rotperiod": new_worlds_df.loc[new_worlds_idx, "rotperiod"].values[0],
                "mass": new_worlds_df.loc[new_worlds_idx, "mass"].values[0],
                "primary": new_worlds_df.loc[new_worlds_idx, "primary"].values[0],
                "a_0": obj_j2000_df["a"].values[0],
                "a_dot": fit_data["a"][0],
                "e_0": obj_j2000_df["e"].values[0],
                "e_dot": fit_data["e"][0],
                "incl_0": obj_j2000_df["incl"].values[0],
                "incl_dot": fit_data["incl"][0],
                "Tp_0": obj_j2000_df["Tp_jd"].values[0],
                "Tp_dot": fit_data["Tp_jd"][0],
                "w_0": obj_j2000_df["w"].values[0] if planet != "003" else 102.93768193,  # Hardcoded value for Earth
                "w_dot": fit_data["w"][0] if planet != "003" else 0.32327364,
                "w^_0": obj_j2000_df["w"].values[0] + obj_j2000_df["Omega"].values[0],
                "w^_dot": fit_data["w"][0] + fit_data["Omega"][0],
                "Omega_0": obj_j2000_df["Omega"].values[0] if planet != "003" else 0,
                "Omega_dot": fit_data["Omega"][0] if planet != "003" else 0,
                "P_0": obj_j2000_df["P"].values[0],
                "P_dot": fit_data["P"][0],
                "M_0": obj_j2000_df["M"].values[0],
                "M_dot": fit_data["M"][0],
            }
            planet_data = pd.concat([planet_data, pd.DataFrame(new_data, index=[0])], ignore_index=True)
            new_worlds_df.drop(new_worlds_df[new_worlds_idx].index, inplace=True)
        except IndexError:
            print(planet)
    print("Done.")

    print("Writing planets.json...", end=" ")
    planet_data.to_json("../project/data/planets.json", orient="records")
    # Reformat json file
    with open("../project/data/planets.json", "r") as f:
        data = json.load(f)
    with open("../project/data/planets.json", "w") as f:
        json.dump(data, f, indent=4)

    print("Done.")

    print("Loading Planetary Satellites from JPL...", end=" ")
    # Load Planetary Satellites (Indices Valid as of 22 Oct 2024)
    satellite_dfs = pd.read_html("https://ssd.jpl.nasa.gov/sats/elem/sep.html")
    satellite_dfs[0]["Primary"] = "Earth"
    satellite_dfs[1]["Primary"] = "Mars"
    satellite_dfs[2]["Primary"] = "Jupiter"
    satellite_dfs[3]["Primary"] = "Jupiter"
    satellite_dfs[4]["Primary"] = "Jupiter"
    satellite_dfs[5]["Primary"] = "Saturn"
    satellite_dfs[6]["Primary"] = "Saturn"
    satellite_dfs[7]["Primary"] = "Saturn"
    satellite_dfs[8]["Primary"] = "Saturn"
    satellite_dfs[9]["Primary"] = "Uranus"
    satellite_dfs[10]["Primary"] = "Uranus"
    satellite_dfs[11]["Primary"] = "Uranus"
    satellite_dfs[12]["Primary"] = "Neptune"
    satellite_dfs[13]["Primary"] = "Neptune"
    satellite_dfs[14]["Primary"] = "Neptune"
    satellite_dfs[15]["Primary"] = "Pluto"
    satellite_dfs = satellite_dfs[:16]
    satellite_data = pd.concat(satellite_dfs, ignore_index=True)
    print("Done.")

    print("Writing satellites.json...", end=" ")
    satellite_data.to_json("../project/data/satellites.json", orient="records")
    print("Done.")


def process_worlds():
    worlds_df = pd.read_csv("worlds.tsv", sep="\t", skiprows=[1], na_values=["-", "?", "- "])
    worlds_df.rename(columns={worlds_df.columns[0]: "IDT"}, inplace=True)

    new_worlds_df = pd.DataFrame()
    new_worlds_df["id"] = worlds_df["IDName"]
    new_worlds_df["WType"] = worlds_df["WType"]
    new_worlds_df["name"] = worlds_df["Name"]
    new_worlds_df["radius"] = worlds_df["Radius"].apply(lambda x: float(x.strip().replace("?", "")))
    new_worlds_df["rotperiod"] = worlds_df["RotPeriod"]
    new_worlds_df["mass"] = worlds_df["Mass"].apply(lambda x: 1e15 * float(x.strip().replace("?", "").replace("M", "")) * (1e6 if "M" in x else 1))
    new_worlds_df["primary"] = worlds_df["Primary"].apply(lambda x: "Sun" if pd.isna(x) else x.strip().replace("EMB", "Earth-Moon System").replace("Sol", "Sun"))

    fetch_planet_data(new_worlds_df)


def parse_vague_date(date_str):
    if not isinstance(date_str, str):
        return None, None, None
    """
    Parse a vague date from the given string and return the implied date range.
    """
    # Month regex pattern for three-character month names
    month_pattern = r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"

    patterns = [
        (rf"(\d{{4}}) {month_pattern}\s{{1,2}}(\d{{1,2}}) (\d{{2}})(\d{{2}}):(\d{{2}})\.(\d{{3}})", "millisecond"),
        (rf"(\d{{4}}) {month_pattern}\s{{1,2}}(\d{{1,2}}) (\d{{2}})(\d{{2}}):(\d{{2}})\?", "seconds_approx"),
        (rf"(\d{{4}}) {month_pattern}\s{{1,2}}(\d{{1,2}}) (\d{{2}})(\d{{2}}):(\d{{2}})", "second"),
        (rf"(\d{{4}}) {month_pattern}\s{{1,2}}(\d{{1,2}}) (\d{{2}})(\d{{2}})\?", "minutes_approx"),
        (rf"(\d{{4}}) {month_pattern}\s{{1,2}}(\d{{1,2}}) (\d{{2}})(\d{{2}})", "minute"),
        (rf"(\d{{4}}) {month_pattern}\s{{1,2}}(\d{{1,2}})\.(\d{{2}})\?", "centiday_approx"),
        (rf"(\d{{4}}) {month_pattern}\s{{1,2}}(\d{{1,2}})\.(\d{{2}})", "centiday"),
        (rf"(\d{{4}}) {month_pattern}\s{{1,2}}(\d{{1,2}})s", "day_scheduled"),
        (rf"(\d{{4}}) {month_pattern}\s{{1,2}}(\d{{1,2}})\?", "day_approx"),
        (rf"(\d{{4}}) {month_pattern}\s{{1,2}}(\d{{1,2}})", "day"),
        (rf"(\d{{4}}) {month_pattern}\?", "month_approx"),
        (rf"(\d{{4}}) {month_pattern}", "month"),
        (rf"(\d{{4}}) Q(\d)\?", "quarter_approx"),
        (rf"(\d{{4}}) Q(\d)", "quarter"),
        (rf"(\d{{4}})s\?", "decade_approx"),
        (rf"(\d{{4}})s", "decade"),
        (rf"(\d{{4}})\?", "year_approx"),
        (rf"(\d{{4}})", "year"),
        (r"(\d{2})C\?", "century_approx"),
        (r"(\d{2})C", "century"),
        (r"(\d)M\?", "millennium_approx"),
        (r"(\d)M", "millennium"),
    ]

    for pattern, precision in patterns:
        match = re.match(pattern, date_str)
        if match:
            return compute_range(match, precision)

    raise ValueError(f"Unrecognized date format: {date_str}")


def int_opt_month(str_value):
    try:
        return int(str_value)
    except ValueError:
        return datetime.strptime(str_value, "%b").month


def compute_range(match, precision):
    """
    Compute the implied date range based on the matched precision.
    """
    try:
        if precision == "millisecond":
            year, month, day, hour, minute, second, millisecond = map(int_opt_month, match.groups())
            start = datetime(year, month, day, hour, minute, second, millisecond * 1000)
            end = start + timedelta(milliseconds=1)

        elif precision == "second":
            year, month, day, hour, minute, second = map(int_opt_month, match.groups())
            start = datetime(year, month, day, hour, minute, second)
            end = start + timedelta(seconds=1)

        elif precision == "seconds_approx":
            year, month, day, hour, minute, second = map(int_opt_month, match.groups())
            start = datetime(year, month, day, hour, minute, second) - timedelta(seconds=1)
            end = datetime(year, month, day, hour, minute, second) + timedelta(seconds=3)

        elif precision == "minute":
            year, month, day, hour, minute = map(int_opt_month, match.groups())
            start = datetime(year, month, day, hour, minute)
            end = start + timedelta(minutes=1)

        elif precision == "minutes_approx":
            year, month, day, hour, minute = map(int_opt_month, match.groups())
            start = datetime(year, month, day, hour, 0) - timedelta(minutes=1)
            end = start + timedelta(minutes=3)

        elif precision == "centiday":
            year, month, day, fraction = map(int_opt_month, match.groups())
            start = datetime(year, month, day) + timedelta(days=fraction / 100)
            end = start + timedelta(minutes=14, seconds=24)

        elif precision == "centiday_approx":
            year, month, day, fraction = map(int_opt_month, match.groups())
            start = datetime(year, month, day) + timedelta(days=(fraction - 1) / 100)
            end = datetime(year, month, day + 1)

        elif precision == "day" or precision == "day_scheduled":
            year, month, day = map(int_opt_month, match.groups())
            start = datetime(year, month, day)
            end = start + timedelta(days=1)

        elif precision == "day_approx":
            year, month, day = map(int_opt_month, match.groups())
            start = datetime(year, month, day) - timedelta(days=1)
            end = start + timedelta(days=3)

        elif precision == "month":
            year, month = map(int_opt_month, match.groups())
            start = datetime(year, month, 1)
            end = (start.replace(month=month % 12 + 1) - timedelta(seconds=1))

        elif precision == "month_approx":  # TODO: Fix this
            year, month = map(int_opt_month, match.groups())
            startMonth = month-1
            if startMonth == 0:
                year = year - 1
                startMonth = 12
            endMonth = startMonth + 1
            endYear = year
            if endMonth == 13:
                endMonth = 1
                endYear = year + 1
            start = datetime(year, startMonth, 1)
            end = datetime(endYear, endMonth, 1)

        elif precision == "quarter":
            year, quarter = map(int_opt_month, match.groups())
            start = datetime(year, (quarter - 1) * 3 + 1, 1)
            end = datetime(year, quarter * 3 % 12 + 1, 1)

        elif precision == "quarter_approx":  # TODO: Fix this
            year, quarter = map(int_opt_month, match.groups())
            if quarter == 1:
                year = year - 1
                start = datetime(year, 7, 1)
                end = datetime(year + 1, 6, 1)
            elif quarter == 4:
                start = datetime(year, 9, 1)
                end = datetime(year + 1, 5, 1)
            else:
                start = datetime(year, (quarter - 1) * 3 - 1, 1)
                end = datetime(year, quarter * 3 % 12 + 1, 1)

        elif precision == "year":
            year = int(match.group(1))
            start = datetime(year, 1, 1)
            end = datetime(year + 1, 1, 1)

        elif precision == "year_approx":
            year = int(match.group(1))
            start = datetime(year - 1, 1, 1)
            end = datetime(year + 2, 1, 1)

        elif precision == "decade":
            year = int(match.group(1))
            start = datetime(year, 1, 1)
            end = datetime(year + 10, 1, 1)

        elif precision == "decade_approx":
            year = int(match.group(1))
            start = datetime(year - 10, 1, 1)
            end = datetime(year + 20, 1, 1)

        elif precision == "century":
            century = int(match.group(1)) - 1
            start = datetime(century * 100 + 1, 1, 1)
            end = datetime((century + 1) * 100 + 1, 1, 1)

        elif precision == "century_approx":
            century = int(match.group(1)) - 1
            start = datetime(century * 100 - 99, 1, 1)
            end = datetime((century + 1) * 100 + 101, 1, 1)

        elif precision == "millennium":
            millennium = int(match.group(1)) - 1
            start = datetime(millennium * 1000 + 1, 1, 1)
            end = datetime((millennium + 1) * 1000 + 1, 1, 1)

        elif precision == "millennium_approx":
            millennium = int(match.group(1)) - 1
            start = datetime(millennium * 1000 - 999, 1, 1)
            end = datetime((millennium + 1) * 1000 + 1001, 1, 1)

        else:
            raise ValueError(f"Unsupported precision: {precision}")

        return start, end, precision

    except ValueError as e:
        print(f"Error computing range: {e}")
        raise


if __name__ == "__main__":
    # Download worlds.tsv from https://planet4589.org/space/gcat/tsv/worlds/worlds.tsv
    print("Downloading worlds.tsv...", end=" ")
    with open("worlds.tsv", "wb") as f:
        f.write(req.get("https://planet4589.org/space/gcat/tsv/worlds/worlds.tsv").content)
    print("Done")

    process_worlds()

    # Download DeepCat Index from https://planet4589.org/space/gcat/data/cat/deepindex.html
    print("Downloading DeepCat Index...", end=" ")
    with open("deepindex", "wb") as f:
        f.write(req.get("https://planet4589.org/space/gcat/data/cat/deepindex.html").content)
    print("Done")

    # DeepCat Index
    dci_df = pd.read_fwf("deepindex", comment="<", skiprows=3, names=["DeepCat", "JCAT"], widths=[13, 13], dtype=str)
    deep_index = dict(zip(dci_df["DeepCat"], dci_df["JCAT"]))

    colnames = ["JCAT", "Satcat", "Piece", "Type", "Name", "PLName", "LDate", "Parent", "SDate", "Primary", "DDate", "Status", "Dest", "Owner", "State", "Manufacturer", "Bus", "Motor", "Mass", "DryMass", "TotMass", "Length", "Diamete", "Span", "Shape", "ODate", "Perigee", "PF", "Apogee", "AF", "Inc", "IF", "OpOrbit", "OQU", "AltNames"]
    colwidths = [13, 7, 15, 13, 29, 29, 13, 14, 21, 14, 21, 7, 15, 13, 13, 19, 17, 13, 14, 13, 14, 10, 9, 11, 33, 19, 9, 1, 9, 1, 7, 1, 7, 4, 100]

    # Download Object and Event Catalogs from https://planet4589.org/space/gcat/data/cats.tar.gz
    print("Downloading Object and Event Catalogs...", end=" ")
    with open("cats.tar.gz", "wb") as f:
        f.write(req.get("https://planet4589.org/space/gcat/data/cats.tar.gz").content)
    print("Done")

    # Unzip Object and Event Catalogs into cats directory
    print("Extracting Object and Event Catalogs...", end=" ")
    with tarfile.open("cats.tar.gz", "r:gz") as tar:
        tar.extractall("cats", filter="fully_trusted")
    print("Done")

    print("Processing Object and Event Catalogs...", end=" ")
    # Object Catalogs
    satcat = pd.read_fwf("cats/satcat", comment="<", na_values=["-"], skiprows=6, names=colnames, widths=colwidths, dtype=str)
    auxcat = pd.read_fwf("cats/auxcat", comment="<", na_values=["-"], skiprows=6, names=colnames, widths=colwidths, dtype=str)
    rcat = pd.read_fwf("cats/rcat", comment="<", na_values=["-"], skiprows=6, names=colnames, widths=colwidths, dtype=str)
    lcat = pd.read_fwf("cats/lcat", comment="<", na_values=["-"], skiprows=6, names=colnames, widths=colwidths, dtype=str)

    # Event Catalogs
    ecat = pd.read_fwf("cats/ecat", comment="<", na_values=["-"], skiprows=6, names=colnames, widths=colwidths, dtype=str)
    deepcat = pd.read_fwf("cats/deepcat", comment="<", na_values=["-"], skiprows=6, names=colnames, widths=colwidths, dtype=str)
    hcocat = pd.read_fwf("cats/hcocat", comment="<", na_values=["-"], skiprows=6, names=colnames, widths=colwidths, dtype=str)
    lprcat = pd.read_fwf("cats/lprcat", comment="<", na_values=["-"], skiprows=6, names=colnames, widths=colwidths, dtype=str)

    # Create object and event catalogs
    objectcat = pd.concat([satcat, auxcat, rcat, lcat], ignore_index=True)
    eventcat = pd.concat([ecat, deepcat, hcocat, lprcat], ignore_index=True)

    # Parse Date Columns
    print("\n\tParsing Dates...", end=" ")
    objectcat["LDate_end"] = objectcat["LDate"].apply(lambda x: parse_vague_date(x)[1])
    objectcat["LDate_prec"] = objectcat["LDate"].apply(lambda x: parse_vague_date(x)[2])
    objectcat["LDate"] = objectcat["LDate"].apply(lambda x: parse_vague_date(x)[0])

    objectcat["SDate_end"] = objectcat["SDate"].apply(lambda x: parse_vague_date(x)[1])
    objectcat["SDate_prec"] = objectcat["SDate"].apply(lambda x: parse_vague_date(x)[2])
    objectcat["SDate"] = objectcat["SDate"].apply(lambda x: parse_vague_date(x)[0])

    objectcat["DDate_end"] = objectcat["DDate"].apply(lambda x: parse_vague_date(x)[1])
    objectcat["DDate_prec"] = objectcat["DDate"].apply(lambda x: parse_vague_date(x)[2])
    objectcat["DDate"] = objectcat["DDate"].apply(lambda x: parse_vague_date(x)[0])

    objectcat["ODate_end"] = objectcat["ODate"].apply(lambda x: parse_vague_date(x)[1])
    objectcat["ODate_prec"] = objectcat["ODate"].apply(lambda x: parse_vague_date(x)[2])
    objectcat["ODate"] = objectcat["ODate"].apply(lambda x: parse_vague_date(x)[0])

    eventcat["LDate_end"] = eventcat["LDate"].apply(lambda x: parse_vague_date(x)[1])
    eventcat["LDate_prec"] = eventcat["LDate"].apply(lambda x: parse_vague_date(x)[2])
    eventcat["LDate"] = eventcat["LDate"].apply(lambda x: parse_vague_date(x)[0])

    eventcat["SDate_end"] = eventcat["SDate"].apply(lambda x: parse_vague_date(x)[1])
    eventcat["SDate_prec"] = eventcat["SDate"].apply(lambda x: parse_vague_date(x)[2])
    eventcat["SDate"] = eventcat["SDate"].apply(lambda x: parse_vague_date(x)[0])

    eventcat["DDate_end"] = eventcat["DDate"].apply(lambda x: parse_vague_date(x)[1])
    eventcat["DDate_prec"] = eventcat["DDate"].apply(lambda x: parse_vague_date(x)[2])
    eventcat["DDate"] = eventcat["DDate"].apply(lambda x: parse_vague_date(x)[0])

    eventcat["ODate_end"] = eventcat["ODate"].apply(lambda x: parse_vague_date(x)[1])
    eventcat["ODate_prec"] = eventcat["ODate"].apply(lambda x: parse_vague_date(x)[2])
    eventcat["ODate"] = eventcat["ODate"].apply(lambda x: parse_vague_date(x)[0])

    print("\n\tAdding Unicode Names...", end=" ")
    # Add Unicode Satellite Names
    with open("cats/usatcat", "b+r") as f:
        usatcat_bytes = f.read()
        usatcat_txt = usatcat_bytes.decode("utf-8", errors="ignore")
        usatcat = pd.read_fwf(StringIO(usatcat_txt), comment="<", na_values=["-"], skiprows=[0, 1, 3, 4, 5])
    objectcat = pd.merge(objectcat, usatcat, how="left", on="JCAT", suffixes=(None, "_unicode"))
    objectcat.loc[objectcat["Name_unicode"].isna(), "Name_unicode"] = objectcat.loc[objectcat["Name_unicode"].isna(), "Name"]
    objectcat["Parent"] = objectcat["Parent"].str.split(" ").str[0]
    objectcat["Parent"] = objectcat["Parent"].str.replace("*", "")
    print("Done.")

    # Collect list of JCAT IDs which have entered deep space
    print("Finding Deep Space Missions...", end=" ")
    deepspace_ids = set()
    deepspace_ids = deepspace_ids.union(set(deepcat["JCAT"].to_list()))
    deepspace_ids = deepspace_ids.union(set(hcocat["JCAT"].to_list()))
    deepspace_ids = deepspace_ids.union(set(lprcat["JCAT"].to_list()))
    deepspace_ids = {deep_index[x] for x in deepspace_ids}
    print(f"Found {len(deepspace_ids)} objects related to deep space missions")

    print("Converting to JSON...")
    # Convert data to intermediate JSON
    objectcat_json = StringIO()
    eventcat_json = StringIO()
    objectcat.to_json(objectcat_json, orient="records", force_ascii=False, date_format='iso')
    eventcat_json.write("{\n")
    grouped_eventcat = eventcat.groupby("JCAT")
    for i, group in enumerate(grouped_eventcat):
        jcat, events = group
        events_io = StringIO()
        events.to_json(events_io, orient="records", force_ascii=False, date_format='iso')
        eventcat_json.write(f"  \"{jcat}\":" + events_io.getvalue() + f"{"," if i + 1 != len(grouped_eventcat) else ""}\n")
    eventcat_json.write("}")

    # Load JSON as a dictionary
    objects_raw = json.load(StringIO(objectcat_json.getvalue()))
    objects: dict = {x["JCAT"]: x for x in objects_raw}
    events = json.load(StringIO(eventcat_json.getvalue()))

    # Process All Objects
    missions = []
    mission_index = dict()
    visited_objects = set()

    def processEvent(event):
        return {
            "id": event["JCAT"],
            "parent": event["Parent"],
            "primary": event["Primary"],
            "sdate": event["SDate"],
            "sdate_prec": event["SDate_prec"],
            "ddate": event["DDate"],
            "ddate_prec": event["DDate_prec"],
            "status": event["Status"],
            "dest": event["Dest"],
            "odate": event["ODate"],
            "odate_prec": event["ODate_prec"],
            "perigee": event["Perigee"],
            "apogee": event["Apogee"],
            "inc": event["Inc"],
            "oporbit": event["OpOrbit"],
        }

    def visit(jcat, value):
        if jcat in visited_objects:
            return
        visited_objects.add(jcat)

        # If this object has a parent, we've already either visited it or will later
        if value["Parent"] is not None:
            if value["Parent"].startswith("D"):
                value["Parent"] = deep_index[value["Parent"]]
            elif value["Parent"] not in objects:
                raise ValueError("Missing parent", value["Parent"], value["JCAT"], value["Name_unicode"])
            if value["Parent"] not in visited_objects:
                visit(value["Parent"], objects[value["Parent"]])
            parent_index = mission_index[value["Parent"]]
            mission_index[jcat] = parent_index

            piece = {
                "name": value["Name_unicode"],
                "id": jcat,
                "type": value["Type"],
                "mass": value["Mass"],
                "dry_mass": value["DryMass"],
                "total_mass": value["TotMass"],
                "length": value["Length"],
                "diameter": value["Diamete"],
                "span": value["Span"],
                "shape": value["Shape"],
                "dest": value["Dest"],
                "events": [
                    processEvent(value)
                ],
            }

            if jcat in events:
                piece["events"].extend(map(processEvent, events[jcat]))
            if value["Dest"] is not None and value["Dest"] in events:
                piece["events"].extend(map(processEvent, events[value["Dest"]]))

            missions[parent_index]["pieces"].append(piece)
            missions[parent_index]["dests"].append(value["Dest"])

            if str(value["Type"])[0] == "P":
                # Check that current payload type takes priority over previous type
                if ((missions[parent_index]["primary_type"][0] != "P")
                        or (len(missions[parent_index]["primary_type"]) < 2)
                        or (len(value["Type"]) > 1
                            and ["H", "P", "X", "A", " "].index(value["Type"][1]) < ["H", "P", "X", "A", " "].index(missions[parent_index]["primary_type"][1]))):
                    missions[parent_index]["name"] = value["Name_unicode"]
                    missions[parent_index]["primary_type"] = value["Type"]
                    missions[parent_index]["primary_id"] = jcat
                    missions[parent_index]["events"] = piece["events"]
                    # if jcat in events:
                    #     missions[parent_index]["events"].extend(map(processEvent, events[jcat]))
                    # if value["Dest"] is not None and value["Dest"] in events:
                    #     missions[parent_index]["events"].extend(map(processEvent, events[value["Dest"]]))


            # TODO add object to parent mission
            return

        mission_index[jcat] = len(missions)

        mission_pieces = []
        mission_events = []

        piece = {
            "name": value["Name_unicode"],
            "id": jcat,
            "type": value["Type"],
            "mass": value["Mass"],
            "dry_mass": value["DryMass"],
            "total_mass": value["TotMass"],
            "length": value["Length"],
            "diameter": value["Diamete"],
            "span": value["Span"],
            "shape": value["Shape"],
            "dest": value["Dest"],
            "events": [
                processEvent(value),
            ],
        }
        mission_pieces.append(piece)

        if jcat in events:
            mission_events.extend(map(processEvent, events[jcat]))
        if value["Dest"] is not None and value["Dest"] in events:
            mission_events.extend(map(processEvent, events[value["Dest"]]))


        dests = set()
        if value["Dest"] is not None:
            dests.add(value["Dest"])
        for event in mission_events:
            if event["Dest"] is not None:
                dests.add(event["Dest"])
        # mission_events.extend([x for x in events if x["JCAT"] in dests])
        for event in mission_events:
            dests.add(event["Dest"])

        mission = {
            "name": value["Name_unicode"],
            "primary_id": jcat,
            "primary_type": value["Type"],
            "launch_date": value["LDate"],
            "pieces": mission_pieces,
            "events": mission_events,
            "dests": list(dests)
        }
        missions.append(mission)

    for jcat, value in tqdm(objects.items()):
        if jcat in deepspace_ids:
            visit(jcat, value)
    print("Done.")

    print("Writing missions.json...", end=" ")
    with open("../project/data/missions.json", "w") as f:
        json.dump(missions, f, indent=4)
    print("Done.")
