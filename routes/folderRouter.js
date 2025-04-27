const express = require('express');
const { getFolder, createFolderPost, deleteFolderPost, deleteFolderWithFilesPost } = require('../controllers/folderController');
//const { createFolderPost } = require('../controllers/userController');

const folderRouter = express.Router();


// GET folder by ID
folderRouter.get('/:folderId', getFolder);
// Post create a new folder in the root folder
folderRouter.post('/new-folder', createFolderPost);
// Post create a new folder in a specific folder
folderRouter.post('/new-folder/:folderId', createFolderPost);
// delete folder
folderRouter.post('/delete/:folderId', deleteFolderPost);
// delete folder with files
folderRouter.post('/delete-with-files/:folderId', deleteFolderWithFilesPost);


module.exports = folderRouter;