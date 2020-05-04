const pdbMainSorter = (lines) => {
    SortingObj = {
        TITLE  : [],
        COMPND : [],
        ELSE   : [],
        SEQRES : [],
        ATOMS  : []
    };

    lines.forEach(stringLine => {
        const line = stringLine.split(' ');
        const lineIdeficator = line[0];
        const lineData = line.slice(1).filter(el => el);

        switch(lineIdeficator) {
            case 'HEADER':
                SortingObj.HEADER = lineData;
                break;
            case 'TITLE':
                SortingObj.TITLE.push(lineData);
                break;
            case 'COMPND':
                SortingObj.COMPND.push(lineData);
                break;
            case 'SEQRES':
                SortingObj.SEQRES.push(lineData);
                break;
            case 'ATOM':
                SortingObj.ATOMS.push(lineData);
                break;
            default: 
                SortingObj.ELSE.push(lineData);
        }
    });

    return SortingObj
}

const getPdbMolecules = (compndArry) => {
    const modelcules = [];

    compndArry.forEach((line, index) => {
        if(line.find(el => el === 'MOLECULE:')) {
            const chain = [...compndArry].slice(index).find(line => line.find(el => el === 'CHAIN:'));

            modelcules.push({
                molecule : line.slice(2).join(' '),
                chain    : chain.slice(2).join(' ')
            });
        }
    });

    return modelcules;
}

const getAminoAcids = (atoms, validAcids) => {
    const aminoAcids = {};
    const broken = [];

    atoms.forEach(atom => {
        let [atomNumber, atomType, acidType, chain, acidNumber, x, y, z, factor, charge, defaultType ] = atom;

        if (chain.length > 1) {
            defaultType = charge;
            charge = factor;
            factor = z;
            z = y;
            y = x;
            x = acidNumber
            acidNumber = chain.slice(1);
            chain = chain.slice(0, 1);
        }

        const id = `${chain}${acidNumber}`;

        const isNotBroken = validAcids.find(type => acidType === type || chain.length > 3);
        
        if (!isNotBroken) broken.push(id);

        if (!aminoAcids[id]) aminoAcids[id] = {
            atoms: { keys: [] } ,
            chain,
            acidType,
            acidNumber,
        };

        aminoAcids[id].atoms[atomType] = { atomNumber, x, y, z, defaultType, atomType, acidType, chain, acidNumber, factor, charge };
        aminoAcids[id].atoms.keys.push(atomType);
    });

    filtredAcids = Object.keys(aminoAcids).filter(acidId => !broken.find(brokenId => brokenId === acidId));

    return filtredAcids.map(acidId => aminoAcids[acidId]);;
}

const updateAcidPropeties = (acids, constants) => {
    const { Acceptors, Donors, Aromatic, DonorsMap, AcceptorsMap, AromaticsMap, piCationPolar, PolarMap } = constants;

    acids.forEach(acid => {
        const { acidType } = acid;

        const isDonor    = Donors.find(type => type === acidType);
        const isAcceptor = Acceptors.find(type => type === acidType);
        const isAromatic = Aromatic.find(type => type === acidType);
        const isPolar    = piCationPolar.find(type => type === acidType);

        if (isDonor) {
            acid.donors = DonorsMap[acidType].map(key => {
                const atom  = acid.atoms[key[1]];
                const angle = [acid.atoms[key[0]], atom];

                return { atom, angle };
            });
        }

        if (isAcceptor) {
            acid.acceptors = AcceptorsMap[acidType].map(key => {
                const atom  = acid.atoms[key[1]];
                const angle = [acid.atoms[key[0]], atom];

                return { atom, angle };
            });
        }
        
        if (isAromatic) {
            acid.centroids = AromaticsMap[acidType].map(keys => {
                const centroidAtoms  = keys.map(key => acid.atoms[key]);
                const centroid       = getCentroid(centroidAtoms);
                const squareEquasion = getSequare(centroidAtoms.slice(0, 3));

                return {
                    centroid,
                    squareEquasion
                }
            });
        };

        if (isPolar) {
            const keys  = PolarMap[acidType];
            const atom  = acid.atoms[keys[1]];
            const angle = [acid.atoms[keys[0]], atom];

            acid.polar = { atom, angle };
        };
    });
}

