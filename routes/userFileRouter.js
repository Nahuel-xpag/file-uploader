const { Router } = require('express');
const multer = require('multer');
const userFileRouter = Router();
const path = require('node:path')
const fs = require('fs');
const { fileHandler, createFolderPost } = require('../controllers/userController');

//add a function to store files on its folder for the corresponding user OR DIE TRYING
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dest = path.join(process.env.FILES_PATH, String(req.user.id));
      fs.mkdirSync(dest, {recursive: true});
      cb(null, dest)
    },
    filename: function (req, file, cb) {
      const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null,  uniquePrefix + file.fieldname + '-' + file.originalname.slice(file.originalname.length - 5))
    }
  })
  
const upload = multer({ storage: storage });

userFileRouter.post("/", upload.single('fotis'), fileHandler);
userFileRouter.post("/new-folder", createFolderPost)
module.exports = userFileRouter