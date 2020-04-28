const utils = require('./utils');
const constants = require('./constants');
const {
    hydrogenicAcceptors,
    hydrogenicDonors,
    distance,
    angles,
    variants
} = constants;

module.exports = function staking(chains, atoms) {
    const chainsNames = Object.keys(chains);
    const chainData   = {};
    const logs        = [];

    chainsNames.forEach((firstChainName, index) => {
        const chainsToConnect = [...chainsNames].slice(index + 1);

        chainsToConnect.forEach(secondChainName => {
            chainData[`${firstChainName}${secondChainName}`] = [];

            chains[firstChainName].forEach((firstAcid, firstAcidIndex) => {
                chains[secondChainName].forEach((secondAcid, secondAcidIndex) => {

                    if (
                        checkConnecting(firstAcid, secondAcid, 'HyrdogenBonds', logs) ||
                        checkConnecting(firstAcid, secondAcid, 'PiStaking', logs)     ||
                        checkConnecting(firstAcid, secondAcid, 'TStaking', logs)        
                        // checkConnecting(firstAcid, secondAcid, 'PiCationStaking', logs) ||
                        // checkConnecting(firstAcid, secondAcid, 'vanDerWaals', logs)
                    ) {
                        chainData[`${firstChainName}${secondChainName}`].push([firstAcidIndex, secondAcidIndex]);
                    }
                });
            });
        });
    });

    return { data: utils.filterStaking(chainData), logs };
}

function checkConnecting(firstAcid, secondAcid, type, logs) {
    const firstAcidType  = firstAcid[0][2];
    const secondAcidType = secondAcid[0][2];

    const Match  = variants[type].find(variant => {
        return (
            (variant[0] === firstAcidType && variant[1] === secondAcidType) ||
            (variant[0] === secondAcidType && variant[1] === firstAcidType)
        );
    });

    if (Match) {
        

        const isConnecting = connectings[`check${type}`](firstAcid, secondAcid, firstAcidType, secondAcidType);


        if (isConnecting) {
            logs.push(`${firstAcid[0].slice(2, 5).join(' ')} and ${secondAcid[0].slice(2, 5).join(' ')} ${type} ${Math.floor(distance * 100) / 100}`);

            return true;
        }
    }

    return false
}

const PiCationStaking = (firstAcid, secondAcid, firstType, secondType) => {
    let hasInterface = false;

    const firstCenterVector = getCentroid(firstAcid, firstType);
    const secondCenterVector = getCentroid(secondAcid, secondType);

    const firstCentroid = firstCenterVector[1];
    const secondCentroid = secondCenterVector[1];

    const distance = getDistance(firstCentroid, secondCentroid);
    const angle    = getAngle(donorAngleCoordinates);

    if (
        distance <= distance.tStaking &&
        (angle >= angles.tStaking.from && angle <= angles.tStaking.to)
    ) hasInterface = true;

    return hasInterface
}

const checkTStaking = (firstAcid, secondAcid, firstType, secondType) => {
    let hasInterface = false;

    const firstCenterVector = getCentroid(firstAcid, firstType);
    const secondCenterVector = getCentroid(secondAcid, secondType);

    firstCenterVector.forEach(firstVector => {
        secondCenterVector.forEach(secondVector => {
            const firstCentroid = firstVector[1];
            const secondCentroid = secondVector[1];

            const distance = getDistance(firstCentroid, secondCentroid);
            const angle    = getAngle([...firstVector, secondCentroid]);

            if (
                distance <= distance.tStaking &&
                (angle >= angles.tStaking.from && angle <= angles.tStaking.to)
            ) hasInterface = true;
        });
    });
    
    return hasInterface
}

const checkPiStaking = (firstAcid, secondAcid, firstType, secondType) => {
    let hasInterface = false;

    const firstCenterVector = getCentroid(firstAcid, firstType);
    const secondCenterVector = getCentroid(secondAcid, secondType);

    firstCenterVector.forEach(firstVector => {
        secondCenterVector.forEach(secondVector => {
            const firstCentroid = firstVector[1];
            const secondCentroid = secondVector[1];

            const distance = getDistance(firstCentroid, secondCentroid);
            const angle    = getAngle([...firstVector, secondCentroid]);

            if (
                distance <= distance.piStaking &&
                angle <= angles.to
            ) hasInterface = true;
        });
    });

    return hasInterface;
}

