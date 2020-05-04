const utils = require('./utils');
const constants = require('./constants');

module.exports = function parsePdb(pdbLines) {
    const pbdParsedObj = {};
    const pbdObjData   = utils.pdbMainSorter(pdbLines);

    // pbdParsedObj.name       = pbdObjData.HEADER.join(' ');
    // pbdParsedObj.molecules  = utils.getPdbMolecules(pbdObjData.COMPND);
    pbdParsedObj.aminoAcids = utils.getAminoAcids(pbdObjData.ATOMS, constants.validAcids);

    utils.updateAcidPropeties(pbdParsedObj.aminoAcids, constants);

    pbdParsedObj.chains = utils.getChains(pbdParsedObj.aminoAcids);

    return pbdParsedObj;
}