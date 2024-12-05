import json
import re
from datetime import datetime

def transform_name(name):
    pattern = r"S/(\d{4})\s([A-Z])\s(\d+)"
    match = re.match(pattern, name)
    if match:
        return f"S{match.group(1)}_{match.group(2)}{match.group(3)}"
    return name

def format_discovery_date(date_str):
    try:
        date_obj = datetime.strptime(date_str, "%d/%m/%Y")
        return date_obj.strftime("%Y-%m-%dT00:00:00.000")
    except ValueError:
        return None

def simplify_discovered_by(discoverer):
    mapping = {
        "Bradford A. Smith et al": [
            "Bradford A. Smith",
            "Bradford A. Smith, Harold J. Reitsema, Stephen M. Larson, John W. Fountain"
        ],
        "Ashton, Gladman, Kavelaars, Holman et al": [
            "Philip D. Nicholson, Brett J. Gladman, Joseph A. Burns, John J. Kavelaars",
            "E.J. Ashton, B.J. Gladman, J.-M. Petit, M. Alexandersen",
            "Brett J. Gladman",
            "Brett J. Gladman, Matthew J. Holman, John J. Kavelaars, Jean-Marc Petit, Hans Scholl",
            "Brett J. Gladman, Philip D. Nicholson, Joseph A. Burns, John J. Kavelaars",
            "E.J. Ashton, B.J. Gladman",
            "E.J. Ashton, B.J. Gladman, J.-M. Petit, C. Veillet, M. Alexandersen",
            "E.J. Ashton, B.J. Gladman, J.-M. Petit, M. Alexandersen",
            "John J. Kavelaars, Brett J. Gladman",
            "John J. Kavelaars, Brett J. Gladman, Matthew J. Holman, Jean-Marc Petit, Hans Scholl",
            "Matthew J. Holman",
            "Matthew J. Holman, John J. Kavelaars, Brett J. Gladman, Jean-Marc Petit, Hans Scholl",
            "Matthew J. Holman, John J. Kavelaars, Dan Milisavljevic",
            "Matthew J. Holman, John J. Kavelaars, Dan Milisavljevic, Brett J. Gladman",
            "Matthew J. Holman, John J. Kavelaars, Tommy Grav, Wesley C. Fraser, Dan Milisavljevic"
        ],
        "Carolyn C. Porco et al": [
            "Carolyn C. Porco",
            "Carolyn C. Porco, Sébastien Charnoz",
            "Carolyn C. Porco, l'équipe Cassini"
        ],
        "Chadwick Trujillo et al": [
            "Chadwick Trujillo, Michael E. Brown",
            "Chadwick Trujillo, Michael E. Brown, David L. Rabinowitz"
        ],
        "Charles Kowal": [
            "Charles Kowal",
            "Charles Kowal 1975 - Scott S. Sheppard, David C. Jewitt 2000",
            "Charles T. Kowal"
        ],
        "Hubble Space Telescope Team": [
            "Hubble Space Telescope Pluto Companion Search Team",
            "Télescope spatial Hubble",
            "Télescope spatial Hubble - Pluto Companion Search Team",
            "Télescope spatial Hubble - Pluto Companion Search Team - Mark Showalter"
        ],
        "Spacewatch Team": [
            "Spacewatch",
            "David Rabinowitz / Spacewatch",
            "James V. Scotti, Robert Jedicke/ Spacewatch",
            "Robert S. McMillan Spacewatch"
        ],
        "Mark R. Showalter et al": [
            "Mark R. Showalter",
            "Mark R. Showalter, Jack J. Lissauer",
            "Mark Showalter"
        ],
        "Michael E. Brown et al": [
            "Michael E. Brown",
            "Michael E. Brown, Chadwick Trujillo, David L. Rabinowitz",
            "Michael E. Brown, Jean-Luc Margot",
            "Michael E. Brown, José Luis Ortiz Moreno",
            "Michael E. Brown, T.A. Suer"
        ],
        "Sheppard, Jewitt et al": [
            "S. Sheppard, D. Jewitt, J. Kleyna",
            "S.S Sheppard, D.C. Jewitt, J. Kleyna, E.J. Ashton, B.J. Gladman, J.-M. Petit, M. Alexandersen",
            "S.S. Sheppard",
            "S.S. Sheppard, , D.C. Jewitt, E.J. Ashton, B.J. Gladman, J.-M. Petit, M. Alexandersen",
            "S.S. Sheppard, D.C. Jewitt, E.J. Ashton, B.J. Gladman",
            "S.S. Sheppard, D.C. Jewitt, E.J. Ashton, B.J. Gladman, J.-M. Petit, M. Alexandersen",
            "S.S. Sheppard, D.C. Jewitt, J. Kleyna",
            "S.S. Sheppard, D.C. Jewitt, J. Kleyna, E.J. Ashton, B.J. Gladman",
            "S.S. Sheppard, D.C. Jewitt, J. Kleyna, E.J. Ashton, B.J. Gladman, J.-M. Petit, M. Alexandersen",
            "Scott S. Sheppard",
            "Scott S. Sheppard, David C. Jewitt",
            "Scott S. Sheppard, David C. Jewitt, Jan Kleyna",
            "Scott S. Sheppard, David C. Jewitt, Jan Kleyna, Brian G. Marsden",
            "Scott Sheppard",
            "D.C. Jewitt, S.S. Sheppard, E.J. Ashton, B.J. Gladman, J.-M. Petit, M. Alexandersen",
            "D.C. Jewitt, S.S. Sheppard, J. Kleyna, E.J. Ashton, B.J. Gladman, J.-M. Petit, M. Alexandersen",
            "David C. Jewitt, G. E. Danielson",
            "David C. Jewitt, Jane X. Luu"
        ],
        "Stephen P. Synnott et al": [
            "Stephen P. Synnott",
            "Stephen P. Synnott, Bradford A. Smith"
        ],
        "Stewart A. Collins et al": [
            "Stewart A. Collins",
            "Stewart A. Collins, D. Carlson"
        ],
        "Merline, Close, Dumas et al": [
            "W. J. Merline, L. M. Close, C. Dumas, C. R. Chapman, F. Roddier, F. Menard, D. C. Slater, G. Duvert, J. C. Shelton, T. Morgan"
        ],
        "Marchis, Descamps et al": [
            "F. Marchis, P. Descamps, J. Berthier, F. Vachier, J. P. Emery",
            "Franck Marchis, Pascal Descamps, Daniel Hestroffer, Jérome Berthier"
        ],
        "Pascu, Seidelmann et al": [
            "Dan Pascu, P. Kenneth Seidelmann, William A. Baum, Douglas Currie"
        ],
        "Reitsema, Hubbard et al": [
            "Harold J. Reitsema, William B. Hubbard, Larry A. Lebofsky, David J. Tholen",
            "Pierre Laques, Raymond Despiau, Jean Lecacheux"
        ],
        "Carolyn, Shoemaker, Levy": [
            "Carolyn, Eugene M. Shoemaker, David Levy"
        ],
        "Le Verrier, Adams, Galle": [
            "Urbain Le Verrier, John Couch Adams, Johann Galle"
        ],
        "Waldron, de Sanctis, West": [
            "J. Duncan Waldron, Giovanni de Sanctis, Richard M. West"
        ],
        "Lincoln Near-Earth Asteroid Research": [
            "LINEAR"
        ],
        "W. C. Bond, G. P. Bond": [
            "William Cranch Bond, George Phillips Bond"
        ],
        "Parker, Buie et al": [
            "Alex H. Parker, Marc W. Buie, M. Grundy, Keith S. Noll"
        ]
    }

    reverse_mapping = {alias: key for key, aliases in mapping.items() for alias in aliases}

    return reverse_mapping.get(discoverer, discoverer)