const getCentroid = (acid, type) => {
    const atoms = [];
    const additionalAtoms = [];

    switch(type) {
        case 'PHE':
            atoms.push(acid.find(atom => atom[1] === 'CG'));
            atoms.push(acid.find(atom => atom[1] === 'CD1'));
            atoms.push(acid.find(atom => atom[1] === 'CD2'));
            atoms.push(acid.find(atom => atom[1] === 'CE1'));
            atoms.push(acid.find(atom => atom[1] === 'CE2'));
            atoms.push(acid.find(atom => atom[1] === 'CZ'));
            break;
        case 'TYR':
            atoms.push(acid.find(atom => atom[1] === 'CG'));
            atoms.push(acid.find(atom => atom[1] === 'CD1'));
            atoms.push(acid.find(atom => atom[1] === 'CD2'));
            atoms.push(acid.find(atom => atom[1] === 'CE1'));
            atoms.push(acid.find(atom => atom[1] === 'CE2'));
            atoms.push(acid.find(atom => atom[1] === 'CZ'));
            break;
        case 'HIS':
            atoms.push(acid.find(atom => atom[1] === 'CG'));
            atoms.push(acid.find(atom => atom[1] === 'ND1'));
            atoms.push(acid.find(atom => atom[1] === 'CD2'));
            atoms.push(acid.find(atom => atom[1] === 'CE1'));
            atoms.push(acid.find(atom => atom[1] === 'NE2'));
            break;
        case 'TRP':
            atoms.push(acid.find(atom => atom[1] === 'CG'));
            atoms.push(acid.find(atom => atom[1] === 'CD1'));
            atoms.push(acid.find(atom => atom[1] === 'CD2'));
            atoms.push(acid.find(atom => atom[1] === 'NE1'));
            atoms.push(acid.find(atom => atom[1] === 'CE2'));

            additionalAtoms.push(acid.find(atom => atom[1] === 'CD2'));
            additionalAtoms.push(acid.find(atom => atom[1] === 'CE2'));
            additionalAtoms.push(acid.find(atom => atom[1] === 'CE3'));
            additionalAtoms.push(acid.find(atom => atom[1] === 'CZ2'));
            additionalAtoms.push(acid.find(atom => atom[1] === 'CZ3'));
            additionalAtoms.push(acid.find(atom => atom[1] === 'CH2'));
            break;
    }

    const centroid = getAromCenter(atoms);

    const anglePoint = acid.find(atom => atom[1] === 'CG');
    const angles = [
        [anglePoint[5], anglePoint[6], anglePoint[7]],
        centroid
    ];
    

    if (type === 'TRP') {
        const additionalCentroid = getAromCenter(additionalAtoms);
        const additionalAnglePoint = acid.find(atom => atom[1] === 'CD2');
        const additionalAngles = [
            [additionalAnglePoint[5], additionalAnglePoint[6], additionalAnglePoint[7]],
            additionalCentroid
        ];

        return [angles, additionalAngles];
    }

    return [angles]

}

const getAromCenter = (atoms) => {
    let x = 0;
    let y = 0;
    let z = 0;

    atoms.forEach(atom => {
        x += +atom[5];
        y += +atom[6];
        z += +atom[7];
    });

    const amount = atoms.length;

    return [x/amount, y/amount, z/amount];
}

