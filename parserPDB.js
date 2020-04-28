const utils = require('./utils');

module.exports = function parsePdb(pdbLines) {
    const pbdParsedObj = {};
    const pbdObjData   = utils.pdbMainSorter(pdbLines);

    pbdParsedObj.name       = pbdObjData.HEADER.join(' ');
    pbdParsedObj.molecules  = utils.getPdbMolecules(pbdObjData.COMPND);
    pbdParsedObj.aminoAcids = utils.getAminoAcids(pbdObjData.ATOMS);
    pbdParsedObj.chains     = utils.filterAcids(utils.getChains(pbdParsedObj.aminoAcids));

    return pbdParsedObj;
}