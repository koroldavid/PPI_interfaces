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
        const [atomNumber, atomType, acidType, chain, acidNumber, x, y, z ] = atom;
        const id = `${chain}${acidType}${acidNumber}`;
        
        const isBroken = validAcids.find(type => acidType !== type)

        if (isBroken) broken.push(id);

        if (!aminoAcids[id]) aminoAcids[id] = {
            atoms: {} ,
            chain,
            acidType,
            acidNumber
        };

        if (atom.length < 11) 
        aminoAcids[id].atoms[atomType] = { atomNumber, x, y, z };
    });

    console.log(broken);

    return Object.keys(aminoAcids).map(acidId => aminoAcids[acidId]);;
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
                // console.log(acid);
                // console.log(keys)
                // console.log(centroidAtoms)
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

const getSequare = (atom) => {
    const x1 = +atom[0].x;
    const y1 = +atom[0].y;
    const z1 = +atom[0].z;

    const x2 = +atom[1].x;
    const y2 = +atom[1].y;
    const z2 = +atom[1].z;

    const x3 = +atom[2].x;
    const y3 = +atom[2].y;
    const z3 = +atom[2].z;

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

    const cos = (x1 * x2 + y1 * y2 + z1 * z2) / 
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
    const stakingResult = { stakingKeys: [], length: 0 };

    Object.keys(stakingData).forEach(key => {
        if (stakingData[key].length > 10) {
            stakingResult[key] = stakingData[key];
            stakingResult.stakingKeys.push(key);
            stakingResult.length++;
        }
    });

    return filtredData;
}

const parseStaking = (stakingResult, chains) => {
    const parsedStaking = {};

    stakingResult.stakingKeys.forEach(key => {
        const firstChain = key.slice(0, 1);
        const secondChain = key.slice(1);

        if (!parsedStaking[firstChain]) parsedStaking[firstChain] = [];
        if (!parsedStaking[secondChain]) parsedStaking[secondChain] = [];

        stakingResult[key].forEach(acidsIndexes => {
            const firstAcidIndex = acidsIndexes[0];
            const secondAcidIndex = acidsIndexes[1];

            const firstChainAcid = chains[firstChain][firstAcidIndex];
            const secondChainAcid = chains[secondChain][secondAcidIndex];

            const isFirstAcidIn = parsedStaking[firstChain].find(acid => acid[0][4] === firstChainAcid[0][4]);
            const isSecondAcidIn = parsedStaking[secondChain].find(acid => acid[0][4] === secondChainAcid[0][4]);

            if (!isFirstAcidIn) parsedStaking[firstChain].push(firstChainAcid);
            if (!isSecondAcidIn) parsedStaking[secondChain].push(secondChainAcid);
         });


        const compare = (a, b) => {
            const aPosition = a[0][4];
            const bPosition = b[0][4];
          
            let comparison = 0;
            if (aPosition > bPosition) comparison = 1;
            if (aPosition < bPosition) comparison = -1;
            return comparison;
        };

        parsedStaking[firstChain].sort(compare);
        parsedStaking[secondChain].sort(compare);
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
    let allAcids = [];
    let allAtoms = [];

    Object.keys(parsedStaking).forEach(key => {
        allAcids = [...allAcids, ...parsedStaking[key]];
    });

    allAcids.forEach(acid => {
        allAtoms = [...allAtoms, ...acid];
    });

    return allAtoms.map(atom => normalizeAtom(atom).join(' ')).join('\n');
}


const complexWritePreporation = (parsedStaking, chains) => {
    const complexData = {
        chainsNames : Object.keys(parsedStaking)
    }

    complexData.chainsNames.forEach(chain => {
        let ssIndexator = 1;
        complexData[chain] = {};
        complexData[chain].SSKeys = [];
        complexData[chain].SSData = {};


        parsedStaking[chain].forEach(atom => {
            const { SSKeys, SSData } = complexData[chain];
            const atomsChainIndex = chains[chain].findIndex(chainAtom => chainAtom[0] === atom[0]);

            const isAtomUsed = SSKeys.find(ssKey => {
                return SSData[ssKey].find(ssAtom => ssAtom === atom);
            });

            if (isAtomUsed) {
                const atomsSSkey = isAtomUsed;
                const atomsSSIndex = SSData[atomsSSkey].findIndex(ssAtom => ssAtom[0] === atom[0]);

                const ssAtomsAbove = SSData[atomsSSkey].slice(0, atomsSSIndex).length;
                const ssAtomsUnder = SSData[atomsSSkey].slice(atomsSSIndex + 1).length;

                if (ssAtomsAbove < 7) {
                    const amountNeed = 7 - ssAtomsAbove;

                    const startPosition = atomsChainIndex - amountNeed > -1 ? atomsChainIndex - amountNeed : 0;

                    complexData[chain].SSData[atomsSSkey] = [
                        ...[...chains[chain]].slice(startPosition ,atomsChainIndex),
                        ...[...SSData[atomsSSkey]].slice(atomsSSIndex)
                    ]
                }

                if (ssAtomsUnder < 7) {
                    const endPosition = atomsChainIndex + 8;

                    complexData[chain].SSData[atomsSSkey] = [
                        ...[...SSData[atomsSSkey]].slice(0, atomsSSIndex),
                        ...[...chains[chain]].slice(atomsChainIndex, endPosition)
                    ]
                }
            } else {
                const ssNumberKey = `ss${ssIndexator}`;
                const startPoint = atomsChainIndex - 7 > -1 ? atomsChainIndex - 7 : 0;
                const endPoint = atomsChainIndex + 8;

                complexData[chain].SSKeys.push(ssNumberKey);
                complexData[chain].SSData[ssNumberKey] = [...chains[chain]].slice(startPoint, endPoint);

                ssIndexator++
            }
        });
    });

    // const determitedData = determite(complexData);

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

    molecule.forEach((atom, index) => {
        if (index + 1 < molecule.length - 3) {
            const compareAtom = molecule[index + 4];

            const x1 = atom[6];
            const y1 = atom[7];
            const z1 = atom[8];

            const x2 = compareAtom[6];
            const y2 = compareAtom[7];
            const z2 = compareAtom[8];

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
    return false
}

const complexDataItemsToString = (complexData) => {
    const impovedComplexData = complexData;
    const allAtoms = {};

    complexData.chainsNames.forEach(chain => {
        impovedComplexData[chain].toWriteInFile = []

        impovedComplexData[chain].SSKeys.forEach(ss => {
            let allAtoms = [];

            impovedComplexData[chain].SSData[ss].forEach(acid => {
                allAtoms = [...allAtoms, ...acid];
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