const utils = require('./utils');

const hydrogenicAcceptors = ['ASN', 'GLN', 'GLU', 'ASP', 'HIS'];
const hydrogenicDonors    = ['TYR', 'SER', 'TRH', 'ARG', 'ASP', 'TRP', 'HIS', 'GLN'];
const piStakingGroup      = ['PHE', 'TYR', 'TRP', 'HIS'];
const tStakingGroup       = ['PHE', 'TYR', 'TRP', 'HIS'];
const piCationGroupAroma  = ['PHE', 'TYR', 'TRP', 'HIS'];
const piCationGroupPolar  = ['LYS', 'ARG'];
const vanDerWaalsGroup    = ['LEU', 'ILE', 'PHE'];

const distance           = {
    hydrogenic      : 3.5,
    piStaking       : 4.4,
    tStaking        : 5.5, 
    piCationStaking : 6.6,
    vanDerWaals     : 1
}

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
    }
}

const variants = {
    HyrdogenBonds   : utils.getVariants(hydrogenicAcceptors, hydrogenicDonors),
    PiStaking       : utils.getVariants(piStakingGroup, piStakingGroup),
    TStaking        : utils.getVariants(tStakingGroup, tStakingGroup),
    PiCationStaking : utils.getVariants(piCationGroupAroma, piCationGroupPolar),
    VanDerWaals     : utils.getVariants(vanDerWaalsGroup, vanDerWaalsGroup)
}

module.exports = {
    hydrogenicAcceptors,
    hydrogenicDonors,
    piCationGroupAroma,
    piCationGroupPolar,
    tStakingGroup,
    vanDerWaalsGroup,
    distance,
    angles,
    variants
}