const checkHyrdogenBonds = (firstAcid, secondAcid, firstType, secondType) => {
    let hasInterface = false;

    const isFirstDonor   = hydrogenicDonors.find(acid => acid === firstType);
    const isSecondDonor   = hydrogenicDonors.find(acid => acid === secondType);

    const isFirstAceptor = hydrogenicAcceptors.find(acid => acid === firstType);
    const isSecondAceptor = hydrogenicAcceptors.find(acid => acid === secondType);

    const donorAtoms     = [];
    const acceptorAtoms  = [];

    const donorAngles    = [];
    const acceptorAngles = [];

    if (isFirstDonor) updateDonors(firstType, firstAcid, donorAtoms, donorAngles);
    if (isSecondDonor) updateDonors(secondType, secondAcid, donorAtoms, donorAngles);

    if (isFirstAceptor) updateAcceptors(firstType, firstAcid, acceptorAtoms, acceptorAngles);
    if (isSecondAceptor) updateAcceptors(secondType, secondAcid, acceptorAtoms, acceptorAngles);

    donorAtoms.forEach((donorAtom, donorIndex) => {
        acceptorAtoms.forEach((acceptorAtom, acceptorIndex) => {
            if (donorAtom[3] !== acceptorAtom[3]) {
                const donorCoordinates = [donorAtom[5], donorAtom[6], donorAtom[7]];
                const acceptorCoordinates = [acceptorAtom[5], acceptorAtom[6], acceptorAtom[7]];
                
                const distance = getDistance(donorCoordinates, acceptorCoordinates);

                donorAngles[donorIndex][2] = acceptorAtom;
                acceptorAngles[acceptorIndex][2] = donorAtom;

                const donorAngleCoordinates = donorAngles[donorIndex].map(atom => [atom[5], atom[6], atom[7]]);
                const acceptorAngleCoordinates = acceptorAngles[acceptorIndex].map(atom => [atom[5], atom[6], atom[7]]);

                const donorAngle = getAngle(donorAngleCoordinates);
                const acceptorAngle = getAngle(acceptorAngleCoordinates);

                const { hydrogenicDonor, hydrogenicAcceptor, hydrogenicException} = angles;

                if (acceptorAtom[2] !== 'TRP' || acceptorAtom[2] !== 'HIS') {
                    if (distance < 3.5) console.log(firstAcid[0], secondAcid[0]);
                    if (
                        distance <= distance.hydrogenic &&
                        (donorAngle >= hydrogenicDonor.from && donorAngle <= hydrogenicDonor.to) &&
                        (acceptorAngle >= hydrogenicAcceptor.from && donorAngle <= hydrogenicAcceptor.to) 
                    ) hasInterface = true;
                } else {
                    if (
                        distance <= distance.hydrogenic &&
                        (acceptorAngle >= hydrogenicException.from && donorAngle <= hydrogenicException.to) 
                    ) hasInterface = true;
                }
            }
        });
    });

    return hasInterface;
}

const updateDonors = (acidType, acid, donorAtoms, donorAngles) => {
    let atom = [];
    let angle = [];

    switch (acidType) {
        case 'TYR':
            atom  = acid.find(atm => atm[1] === 'OH');
            angle = [acid.find(atm => atm[1] === 'CZ'), atom]
        
            donorAngles.push(angle);
            donorAtoms.push(atom);
            break;
        case 'SER':
            atom  = acid.find(atm => atm[1] === 'OG');
            angle = [acid.find(atm => atm[1] === 'CB'), atom]
        
            donorAngles.push(angle);
            donorAtoms.push(atom);
            break;
        case 'THR':
            atom  = acid.find(atm => atm[1] === 'OG1');
            angle = [acid.find(atm => atm[1] === 'CB'), atom]
        
            donorAngles.push(angle);
            donorAtoms.push(atom);
            break;
        case 'ARG':
            atom  = acid.find(atm => atm[1] === 'NH1');
            angle = [acid.find(atm => atm[1] === 'CB'), atom]
        
            donorAngles.push(angle);
            donorAtoms.push(atom);

            atom  = acid.find(atm => atm[1] === 'NH2');
            angle = [acid.find(atm => atm[1] === 'CB'), atom]
        
            donorAngles.push(angle);
            donorAtoms.push(atom);

            atom  = acid.find(atm => atm[1] === 'NE');
            angle = [acid.find(atm => atm[1] === 'CB'), atom]
        
            donorAngles.push(angle);
            donorAtoms.push(atom);
            break;
        case 'ASN':
            atom  = acid.find(atm => atm[1] === 'ND2');
            angle = [acid.find(atm => atm[1] === 'CB'), atom]
        
            donorAngles.push(angle);
            donorAtoms.push(atom);
            break;
        case 'TRP':
            atom  = acid.find(atm => atm[1] === 'NE1');
            angle = [acid.find(atm => atm[1] === 'CE2'), atom]
        
            donorAngles.push(angle);
            donorAtoms.push(atom);
            break;
        case 'HIS':
            atom  = acid.find(atm => atm[1] === 'NE2');
            angle = [acid.find(atm => atm[1] === 'CE1'), atom]
        
            donorAngles.push(angle);
            donorAtoms.push(atom);
            break;
        case 'GLN':
            atom  = acid.find(atm => atm[1] === 'NE2');
            angle = [acid.find(atm => atm[1] === 'CD'), atom]
        
            donorAngles.push(angle);
            donorAtoms.push(atom);
            break;
    }
}