const getChains = (acids) => {
    const chains = {};

    acids.forEach(acid => {
        if (!chains[acid.chain]) chains[acid.chain] = [];
        
        chains[acid.chain].push(acid);
    });

    chains.keys = Object.keys(chains);

    return chains;
}

const getCentroid = (atoms) => {
    if (atoms.findIndex(el => el == undefined) > -1) return { x: 0, y: 0, z: 0 };

    let x = 0;
    let y = 0;
    let z = 0;

    atoms.forEach(atom => {
        x += +atom.x;
        y += +atom.y;
        z += +atom.z;
    });

    const amount = atoms.length;

    x /= amount;
    y /= amount;
    z /= amount;

    return { x , y , z };
}

const getSequare = (atoms) => {
    if (atoms.findIndex(el => el == undefined) > -1) return { x: 0, y: 0, z: 0, d: 0 };

    const x1 = +atoms[0].x;
    const y1 = +atoms[0].y;
    const z1 = +atoms[0].z;

    const x2 = +atoms[1].x;
    const y2 = +atoms[1].y;
    const z2 = +atoms[1].z;

    const x3 = +atoms[2].x;
    const y3 = +atoms[2].y;
    const z3 = +atoms[2].z;

    const xAdditionMinor = (y2 - y1) * (z3 - z1) - (y3 - y1) * (z2 - z1);
    const yAdditionMinor = (x2 - x1) * (z3 - z1) - (x3 - x1) * (z2 - z1);
    const zAdditionMinor = (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1);

    const x = xAdditionMinor;
    const y = -yAdditionMinor;
    const z = zAdditionMinor;
    const d = (-x1) * x + (-y1) * y + (-z1) * z;
    
    return { x, y, z, d };
};

