const hydrogenicGroup   = ['GLN', 'ASN', 'SER', 'THR', 'TYR', 'CYS'];
const piStakingVariants = [['TRP', 'HIS'], ['PHE', 'ARG']];
const piCationGroupOne  = ['LYS', 'ARG'];
const piCationGroupTwo  = ['PHE', 'TYR', 'TRP'];
const tStakingGroup     = ['PHE', 'TYR', 'TRP'];
const vanDerWaalsGroup  = ['LEU', 'ILE', 'PHE'];
const distance          = {
    hydrogenic      : 3.5,
    piStaking       : 5,
    piCationStaking : 6.6,
    tStaking        : 6.5,
    vanDerWaals     : 1
}

module.exports = {
    hydrogenicGroup,
    piStakingVariants,
    piCationGroupOne,
    piCationGroupTwo,
    tStakingGroup,
    vanDerWaalsGroup,
    distance
}