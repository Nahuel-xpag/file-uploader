const fs = require('fs');
const path = require('path');

//Check this later
exports.serveFiles = async (req, res) => {
    const filePath = path.join(__dirname, '../uploads', req.params.filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send('File not found');
        }

        res.sendFile(filePath);
    });
}

exports.deleteFile = async (req, res) => {
    
}