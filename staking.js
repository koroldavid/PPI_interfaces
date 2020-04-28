const utils = require('./utils');
const constants = require('./constants');
const {
    hydrogenicGroup,
    piStakingVariants,
    piCationGroupOne,
    piCationGroupTwo,
    tStakingGroup,
    vanDerWaalsGroup,
    distance
} = constants;

module.exports = function staking(chains) {
    const chainsNames = Object.keys(chains);
    const chainData   = {}
    const logs        = [];


    chainsNames.forEach((firstChainName, index) => {
        const chainsToConnect = [...chainsNames].slice(index + 1);

        chainsToConnect.forEach(secondChainName => {
            chainData[`${firstChainName}${secondChainName}`] = [];

            chains[firstChainName].forEach((firstAtom, firstAtomIndex) => {
                chains[secondChainName].forEach((secondAtom, secondAtomIndex) => {
                    if (
                        checkConnecting(firstAtom, secondAtom, 'hydrogenic', logs)      ||
                        checkConnecting(firstAtom, secondAtom, 'piStaking', logs)       ||
                        checkConnecting(firstAtom, secondAtom, 'piCationStaking', logs) ||
                        checkConnecting(firstAtom, secondAtom, 'tStaking', logs)        ||
                        checkConnecting(firstAtom, secondAtom, 'vanDerWaals', logs)
                    ) {
                        chainData[`${firstChainName}${secondChainName}`].push([firstAtomIndex, secondAtomIndex])
                    }
                });
            });
        });
    });

    return { data: utils.filterStaking(chainData), logs };
}

const connectingData = {
    variants : {
        hydrogenic      : utils.getVariants(hydrogenicGroup, hydrogenicGroup),
        piStaking       : piStakingVariants,
        piCationStaking : utils.getVariants(piCationGroupOne, piCationGroupTwo),
        tStaking        : utils.getVariants(tStakingGroup, tStakingGroup),
        vanDerWaals     : utils.getVariants(vanDerWaalsGroup, vanDerWaalsGroup)
    },
    distance
}

function checkConnecting(firstAtom, secondAtom, type, logs) {
    const Match  = connectingData.variants[type].find(variant => {
        return (
            (variant[0] === firstAtom[2] && variant[1] === secondAtom[2]) ||
            (variant[0] === secondAtom[2] && variant[1] === firstAtom[2])
        );
    });

    if (Match) {
        const x1 = firstAtom[5];
        const y1 = firstAtom[6];
        const z1 = firstAtom[7];

        const x2 = secondAtom[5];
        const y2 = secondAtom[6];
        const z2 = secondAtom[7];

        const distance = Math.sqrt(
            Math.pow(
                (x2 - x1), 2
            )
            +
            Math.pow(
                (y2 - y1), 2
            )
            +
            Math.pow(
                (z2 - z1), 2
            )
        );

        if (distance <= connectingData.distance[type]) {
            logs.push(`${firstAtom.slice(0, 5).join(' ')} and ${secondAtom.slice(0, 5).join(' ')} ${type} ${Math.floor(distance * 100) / 100}`);
            return true
        }
    }

    return false
}