const getDistance = (A, B) => {
    if (!A || !B) return 100000; 

    const x1 = +A.x;
    const y1 = +A.y;
    const z1 = +A.z;

    const x2 = +B.x;
    const y2 = +B.y;
    const z2 = +B.z;

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

const getVariants = (groupOne, groupTwo) => {
    const variants = [];

    groupOne.forEach(first => {
        groupTwo.forEach(second => variants.push([first, second]));
    });

    return variants;
};

const getSquareAngle = (A, B) => {
    const x1 = A.x;
    const y1 = A.y;
    const z1 = A.z;

    const x2 = B.x;
    const y2 = B.y;
    const z2 = B.z;

    const cosAngle = (x1 * x2 + y1 * y2 + z1 * z2) / 
        (
            Math.sqrt(
                Math.pow(x1, 2) + 
                Math.pow(y1, 2) + 
                Math.pow(z1, 2)
            ) 
            *
            Math.sqrt(
                Math.pow(x2, 2) + 
                Math.pow(y2, 2) + 
                Math.pow(z2, 2)
            )
        );
    
    const rads = Math.acos(cosAngle);
    const angel = Math.floor(rads * 180 / Math.PI);

    return angel;
}

const getAngle = (atoms) => {
    if (atoms.findIndex(el => el == undefined) > -1) return 999;

    const Ax = +atoms[0].x;
    const Ay = +atoms[0].y;
    const Az = +atoms[0].z;

    const Bx = +atoms[1].x;
    const By = +atoms[1].y;
    const Bz = +atoms[1].z;

    const Cx = +atoms[2].x;
    const Cy = +atoms[2].y;
    const Cz = +atoms[2].z;

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

const filterStaking = (stakingData) => {
    const stakingResult = { keys: [], length: 0 };

    Object.keys(stakingData).forEach(key => {
        if (stakingData[key].length > 10) {
            stakingResult[key] = stakingData[key];
            stakingResult.keys.push(key);
            stakingResult.length++;
        }
    });

    return stakingResult;
}

const parseStaking = (stakingResult) => {
    const { keys, length } = stakingResult;
    const parsedStaking = { keys, length };

    keys.forEach(key => {
        const duplicateTracer = {}
        const chain = stakingResult[key];

        const filtredChain = chain.filter(acid => {
            const { acidNumber } = acid;
            const isAcidAdded = duplicateTracer[acidNumber];

            duplicateTracer[acidNumber] = true;

            return !isAcidAdded;
        });

        const compare = (a, b) => {
            const aPosition = a.acidNumber;
            const bPosition = b.acidNumber;
          
            let comparison = 0;
            if (aPosition > bPosition) comparison = 1;
            if (aPosition < bPosition) comparison = -1;
            return comparison;
        };
        
        parsedStaking[key] = filtredChain.sort(compare);
    });

    return parsedStaking;
}

const normalizeAtom = (atom) => {
    return [
        ['ATOM'],
        [addSpace(atom[0], 6, true) + ' '],
        [addSpace(atom[1], 3, false)],
        [atom[2]],
        [atom[3]],
        [addSpace(atom[4], 3, true) + '    '],
        [addSpace(atom[5], 7, false)],
        [addSpace(atom[6], 7, false)],
        [addSpace(atom[7], 6, false) + ' '],
        [atom[8]],
        [atom[9] + '          '],
        [atom[10]]
    ];
}

const addSpace = (el, length, befor) => {
    let newEl = el;

    while (newEl.length < length) {
        if (befor) newEl = ' ' + newEl;
        if (!befor) newEl = newEl + ' ';
        
    }

    return newEl
}

const simpleWritePreporation = (parsedStaking) => {
    const allAtoms = [];

    parsedStaking.keys.forEach(chainKey => {
        parsedStaking[chainKey].forEach(acid => {
            acid.atoms.keys.forEach(atomKey => {
                allAtoms.push(atomToArry(acid.atoms[atomKey]));
            });
        });
    });

    return allAtoms.map(atom => normalizeAtom(atom).join(' ')).join('\n');
}

const atomToArry = (atom) => {
    const { atomNumber,  atomType, acidType, chain, acidNumber, x, y, z, factor, charge, defaultType } = atom;

    return [atomNumber, atomType, acidType, chain, acidNumber, x, y, z, factor, charge, defaultType ];
}


const complexWritePreporation = (parsedStaking, chains) => {
    const complexData = {
        chainsNames: parsedStaking.keys
    };

    parsedStaking.keys.forEach(chainKey => {
        let ssIndexator = 1;

        complexData[chainKey] = {};
        complexData[chainKey].SSKeys = [];
        complexData[chainKey].SSData = {};

        parsedStaking[chainKey].forEach(acid => {
            const { SSKeys, SSData } = complexData[chainKey];
            const acidChainIndex     = chains[chainKey].findIndex(chainAcid => chainAcid.acidNumber === acid.acidNumber);
            const isAtomUsed         = SSKeys.find(ssKey =>  SSData[ssKey].find(ssAcid => ssAcid.acidNumber === acid.acidNumber));

            if (isAtomUsed) {
                const acidSSkey = isAtomUsed;
                const acidSSIndex = SSData[acidSSkey].findIndex(ssAcid => ssAcid.acidNumber === acid.acidNumber);

                const ssAcidsAbove = SSData[acidSSkey].slice(0, acidSSIndex).length;
                const ssAcidsUnder = SSData[acidSSkey].slice(acidSSIndex + 1).length;

                if (ssAcidsAbove < 7) {
                    const amountNeed = 7 - ssAcidsAbove;

                    const startPosition = acidChainIndex - amountNeed > -1 ? acidChainIndex - amountNeed : 0;

                    complexData[chainKey].SSData[acidSSkey] = [
                        ...[...chains[chainKey]].slice(startPosition ,acidChainIndex),
                        ...[...SSData[acidSSkey]].slice(acidSSIndex)
                    ];
                }

                if (ssAcidsUnder < 7) {
                    const endPosition = acidChainIndex + 8;

                    complexData[chainKey].SSData[acidSSkey] = [
                        ...[...SSData[acidSSkey]].slice(0, acidSSIndex),
                        ...[...chains[chainKey]].slice(acidChainIndex, endPosition)
                    ];
                }
            } else {
                const ssNumberKey = `ss${ssIndexator}`;
                const startPoint = acidChainIndex - 7 > -1 ? acidChainIndex - 7 : 0;
                const endPoint = acidChainIndex + 8;

                complexData[chainKey].SSKeys.push(ssNumberKey);
                complexData[chainKey].SSData[ssNumberKey] = [...chains[chainKey]].slice(startPoint, endPoint);

                ssIndexator++
            }
        });
    });

    const determitedData = determite(complexData);

    return complexDataItemsToString(determitedData)
}

const determite = (complexData) => {
    complexData.chainsNames.forEach(chain => {
        const newChainSSkeys = [];

        complexData[chain].SSKeys.forEach((ss, index) => {
            const isAlfa = checkAlfa(complexData[chain].SSData[ss]);
            const isBeta = checkBeta(complexData[chain].SSData[ss]);
            const isBetaTurn = checkBetaTurn(complexData[chain].SSData[ss]);
            let SSname = ss;

            if (isAlfa) SSname = `ss${index + 1}_alpha_helix`;
            if (isBeta) SSname = `ss${index + 1}_beta_sheet`;
            if (isBetaTurn) SSname = `ss${index + 1}_beta-turn`;
                
            complexData[chain].SSData[SSname] = complexData[chain].SSData[ss];

            newChainSSkeys.push(SSname);
        });

        complexData[chain].SSKeys = newChainSSkeys;
    });

    return complexData
}

const checkAlfa = (molecule) => {
    let result = [];

    molecule.forEach((acid, index) => {
        if (index < molecule.length - 4) {
            const compareAcid = molecule[index + 4];
            const distance = getDistance(acid.atoms.C, compareAcid.atoms.N)

            if (distance < 3.5) {
                result.push(true);
            } else {
                result.push(false);
            }
        }
    });

    return result.filter(el => el).length === result.length;
}

const checkBeta = (molecule) => {
    return false
}

const checkBetaTurn = (molecule) => {
    const i1Result = [];
    const i2Result = [];
    const i3Result = [];

    molecule.forEach((acid, index) => {
        if (index < molecule.length - 1) {
            const i1compareAcid = molecule[index + 1];
            const i1distance = getDistance(acid.atoms.C, i1compareAcid.atoms.N)

            i1distance < 3.5 ? i1Result.push(true) : i1Result.push(false);

            if (index < molecule.length - 2) {
                const i2compareAcid = molecule[index + 2];
                const i2distance = getDistance(acid.atoms.C, i2compareAcid.atoms.N)

                i2distance < 3.5 ? i2Result.push(true) : i2Result.push(false);

                if (index < molecule.length - 3) {
                    const i3compareAcid = molecule[index + 3];
                    const i3distance = getDistance(acid.atoms.C, i3compareAcid.atoms.N)
    
                    i3distance < 3.5 ? i3Result.push(true) : i3Result.push(false);
                }
            }
        }
    });

    const isI1 = i1Result.filter(el => el).length === i1Result.length;
    const isI2 = i2Result.filter(el => el).length === i2Result.length;
    const isI3 = i3Result.filter(el => el).length === i3Result.length;

    return isI1 || isI2 || isI3;
}

const complexDataItemsToString = (complexData) => {
    const impovedComplexData = complexData;
    

    complexData.chainsNames.forEach(chain => {
        impovedComplexData[chain].toWriteInFile = []

        impovedComplexData[chain].SSKeys.forEach(ss => {
            let allAtoms = [];

            impovedComplexData[chain].SSData[ss].forEach(acid => {
                acid.atoms.keys.forEach(atomKey => {
                    allAtoms.push(atomToArry(acid.atoms[atomKey]));
                });
            });

            impovedComplexData[chain].toWriteInFile.push(ss);
            impovedComplexData[chain].toWriteInFile.push(allAtoms.map(atom => normalizeAtom(atom).join(' ')).join('\n'));
        });

        impovedComplexData[chain].toWriteInFile = impovedComplexData[chain].toWriteInFile.join('\n');
    });

    return impovedComplexData
}

module.exports = {
    pdbMainSorter,
    getPdbMolecules,
    getAminoAcids,
    getChains,
    getVariants,
    filterStaking,
    parseStaking,
    simpleWritePreporation,
    complexWritePreporation,
    updateAcidPropeties,
    getDistance,
    getSquareAngle,
    getAngle
}