def simplify_discovered_by(discoverer):
    """
    Simplifies the `discoveredBy` field into grouped categories based on predefined rules.
    """
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

