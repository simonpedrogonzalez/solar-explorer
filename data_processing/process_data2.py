import json

# Load data from JSON files
def load_json(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

# Save data to a JSON file
def save_json(data, file_path):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)

# Unify planet and satellite fields
def process_planet(planet):
    # Return the renamed and restructured planet
    return {
        "id": planet.get("id"),
        "name": planet.get("name"),
        "type": "planet",
        "primary": planet.get("primary"),       # Central body it orbits
        "radius": planet.get("radius"),        # Planet radius
        "mass": planet.get("mass"),            # Planet mass
        "rotation_period": planet.get("rotperiod"),  # Rotation period
        "semi_major_axis": planet.get("a_0"),       # Initial semi-major axis
        "semi_major_axis_rate": planet.get("a_dot"),  # Rate of change of semi-major axis
        "eccentricity": planet.get("e_0"),          # Initial eccentricity
        "eccentricity_rate": planet.get("e_dot"),   # Rate of change of eccentricity
        "inclination": planet.get("incl_0"),        # Initial inclination
        "inclination_rate": planet.get("incl_dot"), # Rate of change of inclination
        "longitude_of_ascending_node": planet.get("Omega_0"),  # Initial longitude of ascending node
        "longitude_of_ascending_node_rate": planet.get("Omega_dot"),  # Rate of change of longitude
        "argument_of_periapsis": planet.get("w_0"),   # Initial argument of periapsis
        "argument_of_periapsis_rate": planet.get("w_dot"),  # Rate of change of argument of periapsis
        "mean_anomaly": planet.get("M_0"),           # Initial mean anomaly
        "mean_anomaly_rate": planet.get("M_dot"),    # Rate of change of mean anomaly
        "orbital_period": planet.get("P_0"),         # Initial orbital period
        "orbital_period_rate": planet.get("P_dot"),  # Rate of change of orbital period
    }

def process_satellite(satellite):
    return {
        "id": satellite.get("Code"),           # Unique identifier for the satellite
        "name": satellite.get("Satellite"),    # Name of the satellite
        "type": "satellite",                   # Type field to specify it's a satellite
        "primary": satellite.get("Primary"),   # Primary body the satellite orbits
        "right_ascension": satellite.get("R.A. (deg)"),  # Right ascension in degrees
        "declination": satellite.get("Dec. (deg)"),      # Declination in degrees
        "tilt": satellite.get("Tilt (deg)"),             # Orbital tilt in degrees
        # "reference": satellite.get("Ref."),              # Reference or source ID
        "semi_major_axis": satellite.get("a (km)"),  # Semi-major axis in kilometers
        "eccentricity": satellite.get("e"),          # Orbital eccentricity
        "inclination": satellite.get("i (deg)"),     # Orbital inclination in degrees
        "longitude_of_ascending_node": satellite.get("node (deg)"),  # Longitude of ascending node
        "argument_of_periapsis": satellite.get("ω (deg)"),  # Argument of periapsis
        "mean_anomaly": satellite.get("M (deg)"),    # Mean anomaly
        "orbital_period": satellite.get("P (days)"), # Orbital period in days
        "apsidal_precession_period": satellite.get("Papsis (yr)"),  # Precession period for periapsis (in years)
        "nodal_precession_period": satellite.get("Pnode (yr)") 
    }

def check_satellite_primaries(satellites, planets):
    # Extract the names of planets
    planet_names = {planet['name'] for planet in planets}

    # Find satellites whose primary does not match any planet name
    invalid_satellites = [
        satellite for satellite in satellites
        if satellite.get('primary') not in planet_names
    ]

    # Return the result
    if invalid_satellites:
        return {
            "valid": False,
            "invalid_satellites": invalid_satellites  # List of problematic satellites
        }
    else:
        return {
            "valid": True,
            "invalid_satellites": []  # All satellites are valid
        }

# Main function to unify data
def unify_bodies(planets_path, satellites_path, output_path):
    planets = load_json(planets_path)
    satellites = load_json(satellites_path)
    
    
    # Process planets
    new_planets = []
    for planet in planets:
        new_planets.append(process_planet(planet))
    
    # Process satellites
    new_satellites = []
    for satellite in satellites:
        new_satellites.append(process_satellite(satellite))

    # Check primaries
    check_satellite_primaries(new_satellites, new_planets)
    
    # Combine planets and satellites
    bodies = new_planets + new_satellites

    # Save to output file
    save_json(bodies, output_path)
    print(f"Unified bodies saved to {output_path}")

# Paths to input and output files
planets_file = "data_processing/planets.json"
satellites_file = "data_processing/satellites.json"
output_file = "data_processing/bodies.json"

# Run the script
unify_bodies(planets_file, satellites_file, output_file)
