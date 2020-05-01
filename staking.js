const utils = require('./utils');
const constants = require('./constants');
const {
    angles,
    variants,
    connectionTypes
} = constants;
const { hydrogenicDonor, hydrogenicAcceptor, hydrogenicException } = angles;

module.exports = function staking(chains) {
    const chainData   = {};
    const logs        = [];

    chains.keys.forEach((firstChainName, FirstKeyindex) => {
        const chainsToConnect = chains.keys.slice(FirstKeyindex + 1);

        chainsToConnect.forEach(secondChainName => {
            if (!chainData[firstChainName]) chainData[firstChainName] = [];
            if (!chainData[secondChainName]) chainData[secondChainName] = [];

            chains[firstChainName].forEach(firstAcid => {
                chains[secondChainName].forEach(secondAcid => {

                    if (checkConnecting(firstAcid, secondAcid, logs)) {
                        chainData[firstChainName].push(firstAcid);
                        chainData[secondChainName].push(secondAcid);
                    }
                });
            });
        });
    });

    return { stakingResult: utils.filterStaking(chainData), logs };
}

function checkConnecting(aAcid, bAcid, logs) {
    const type = matchin(aAcid, bAcid);

    if (type) {
        const isConnecting = connectings[`check${type}`](aAcid, bAcid, logs);

        if (isConnecting) {
            logs.push(`${aAcid.acidType} ${aAcid.acidNumber} ${aAcid.chain} and ${bAcid.acidType} ${bAcid.acidNumber} ${bAcid.chain}`);

            return true;
        }
    }

    return false
}

const matchin = (aAcid, bAcid) => {
    const aType = aAcid.acidType;
    const bType = bAcid.acidType;

    return connectionTypes.find(type => {
        return variants[type].find(variant => {
            const a = variant[0];
            const b = variant[1];

            return (a === aType && b === bType) || (a === bType && b === aType);
        });
    });
}

const checkVanDerWaals = (aAcid, bAcid) => {
    let hasInterface = false;
    const { VanDerWaalsRadius } = constants;

    aAcid.atoms.keys.forEach(aKey => {
        bAcid.atoms.keys.forEach(bKey => {
            const aAtom = aAcid.atoms[aKey];
            const bAtom = bAcid.atoms[bKey];
            const aRadius = +VanDerWaalsRadius[aAtom.defaultType];
            const bRadius = +VanDerWaalsRadius[bAtom.defaultType];
            const maxRadius = aRadius + bRadius + 0.4;

            const distance = utils.getDistance(aAtom, bAtom);
            console.log(distance);

            if (distance <= maxRadius) hasInterface = true;
        });
    });

    return hasInterface;
}

const checkPiCation = (aAcid, bAcid) => {
    let hasInterface = false;
    let aromatic  = aAcid;
    let polarAcid = bAcid;

    if (aromatic.polar) {
        aromatic  = bAcid;
        polarAcid = aAcid;
    }

    aromatic.centroids.forEach(aroma => {
        const distance = utils.getDistance(aroma.centroid, polarAcid.polar.atom);
        const angle    = utils.getAngle([...polarAcid.polar.angle, aroma.centroid]);

        if (distance <= constants.distance.piCation && (angle >= angles.piCation.from && angle <= angles.piCation.to)) hasInterface = true;
    });

    return hasInterface
}

const checkTStaking = (aAcid, bAcid) => {
    let hasInterface = false;

    aAcid.centroids.forEach(aCentroid => {
        bAcid.centroids.forEach(bCentroid => {
            const distance = utils.getDistance(aCentroid.centroid, bCentroid.centroid);
            const angle    = utils.getSquareAngle(aCentroid.squareEquasion, bCentroid.squareEquasion);

            if (distance <= constants.distance.tStaking && (angle >= angles.tStaking.from && angle <= angles.tStaking.to)) hasInterface = true;
        });
    });
    
    return hasInterface
}

const checkPiStaking = (aAcid, bAcid) => {
    let hasInterface = false;

    aAcid.centroids.forEach(aCentroid => {
        bAcid.centroids.forEach(bCentroid => {
            const distance = utils.getDistance(aCentroid.centroid, bCentroid.centroid);
            const angle    = utils.getSquareAngle(aCentroid.squareEquasion, bCentroid.squareEquasion);

            if (distance <= constants.distance.piStaking && angle <= angles.piStaking.to) hasInterface = true;
        });
    });

    return hasInterface;
}

const checkHyrdogenBonds = (aAcid, bAcid, logs) => {
    let hasInterface = false;

    if (aAcid.donors && bAcid.acceptors) {
        aAcid.donors.forEach(donor => {
            bAcid.acceptors.forEach(acceptor => {
                const angleDonor    = utils.getAngle([...donor.angle, acceptor.atom]);
                const angleAcceptor = utils.getAngle([...acceptor.angle, donor.atom]);

                const distance = utils.getDistance(donor.atom, acceptor.atom);

                const isExeption = constants.hydrogenicException.find(type => type === bAcid.acidType);

                if (distance <= constants.distance.HyrdogenBonds) {
                    logs.push(`${aAcid.acidType} ${aAcid.acidNumber} ${aAcid.chain} and ${bAcid.acidType} ${bAcid.acidNumber} ${bAcid.chain} ${distance}`);
                }

                if (!isExeption) {
                    if (
                        (distance <= constants.distance.HyrdogenBonds) &&
                        (angleDonor >= hydrogenicDonor.from && angleDonor <= hydrogenicDonor.to) &&
                        (angleAcceptor >= hydrogenicAcceptor.from && angleAcceptor <= hydrogenicAcceptor.to) 
                    ) hasInterface = true;
                } else {
                    if (
                        (distance <= constants.distance.HyrdogenBonds) &&
                        (angleAcceptor >= hydrogenicException.from && angleAcceptor <= hydrogenicException.to) 
                    ) hasInterface = true;
                }
            });
        });
    }

    if (bAcid.donors && aAcid.acceptors) {
        bAcid.donors.forEach(donor => {
            aAcid.acceptors.forEach(acceptor => {
                const angleDonor    = utils.getAngle([...donor.angle, acceptor.atom]);
                const angleAcceptor = utils.getAngle([...acceptor.angle, donor.atom]);

                const distance = utils.getDistance(donor.atom, acceptor.atom);

                const isExeption = constants.hydrogenicException.find(type => type === bAcid.acidType);

                if (distance <= constants.distance.HyrdogenBonds) {
                    logs.push(`${aAcid.acidType} ${aAcid.acidNumber} ${aAcid.chain} and ${bAcid.acidType} ${bAcid.acidNumber} ${bAcid.chain} ${distance}`);
                }

                if (!isExeption) {
                    if (
                        (distance <= constants.distance.HyrdogenBonds) &&
                        (angleDonor >= hydrogenicDonor.from && angleDonor <= hydrogenicDonor.to) &&
                        (angleAcceptor >= hydrogenicAcceptor.from && angleAcceptor <= hydrogenicAcceptor.to) 
                    ) hasInterface = true;
                } else {
                    if (
                        (distance <= constants.distance.HyrdogenBonds) &&
                        (angleAcceptor >= hydrogenicException.from && angleAcceptor <= hydrogenicException.to) 
                    ) hasInterface = true;
                }
            });
        });
    }

    return hasInterface;
}

const connectings = {
    checkHyrdogenBonds,
    checkPiStaking,
    checkTStaking,
    checkPiCation,
    checkVanDerWaals
}
