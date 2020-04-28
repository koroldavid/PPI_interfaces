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

const filterAcids = (chains) => {
    const chainKey = Object.keys(chains);

    chainKey.forEach(key => {
        const filtredAcids = [];

        chains[key].forEach(acid => {
            let isNormal = true
    
            acid.forEach(atom => {
                const acidType = atom[2];
                if (
                    acidType === 'ALA' ||
                    acidType === 'ARG' ||
                    acidType === 'ASN' ||
                    acidType === 'ASP' ||
                    acidType === 'CYS' ||
                    acidType === 'GLN' ||
                    acidType === 'GLU' ||
                    acidType === 'HIS' ||
                    acidType === 'ILE' ||
                    acidType === 'LEU' ||
                    acidType === 'LYS' ||
                    acidType === 'MET' ||
                    acidType === 'PHE' ||
                    acidType === 'PRO' ||
                    acidType === 'SER' ||
                    acidType === 'THR' ||
                    acidType === 'TRP' ||
                    acidType === 'TYR' ||
                    acidType === 'VAL'
                ) {
                    return true;
                } else {
                    isNormal = false;
                }
            });
    
            if (isNormal) filtredAcids.push(acid);
        });

        chains[key] = filtredAcids;
    });

    return chains;
}

const getAminoAcids = (atoms) => {
    const aminoAcids = {};

    atoms.forEach(atom => {
        const id = `${atom[3]}${atom[4]}`;

        if (!aminoAcids[id]) aminoAcids[id] = [];

        aminoAcids[id].push(atom);
    });

    return Object.keys(aminoAcids).map(acidNumber => {
        return aminoAcids[acidNumber];
    });
}

const getChains = (acids) => {
    const chains = {}

    acids.forEach(acid => {
        if (!chains[acid[0][3]]) chains[acid[0][3]] = [];
        
        chains[acid[0][3]].push(acid);
    });

    return chains;
}

const getVariants = (groupOne, groupTwo) => {
    const variants = [];

    groupOne.forEach(first => {
        groupTwo.forEach(second => variants.push([first, second]));
    });

    return variants;
};

const filterStaking = (stakingData) => {
    filtredData = { 
        length : 0,
        stakingKeys : []
    };
    stakingKeys = Object.keys(stakingData);

    stakingKeys.forEach(key => {
        if (stakingData[key].length > 10) {
            filtredData[key] = stakingData[key]
            filtredData.stakingKeys.push(key);
            filtredData.length += 1;
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
    filterAcids,
    getAminoAcids,
    getChains,
    getVariants,
    filterStaking,
    parseStaking,
    simpleWritePreporation,
    complexWritePreporation
}