def enrich_bodies(bodies1_path, bodies2_path, output_path):
    """
    Enrich bodies1.json with data from bodies2.json and write the result to bodies3.json.
    """
    with open(bodies1_path, 'r', encoding='utf-8') as f1, open(bodies2_path, 'r', encoding='utf-8') as f2:
        bodies1 = json.load(f1)
        bodies2 = json.load(f2)

    bodies2_map = {
        transform_name(obj['englishName']): obj
        for obj in bodies2 if 'englishName' in obj
    }

    for body in bodies1:
        name = body['name']
        if name in bodies2_map:
            match = bodies2_map[name]
            # Enrich the body data
            if 'mass' in match and match['mass'] is not None:
                body['mass_value'] = match['mass']['massValue']
                body['mass_exponent'] = match['mass']['massExponent']
            if 'vol' in match and match['vol'] is not None:
                body['vol_value'] = match['vol']['volValue']
                body['vol_exponent'] = match['vol']['volExponent']
            if 'density' in match:
                body['density'] = match['density']
            if 'gravity' in match:
                body['gravity'] = match['gravity']
            if 'meanRadius' in match and 'radius' not in body:
                body['radius'] = match['meanRadius']
            if 'sideralOrbit' in match:
                body['sideral_orbit'] = match['sideralOrbit']
            if 'sideralRotation' in match:
                body['sideral_rotation'] = match['sideralRotation']
            if 'discoveredBy' in match:
                body['discovered_by'] = simplify_discovered_by(match['discoveredBy'])
            if 'discoveryDate' in match:
                body['discovery_date'] = format_discovery_date(match['discoveryDate'])
            if 'avgTemp' in match:
                body['avg_temp_kelvin'] = match['avgTemp']

    with open(output_path, 'w', encoding='utf-8') as out_file:
        json.dump(bodies1, out_file, ensure_ascii=False, indent=4)

bodies1_path = 'test/bodies.json'
bodies2_path = 'test/bodies2.json'
output_path = 'test/bodies3.json'

enrich_bodies(bodies1_path, bodies2_path, output_path)