const updateAcceptors = (acidType, acid, acceptorAtoms, acceptorAngles) => {
    let atom = [];
    let angle = [];

    switch (acidType) {
        case 'ASN':
            atom  = acid.find(atm => atm[1] === 'OD1');
            angle = [acid.find(atm => atm[1] === 'CB'), atom]
        
            acceptorAngles.push(angle);
            acceptorAtoms.push(atom);
            break;
        case 'TRP':
            atom  = acid.find(atm => atm[1] === 'NE1');
            angle = [acid.find(atm => atm[1] === 'CD2'), atom]
        
            acceptorAngles.push(angle);
            acceptorAtoms.push(atom);
            break;
        case 'HIS':
            atom  = acid.find(atm => atm[1] === 'ND1');
            angle = [acid.find(atm => atm[1] === 'CG'), atom]
        
            acceptorAngles.push(angle);
            acceptorAtoms.push(atom);
            break;
        case 'GLN':
            atom  = acid.find(atm => atm[1] === 'OE1');
            angle = [acid.find(atm => atm[1] === 'CD'), atom]
        
            acceptorAngles.push(angle);
            acceptorAtoms.push(atom);
            break;
        case 'GLU':
            atom  = acid.find(atm => atm[1] === 'OE1');
            angle = [acid.find(atm => atm[1] === 'CD'), atom]
        
            acceptorAngles.push(angle);
            acceptorAtoms.push(atom);

            atom  = acid.find(atm => atm[1] === 'OE2');
            angle = [acid.find(atm => atm[1] === 'CD'), atom]
        
            acceptorAngles.push(angle);
            acceptorAtoms.push(atom);
            break;
        case 'ASP':
            atom  = acid.find(atm => atm[1] === 'OD1');
            angle = [acid.find(atm => atm[1] === 'CG'), atom]
        
            acceptorAngles.push(angle);
            acceptorAtoms.push(atom);

            atom  = acid.find(atm => atm[1] === 'OD2');
            angle = [acid.find(atm => atm[1] === 'CG'), atom]
        
            acceptorAngles.push(angle);
            acceptorAtoms.push(atom);
            break;
    }
}

const getDistance = (firstAtom, secondAtom) => {
    const x1 = +firstAtom[0];
    const y1 = +firstAtom[1];
    const z1 = +firstAtom[2];

    const x2 = +secondAtom[0];
    const y2 = +secondAtom[1];
    const z2 = +secondAtom[2];

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
    
    return distance;
}

const getAngle = (atoms) => {
    const Ax = atoms[0][0];
    const Ay = atoms[0][1];
    const Az = atoms[0][2];

    const Bx = atoms[1][0];
    const By = atoms[1][1];
    const Bz = atoms[1][2];

    const Cx = atoms[2][0];
    const Cy = atoms[2][1];
    const Cz = atoms[2][2];

    const BAx = Ax - Bx;
    const BAy = Ay - By;
    const BAz = Az - Bz;

    const BCx = Cx - Bx;
    const BCy = Cy - By;
    const BCz = Cz - Bz;

    const BA = Math.sqrt(
        Math.pow(
            (BAx), 2
        )
        +
        Math.pow(
            (BAy), 2
        )
        +
        Math.pow(
            (BAz), 2
        )
    );

    const BC = Math.sqrt(
        Math.pow(
            (BCx), 2
        )
        +
        Math.pow(
            (BCy), 2
        )
        +
        Math.pow(
            (BCz), 2
        )
    ); 

    const BA_BC = BAx * BCx + BAy * BCy + BAz * BCz;

    const cosAngle = BA_BC / (BA * BC);
    const rads = Math.acos(cosAngle);
   
    const angel = Math.floor(rads * 180 / Math.PI);

    return angel;
}

const connectings = {
    checkHyrdogenBonds,
    checkPiStaking,
    checkTStaking,
    PiCationStaking
}
