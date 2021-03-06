const fs    = require('fs');
const utils = require('./utils');

module.exports = function writeFile(pdbStructure, stakingResult) {
    const parsedStaking   = utils.parseStaking(stakingResult, pdbStructure.chains);
    const simpleFileText  = utils.simpleWritePreporation(parsedStaking);
    const complexFileText = utils.complexWritePreporation(parsedStaking, pdbStructure.chains);

    fs.writeFile(`./dataSimpleOutput/${pdbStructure.fileName}`, simpleFileText, (err) => {
        if (err) throw err;
    });

    complexFileText.chainsNames.forEach(chain => {
        const { toWriteInFile } = complexFileText[chain];

        fs.writeFile(`./dataComplexOutput/${pdbStructure.fileName}_${chain}_fragments.pdb`, toWriteInFile, (err) => {
            if (err) throw err;
        });
    });
};