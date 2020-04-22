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

const atomsFilter = (Atoms) => {
    return Atoms.filter(atom => {
        const acid = atom[2];

        if (
            acid === 'ALA' ||
            acid === 'ARG' ||
            acid === 'ASN' ||
            acid === 'ASP' ||
            acid === 'CYS' ||
            acid === 'GLN' ||
            acid === 'GLU' ||
            acid === 'HIS' ||
            acid === 'ILE' ||
            acid === 'LEU' ||
            acid === 'LYS' ||
            acid === 'MET' ||
            acid === 'PHE' ||
            acid === 'PRO' ||
            acid === 'SER' ||
            acid === 'THR' ||
            acid === 'TRP' ||
            acid === 'TYR' ||
            acid === 'VAL'
        ) return true;

        return false;
    });
}

const getChains = (Atoms) => {
    const chains = {}

    Atoms.forEach(atom => {
        if (!chains[atom[3]]) chains[atom[3]] = [];
        
        chains[atom[3]].push(atom);
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

        stakingResult[key].forEach(atomsIndexes => {
            const firstAtomIndex = atomsIndexes[0];
            const secondAtomIndex = atomsIndexes[1];

            const firstChainAtom = chains[firstChain][firstAtomIndex];
            const secondChainAtom = chains[secondChain][secondAtomIndex];

            const isFirstAtomIn = parsedStaking[firstChain].find(atom => atom[0] === firstChainAtom[0]);
            const isSecondAtomIn = parsedStaking[secondChain].find(atom => atom[0] === secondChainAtom[0]);

            if (!isFirstAtomIn) parsedStaking[firstChain].push(firstChainAtom);
            if (!isSecondAtomIn) parsedStaking[secondChain].push(secondChainAtom);
         });


        const compare = (a, b) => {
            const aPosition = a[0]
            const bPosition = b[0]
          
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

const simpleWritePreporation = (parsedStaking) => {
    let allAtoms = [];

    Object.keys(parsedStaking).forEach(key => {
        allAtoms = [...allAtoms, ...parsedStaking[key]];
    });

    return allAtoms.map(atom => atom.join(' ')).join('\n');
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

    return complexDataItemsToString(complexData)
}

const complexDataItemsToString = (complexData) => {
    const impovedComplexData = complexData;

    complexData.chainsNames.forEach(chain => {
        impovedComplexData[chain].toWriteInFile = []

        impovedComplexData[chain].SSKeys.forEach(ss => {
            impovedComplexData[chain].toWriteInFile.push(ss);
            impovedComplexData[chain].toWriteInFile.push(impovedComplexData[chain].SSData[ss].map(atom => atom.join(' ')).join('\n'));
        });

        impovedComplexData[chain].toWriteInFile = impovedComplexData[chain].toWriteInFile.join('\n');
    });

    return impovedComplexData
}

module.exports = {
    pdbMainSorter,
    getPdbMolecules,
    atomsFilter,
    getChains,
    getVariants,
    filterStaking,
    parseStaking,
    simpleWritePreporation,
    complexWritePreporation
}