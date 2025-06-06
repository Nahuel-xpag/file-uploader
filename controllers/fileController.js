const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const { findFolder, createFile, deleteFile, findFile } = require('../prisma/methods');

exports.fileHandler = async (req, res) => {
    const {folderId} = req.params;
    const folder = await findFolder(parseInt(folderId, 10));
    const keyName = req.file.originalname.concat(String(req.file.id));
    /*if(!folderId){
        const currentUser = await findUser(req.user.id);
        const defaultFolderId = currentUser.folders[0].id;
        await createFile(req.file.originalname, req.file.mimetype, defaultFolderId, req.user.id, keyName);
        res.redirect("/");
    }*/
    await createFile(req.file.originalname, req.file.mimetype, req.file.size, parseInt(folderId, 10),  req.user.id, keyName);
    res.redirect(folder.name === 'root' ? "/" : "/folder/" + String(req.params.folderId));      
}

//download files
exports.downloadFileGet = async (req, res) => {
    const {fileId} = req.params;
    const file = await findFile(parseInt(fileId, 10));
    const filePath = file.path;
    res.download(filePath, file.name, (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(500).send('Error downloading file');
        } else {
            console.log('File downloaded successfully');
        }
    })
}

//serve files
exports.serveFilesGet = async (req, res) => {
    const {fileId} = req.params;
    const file = await findFile(parseInt(fileId, 10));
    const filePath = file.path;
    console.log(filePath);
    try {
        const fileInfo = await fsPromises.stat(filePath);
        if (!fileInfo.isFile()) {
          return res.status(404).send('File not found.');
        }
        // Get the mimetype from the Multer file object (if available)
        const contentType = 'image/png' //req.headers['content-type'] ?? 'application/octet-stream'; // Default if not available
    
        const fileStream = await fsPromises.readFile(filePath);
        res.setHeader('Content-Type', contentType);
        res.send(fileStream);
      } catch (error) {
        console.error('Error serving uploaded file:', error);
        res.status(404).send('File not found.');
      }
}
//delete files
exports.deleteFilePost = async (req, res) => {
    try{
        const { fileId, folderId} = req.params;
        const folder = await findFolder(parseInt(folderId, 10));
        const file = await findFile(parseInt(fileId, 10));
        const filePath = file.path
        console.log(filePath);
        await deleteFile(parseInt(fileId, 10));
        await fsPromises.rm(filePath, { recursive: true, force: true });
        
        folder.name === 'root' ?  res.redirect("/"): res.redirect("/folder/" + String(folderId));   
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}