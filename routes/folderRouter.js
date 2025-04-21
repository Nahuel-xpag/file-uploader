const express = require('express');
const { getFolder } = require('../controllers/folderController');

const folderRouter = express.Router();


// GET folder by ID
folderRouter.get('/:folderId', getFolder);
    

module.exports = folderRouter;