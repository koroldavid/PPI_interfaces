const utils = require('./utils');

const DonorsMap = {
    TYR : [['CZ', 'OH']],
    SER : [['CB', 'OG']],
    THR : [['CB', 'OG1']],
    ARG : [['CB', 'NH1'], ['CB', 'NH2'], ['CB', 'NE']],
    ASN : [['CB', 'ND2']],
    TRP : [['CE2', 'NE1']],
    HIS : [['CE1', 'NE2']],
    GLN : [['CD', 'NE2']]
}

const AcceptorsMap = {
    ASN : [['CB', 'OD1']],
    TRP : [['CD2', 'NE1']],
    HIS : [['CG', 'ND1']],
    GLN : [['CD', 'OE1']],
    GLU : [['CD', 'OE1'], ['CD', 'OE2']],
    ASP : [['CG', 'OD1'], ['CG', 'OD2']]
}

const AromaticsMap = {
    PHE : [['CG', 'CD1', 'CD2', 'CE1', 'CE2', 'CZ']],
    TYR : [['CG', 'CD1', 'CD2', 'CE1', 'CE2', 'CZ']],
    HIS : [['CG', 'ND1', 'CD2', 'CE1', 'NE2']],
    TRP : [
        ['CG', 'CD1', 'CD2', 'NE1', 'CE2'],
        ['CD2', 'CE2', 'CE3', 'CZ2', 'CZ3', 'CH2']
    ]
}


const PolarMap = {
    LYS : ['CE', 'NZ'],
    ARG : ['CZ', 'NH1']
};

const hydrogenicException = ['TRP', 'HIS'];

const validAcids = [
    'ALA', 'ARG', 'ASN',
    'ASP', 'CYS', 'GLN',
    'GLU', 'HIS', 'ILE', 
    'LEU', 'LYS', 'MET',
    'PHE', 'PRO', 'SER',
    'THR', 'TRP', 'TYR',
    'VAL'
];
const Acceptors        = ['ASN', 'GLN', 'GLU', 'ASP', 'HIS'];
const Donors           = ['TYR', 'SER', 'TRH', 'ARG', 'ASN', 'TRP', 'HIS', 'GLN'];
const Aromatic         = ['PHE', 'TYR', 'TRP', 'HIS'];
const piCationPolar    = ['LYS', 'ARG'];
const vanDerWaalsGroup = ['LEU', 'ILE', 'PHE'];

const distance = {
    HyrdogenBonds : 3.5,
    PiStaking     : 4.4,
    TStaking      : 5.5, 
    PiCation      : 6.6,
    VanDerWaals   : 1
}

const connectionTypes = Object.keys(distance);

const angles = {
    hydrogenicDonor : {
        from : 90,
        to   : 180
    },
    hydrogenicAcceptor : {
        from : 80,
        to   : 210
    },
    hydrogenicException : {
        from : 124,
        to   : 130
    },
    piStaking : {
        to : 30
    },
    tStaking : {
        from : 60,
        to   : 90
    },
    piCation : {
        from : 30,
        to   : 90
    }
}

const variants = {
    HyrdogenBonds : utils.getVariants(Acceptors, Donors),
    PiStaking     : utils.getVariants(Aromatic, Aromatic),
    TStaking      : utils.getVariants(Aromatic, Aromatic),
    PiCation      : utils.getVariants(Aromatic, piCationPolar),
    VanDerWaals   : utils.getVariants(vanDerWaalsGroup, vanDerWaalsGroup)
}

module.exports = {
    validAcids,
    Acceptors,
    Donors,
    Aromatic,
    piCationPolar,
    vanDerWaalsGroup,
    connectionTypes,
    distance,
    angles,
    variants,
    DonorsMap,
    AcceptorsMap,
    hydrogenicException,
    AromaticsMap,
    PolarMap
}