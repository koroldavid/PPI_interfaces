const utils = require('./utils');

module.exports = function parsePdb(pdbLines) {
    const pbdParsedObj = {};
    const pbdObjData   = utils.pdbMainSorter(pdbLines);

    pbdParsedObj.molecules = utils.getPdbMolecules(pbdObjData.COMPND);
    pbdParsedObj.atoms     = utils.atomsFilter(pbdObjData.ATOMS);
    pbdParsedObj.chains    = utils.getChains(pbdParsedObj.atoms);

    return pbdParsedObj;
}