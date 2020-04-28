const path = require('path');
const fs = require('fs');
const parsePdb = require('./parserPDB');
const staking = require('./staking');
const writeFile = require('./fileWorker');

const directoryFrom    = path.join('pdbFilesIn');
const directoryTo      = path.join('real_ppi');
const directoryToTrash = path.join('pdbFilesOutTrash');

fs.readdir(directoryFrom, (err, files) => {
    if (err) return console.log('Unable to scan directory: ' + err);

    files.forEach(file => {
        const filePath  = path.resolve(path.join(directoryFrom, file));
        const pdbString = fs.readFileSync(filePath, 'utf8');
        const pdbLines  = pdbString.split(/\r?\n/);

        const parsedPDB = parsePdb(pdbLines);
        parsedPDB.fileName = file;

        const stakingResult = staking(parsedPDB.chains);
        createLogs(file, stakingResult.logs);

        if (stakingResult.data.length) writeFile(parsedPDB, stakingResult.data);
        // if (!stakingResult.data.length) moveFile(file, directoryToTrash);

        // moveFile(file, directoryTo);
    });
});

const moveFile = (file, ToDir) =>{
    const f        = path.basename(file);
    const dest     = path.resolve(ToDir, f);
    const filePath = path.resolve(path.join(directoryFrom, f));

    fs.rename(filePath, dest, (err)=>{
        if(err) throw err;
        else console.log('Successfully moved');
    });
};

const createLogs = (fileName, logs) => {
    const name = `${fileName.slice(0, fileName.length - 4)}.txt`;

    fs.writeFile(`./Logs/${name}`, logs.join('\n'), (err) => {
        if (err) throw err;
    });
}